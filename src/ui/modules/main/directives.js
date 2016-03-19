/**
 * Created by hao on 15/11/5.
 */

define('main/directives', ['main/init'], function () {

    /**
     * Clear ng-view template cache
     */
    function ngView($route, $templateCache, $routeParams) {
        return {
            restrict: 'A',
            priority: -500,
            link: function ($scope, $element) {
                $templateCache.remove($route.current.loadedTemplateUrl);
                $scope.mainStatus.pageParams = $routeParams;
            }
        };
    };
    ngView.$inject = ["$route", "$templateCache", "$routeParams"];

    /**
     * 转换日期
     */
    function convertToDate($filter) {
        var dateFilter = $filter('date');
        return {
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                var _format = $attrs.convertToDate ? $attrs.convertToDate : "yyyy-MM-dd";

                ngModel.$parsers.push(function (val) {
                    return dateFilter(val, _format);
                });
                ngModel.$formatters.push(function () {
                    return new Date(ngModel.$modelValue);
                });
            }
        };
    };
    convertToDate.$inject = ['$filter'];

    /**
     * 转换为数字
     */
    function convertToNumber() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return parseInt(val, 10);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    };
    convertToNumber.$inject = [];

    /**
     * detailsInfo
     */
    function detailsInfo(requestData) {
        return {
            restrict: 'AE',
            scope: true,
            transclude: true,
            link: function ($scope, $element, $attrs, $ctrls, $transclude) {
                $scope.isLoading = false;

                $transclude($scope, function (clone) {
                    $element.append(clone);
                });

                $scope.detailsHandler = $scope.$eval($attrs.detailsHandler);

                if ($attrs.detailsParams) {
                    if ($attrs.detailsParams.indexOf("{") == 0) {
                        //监听具体值
                        $attrs.$observe("detailsParams", function (value) {
                            getData($scope.$eval(value));
                        });
                    } else {
                        //监听对象
                        $scope.$watch($attrs.detailsParams, function (value) {
                            getData(value);
                        }, true);
                    }
                } else {
                    $attrs.$observe("detailsInfo", function (value) {
                        getData({});
                    });
                }

                function getData(params) {
                    $scope.isLoading = true;
                    requestData($attrs.detailsInfo, params)
                        .then(function (results) {
                            var data = results[0];
                            $scope.isLoading = false;
                            if ($scope.detailsHandler) {
                                $scope.details = $scope.detailsHandler(data);
                            } else {
                                $scope.details = data;
                            }
                        })
                        .catch(function () {
                            $scope.details = {};
                            $scope.isLoading = false;
                        });
                }
            }
        };
    };
    detailsInfo.$inject = ["requestData"];

    /**
     * 表单验证
     */
    function formValidator(requestData, modal) {
        return {
            restrict: 'A',
            scope: true,
            link: function ($scope, $element, $attrs) {
                var formStatus = $scope.formStatus = {
                    submitted: false,
                    submitting: false,
                    submitInfo: ""
                };
                var DOMForm = angular.element($element)[0];
                var scopeForm = $scope.$eval($attrs.name);
                var dialogData = $scope.ngDialogData;

                $scope.formData = angular.extend({}, $scope.formData);

                $scope.$watch($attrs.source, function (value) {
                    if (value && angular.isObject(value)) {
                        angular.extend($scope.formData, value);
                    }
                });

                $scope.reset = function () {
                    DOMForm.reset();
                };

                $element.on("submit", function (e) {
                    e.preventDefault();
                    formStatus.submitting = true;
                    requestData($attrs.action, $scope.formData)
                        .then(function (results) {
                            var data = results[0];
                            formStatus.submitting = false;
                            formStatus.submitInfo = "";
                            if (angular.isFunction($scope.submitCallBack)) {
                                $scope.submitCallBack.call($scope, dialogData, data);
                            } else if (data && data.url) {
                                window.location.assign(data.url);
                            }
                            //自动关闭弹窗
                            angular.isDefined($attrs.autoCloseDialog) && modal.close();
                        })
                        .catch(function (error) {
                            formStatus.submitting = false;
                            formStatus.submitInfo = error || '提交失败。';
                            angular.isFunction($scope.submitCallBack) && $scope.submitCallBack.call($scope, dialogData, "");
                        });
                })
            }
        }
    };
    formValidator.$inject = ["requestData", "modal"];

    /**
     * 表格
     */
    function tableList(requestData, modal, dialogConfirm, $timeout) {
        return {
            restrict: 'AE',
            scope: {
                listParams: "=?",
                listSelected: "=?",
                listSource: "=?"
            },
            transclude: true,
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel, $transclude) {
                var statusInfo = {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 10,
                    totalPage: 1,
                    isFinished: false,
                    isLoading: false
                };
                $scope.parent = $scope.$parent;
                $scope.status = statusInfo;
                $scope.listData = $attrs.listData;
                $scope.theadList = angular.fromJson($attrs.listThead);
                $scope.tbodyList = [];
                $scope.getListData = getListData;
                if (!angular.isDefined($scope.listParams)) {
                    $scope.listParams = {};
                }
                if (!angular.isDefined($scope.listSelected)) {
                    $scope.listSelected = [];
                }

                //批量删除
                $scope.delSelected = function (_url) {
                    dialogConfirm('确定删除这些?', function () {
                        requestData(_url, {ids: $scope.listSelected.join(",")})
                            .then(function () {
                                $scope.$broadcast("reloadList");
                            })
                            .catch(function (error) {
                                alert(error || '删除错误');
                            });
                    });
                };
                //单个删除
                $scope.deleteThis = function (_url) {
                    var _tr = this.tr;
                    dialogConfirm('确定删除?', function () {
                        requestData(_url, {id: _tr.id})
                            .then(function () {
                                $scope.tbodyList.splice($scope.tbodyList.indexOf(_tr), 1);
                                if ($scope.tbodyList.length == 0) {
                                    $scope.$broadcast("reloadList");
                                }
                            })
                            .catch(function (error) {
                                alert(error || '删除错误');
                            });
                    });
                };
                //选择当个
                $scope.selectThis = function () {
                    var _tr = this.tr;
                    var _index = $scope.tbodyList.indexOf(_tr);
                    var $tr = $element.find("tbody tr");
                    $tr.removeClass("on").eq(_index).addClass("on");
                    ngModel && ngModel.$setViewValue(angular.copy(_tr));
                };
                //改变状态
                $scope.changeStatus = function (_url, _text) {
                    var _tr = this.tr;
                    dialogConfirm(_text || '确定?', function () {
                        requestData(_url, {id: _tr.id})
                            .then(function (results) {
                                var _data = results[0];
                                var _index = $scope.tbodyList.indexOf(_tr);
                                $scope.tbodyList[_index] = _data;
                            })
                            .catch(function (error) {
                                alert(error || '请求失败!');
                            });
                    });
                };

                //弹窗修改后的回调
                $scope.submitCallBack = function (_curRow, _data) {
                    modal.closeAll();
                    if (_data && _curRow) { //修改
                        angular.forEach($scope.tbodyList, function (_row, _index) {
                            if (_row.id == _curRow.id) {
                                $scope.tbodyList[_index] = _data;
                            }
                        });
                    } else {
                        $timeout(function () {
                            $scope.$broadcast("reloadList");
                        });
                    }
                };

                var formData = {};

                function getListData(_callback) {
                    if ($attrs.listSource) {
                        $scope.tbodyList = $scope.listSource;
                        _callback && _callback();
                        return;
                    }
                    statusInfo.isLoading = true;
                    requestData($scope.listData, angular.merge({}, formData, {page: statusInfo.currentPage}))
                        .then(function (results) {
                            var data = results[1];
                            if (data.code == 200) {
                                if (data.options) {
                                    statusInfo.totalCount = data.options.totalCount || statusInfo.totalCount;
                                    statusInfo.pageSize = data.options.pageSize || statusInfo.pageSize;
                                    statusInfo.totalPage = Math.ceil(statusInfo.totalCount / statusInfo.pageSize);
                                }

                                if (data.thead) {
                                    $scope.theadList = data.thead;
                                }

                                if (data.data && data.data.length > 0) {
                                    $scope.tbodyList = data.data;
                                } else {
                                    statusInfo.isFinished = true;
                                }
                                statusInfo.loadFailMsg = data.message;
                            } else {
                                statusInfo.isFinished = true;
                                statusInfo.loadFailMsg = data.message;
                            }
                            statusInfo.isLoading = false;
                            $timeout(bindSelectOneEvent);
                            _callback && _callback();
                        })
                        .catch(function () {
                            statusInfo.isLoading = false;
                            statusInfo.loadFailMsg = '加载出错';
                            _callback && _callback();
                        })
                };

                //设置值
                function setSelectedValue() {
                    //listSelected
                    var _checked = [];
                    $scope.listSelected.length = 0;
                    $(".selectOne:checked", $element).each(function () {
                        _checked.push(this.value);
                    });
                    [].unshift.apply($scope.listSelected, _checked);

                    //ngModel
                    var _selected = [];
                    angular.forEach($scope.tbodyList, function (ls) {
                        angular.forEach($scope.listSelected, function (selected) {
                            if (ls.id == selected) {
                                _selected.push(ls);
                            }
                        })
                    });
                    ngModel && ngModel.$setViewValue(_selected);
                };
                //删除值
                $scope.$on("deleteSelected", function (event, selected) {
                    $(".selectOne[value=" + selected.id + "]", $element).prop("checked", false);

                    var _selectCount = $(".selectOne", $element).length;
                    var _checkedCount = $(".selectOne:checked", $element).length;
                    if (_checkedCount > 0 && _checkedCount < _selectCount) {
                        $(".selectAll", $element).prop("checked", false).get(0).indeterminate = true;
                    } else if (_selectCount == _checkedCount) {
                        $(".selectAll", $element).prop("checked", true).get(0).indeterminate = false;
                    } else {
                        $(".selectAll", $element).prop("checked", false).get(0).indeterminate = false;
                    }

                    var _checked = [];
                    $scope.listSelected.length = 0;
                    $(".selectOne:checked", $element).each(function () {
                        _checked.push(this.value);
                    });
                    [].unshift.apply($scope.listSelected, _checked);
                    setSelectedValue();
                });

                //直接来自源
                $scope.$watchCollection("listSource", function (value) {
                    if (value) {
                        getListData(setSelectedValue);
                    }
                });

                //
                $scope.$watch("listParams", function () {
                    statusInfo.currentPage = 1;
                    statusInfo.isFinished = false;
                    $scope.tbodyList = [];
                    formData = angular.copy($scope.listParams);
                    getListData(setSelectedValue);
                    //清除选择框
                    $(".selectAll", $element).length > 0 && ($(".selectAll", $element).prop("checked", false).get(0).indeterminate = false);
                }, true);

                //接受广播
                $scope.$on("reloadList", function () {
                    statusInfo.currentPage = 1;
                    statusInfo.isFinished = false;
                    $scope.tbodyList = [];
                    formData = angular.copy($scope.listParams);
                    getListData(setSelectedValue);
                    //清除选择框
                    $(".selectAll", $element).length > 0 && ($(".selectAll", $element).prop("checked", false).get(0).indeterminate = false);
                });


                $($element)
                //全选
                    .on("click", ".selectAll", function () {
                        if (this.indeterminate) {
                            this.checked = false;
                            $(".selectOne", $element).prop("checked", false);
                        } else {
                            $(".selectOne", $element).prop("checked", this.checked);
                        }

                        setSelectedValue();
                        $scope.$apply();
                    });

                //选择单个
                function bindSelectOneEvent() {
                    $(".selectOne", $element).on("click", function (e) {
                        e.stopPropagation();
                        var _selectCount = $(".selectOne", $element).length;
                        var _checkedCount = $(".selectOne:checked", $element).length;
                        if (_checkedCount > 0 && _checkedCount < _selectCount) {
                            $(".selectAll", $element).prop("checked", false).get(0).indeterminate = true;
                        } else if (_selectCount == _checkedCount) {
                            $(".selectAll", $element).prop("checked", true).get(0).indeterminate = false;
                        } else {
                            $(".selectAll", $element).prop("checked", false).get(0).indeterminate = false;
                        }

                        setSelectedValue();
                        $scope.$apply();
                    });
                }

                $transclude($scope, function (clone) {
                    $element.append(clone);
                });
            }
        };
    };
    tableList.$inject = ['requestData', 'modal', 'dialogConfirm', '$timeout'];

    /**
     * 表格 单元格
     */
    function tableCell() {
        return {
            restrict: 'AE',
            scope: {row: "="},
            replace: true,
            templateUrl: 'tpl/table-cell.html',
            link: function ($scope, $element, $attrs) {
                $scope.cells = [];
                if (angular.isString($scope.row) || angular.isNumber($scope.row)) {
                    $scope.cells.push({text: $scope.row});
                } else if (angular.isArray($scope.row)) {
                    angular.forEach($scope.row, function (_value) {
                        if (angular.isObject(_value)) {
                            $scope.cells.push(_value);
                        } else {
                            $scope.cells.push({text: _value});
                        }
                    });
                } else {
                    $scope.cells.push($scope.row);
                }
            }
        }
    }

    /**
     * 分页
     */
    function pagination() {
        return {
            restrict: 'AE',
            scope: true,
            replace: true,
            templateUrl: 'tpl/pagination.html',
            link: function ($scope, $element, $attrs) {
                var maxSize = angular.isDefined($attrs.maxSize) ? $scope.$parent.$eval($attrs.maxSize) : 10,
                    rotate = angular.isDefined($attrs.rotate) ? $scope.$parent.$eval($attrs.rotate) : true;

                $scope.start = function () {
                    if ($scope.status.currentPage == 1) {
                        return;
                    }
                    $scope.status.currentPage = 1;
                    $scope.getListData();
                };
                $scope.prev = function () {
                    if ($scope.status.currentPage <= 1) {
                        return;
                    }
                    $scope.status.currentPage--;
                    $scope.getListData();
                };
                $scope.next = function () {
                    if ($scope.status.currentPage >= $scope.status.totalPage) {
                        return;
                    }
                    $scope.status.currentPage++;
                    $scope.getListData();
                };
                $scope.end = function () {
                    if ($scope.status.currentPage == $scope.status.totalPage) {
                        return;
                    }
                    $scope.status.currentPage = $scope.status.totalPage;
                    $scope.getListData();
                };
                $scope.goto = function (_page) {
                    $scope.status.currentPage = _page;
                    $scope.getListData();
                };

                $scope.$watch("status.totalPage", function () {
                    $scope.pages = getPages($scope.status.currentPage, $scope.status.totalPage);
                });
                $scope.$watch("status.currentPage", function () {
                    $scope.pages = getPages($scope.status.currentPage, $scope.status.totalPage);
                });

                function makePage(number, text, isActive) {
                    return {
                        number: number,
                        text: text,
                        active: isActive
                    };
                }

                function getPages(currentPage, totalPages) {
                    var pages = [];

                    // Default page limits
                    var startPage = 1, endPage = totalPages;
                    var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

                    // recompute if maxSize
                    if (isMaxSized) {
                        if (rotate) {
                            // Current page is displayed in the middle of the visible ones
                            startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
                            endPage = startPage + maxSize - 1;

                            // Adjust if limit is exceeded
                            if (endPage > totalPages) {
                                endPage = totalPages;
                                startPage = endPage - maxSize + 1;
                            }
                        } else {
                            // Visible pages are paginated with maxSize
                            startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

                            // Adjust last page if limit is exceeded
                            endPage = Math.min(startPage + maxSize - 1, totalPages);
                        }
                    }

                    // Add page number links
                    for (var number = startPage; number <= endPage; number++) {
                        var page = makePage(number, number, number === currentPage);
                        pages.push(page);
                    }

                    // Add links to move between page sets
                    if (isMaxSized && !rotate) {
                        if (startPage > 1) {
                            var previousPageSet = makePage(startPage - 1, '...', false);
                            pages.unshift(previousPageSet);
                        }

                        if (endPage < totalPages) {
                            var nextPageSet = makePage(endPage + 1, '...', false);
                            pages.push(nextPageSet);
                        }
                    }

                    return pages;
                }
            }
        }
    }

    /**
     * 分页2
     */
    function pagination2() {
        return {
            restrict: 'AE',
            scope: true,
            replace: true,
            templateUrl: 'tpl/pagination2.html',
            link: function ($scope, $element, $attrs) {
                $scope.start = function () {
                    if ($scope.status.currentPage == 1) {
                        return;
                    }
                    $scope.status.currentPage = 1;
                    $scope.getListData();
                };
                $scope.prev = function () {
                    if ($scope.status.currentPage <= 1) {
                        return;
                    }
                    $scope.status.currentPage--;
                    $scope.getListData();
                };
                $scope.next = function () {
                    if ($scope.status.currentPage >= $scope.status.totalPage) {
                        return;
                    }
                    $scope.status.currentPage++;
                    $scope.getListData();
                };
                $scope.end = function () {
                    if ($scope.status.currentPage == $scope.status.totalPage) {
                        return;
                    }
                    $scope.status.currentPage = $scope.status.totalPage;
                    $scope.getListData();
                };
            }
        }
    }

    /**
     * 筛选
     */
    function filterConditions(requestData) {
        return {
            restrict: 'AE',
            scope: {},
            transclude: true,
            link: function ($scope, $element, $attrs, $ctrls, $transclude) {
                //筛选
                //var listParams = $scope.$eval($attrs.ngModel);
                $scope.filterParams = {};
                $scope.filterConditions = {list: []};
                var filterConditions = $scope.filterConditions;
                $scope.conditionList = {};

                $scope.selectCondition = function (_name, _item) {
                    _item.type = _name;
                    filterConditions[_name] = _item;
                    filterConditions.list.push(_item);
                    updataListParams();
                };

                $scope.deleteCondition = function (_this) {
                    var _index = filterConditions.list.indexOf(_this);
                    filterConditions.list.splice(_index, 1);
                    delete filterConditions[_this.type];
                    updataListParams();
                };

                //
                function updataListParams() {
                    var _data = {};
                    angular.forEach($scope.filterConditions.list, function (condition) {
                        _data[condition.type] = condition.id;
                    });
                    $scope.filterParams = _data;
                }

                //获取筛选条件
                if ($attrs.filterConditions) {
                    (function () {
                        requestData($attrs.filterConditions)
                            .then(function (results) {
                                var _data = results[0];
                                $scope.conditionList = _data;
                            })
                    })();
                }

                $transclude($scope, function (clone) {
                    $element.append(clone);
                });
            }
        }
    };
    filterConditions.$inject = ["requestData"];

    /**
     * 树状列表
     */
    function treeList(requestData, $timeout) {
        return {
            restrict: 'AE',
            scope: {},
            require: "?^ngModel",
            templateUrl: 'tpl/tree.html',
            link: function ($scope, $element, $attrs, ngModel) {
                var isFirstLoad = true;
                $scope.status = {};
                $scope.treeList = [];
                $scope.curTree = {};
                $scope.status.isLoading = true;

                $scope.selectTree = function (tree, e) {
                    var $li = $element.find("li");
                    var $em = $(e.currentTarget);
                    var $parentLi = $em.parent("li");
                    var _tree = angular.copy(tree);
                    if (_tree.nodes.length == 0) {
                        $li.removeClass("on");
                        $parentLi.addClass("on");
                        ngModel && ngModel.$setViewValue(_tree);
                    } else {
                        if ($parentLi.hasClass("fold")) {
                            $parentLi.removeClass("fold");
                        } else {
                            $parentLi.addClass("fold");
                        }
                    }
                };

                function buildTree(data) {
                    var pos = {};
                    var tree = [];
                    var i = 0;
                    while (data.length != 0) {
                        if (data[i].pid == "0") {
                            var _obj = angular.copy(data[i]);
                            _obj.nodes = [];
                            tree.push(_obj);
                            pos[data[i].id] = [tree.length - 1];
                            data.splice(i, 1);
                            i--;
                        } else {
                            var posArr = pos[data[i].pid];
                            if (posArr != undefined) {

                                var obj = tree[posArr[0]];
                                for (var j = 1; j < posArr.length; j++) {
                                    obj = obj.nodes[posArr[j]];
                                }

                                var _obj = angular.copy(data[i]);
                                _obj.nodes = [];
                                obj.nodes.push(_obj);

                                pos[data[i].id] = posArr.concat([obj.nodes.length - 1]);
                                data.splice(i, 1);
                                i--;
                            }
                        }
                        i++;
                        if (i > data.length - 1) {
                            i = 0;
                        }
                    }

                    return tree;
                }

                function getTreeData() {
                    $scope.status.isLoading = true;
                    requestData($attrs.treeList)
                        .then(function (results) {
                            var data = results[0];
                            $scope.treeList = buildTree(data);
                            $scope.status.isLoading = false;
                            if (isFirstLoad && angular.isDefined($attrs.selectFirst)) {
                                isFirstLoad = false;
                                $timeout(function () {
                                    var $em = $element.find("em");
                                    for (var i = 0, l = $em.length; i < l; i++) {
                                        $em.eq(i).trigger("click");
                                        if ($em.eq(i).next("ul").length == 0) {
                                            break;
                                        }
                                    }
                                })
                            }
                        })
                        .catch(function () {
                            $scope.status.isLoading = false;
                        });
                }

                $attrs.$observe("treeList", getTreeData)
            }
        }
    };
    treeList.$inject = ["requestData", "$timeout"];

    /**
     * 树状列表2
     */
    function treeList2(requestData, modal, $timeout) {
        return {
            restrict: 'AE',
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
                $scope.status = {};
                $scope.treeList = [];
                $scope.curTree = {};
                $scope.status.isLoading = true;

                $scope.selectTree = function (tree, e) {
                    var $li = $element.find("li");
                    var $em = $(e.currentTarget);
                    var $parentLi = $em.parent("li");
                    var _tree = angular.copy(tree);
                    if (_tree.nodes.length == 0) {
                        $li.removeClass("on");
                        $parentLi.addClass("on");
                        ngModel && ngModel.$setViewValue(_tree);
                    } else {
                        if ($parentLi.hasClass("fold")) {
                            $parentLi.removeClass("fold");
                        } else {
                            $parentLi.addClass("fold");
                        }
                    }
                };

                $scope.extendTree = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $this = $(e.currentTarget);
                    if ($this.hasClass("on")) {
                        $this.removeClass("on");
                        $this.parent().next().hide();
                    } else {
                        $this.addClass("on");
                        $this.parent().next().show();
                    }
                };

                function buildTree(data) {
                    var pos = {};
                    var tree = [];
                    var i = 0;
                    while (data.length != 0) {
                        if (data[i].pid == "0") {
                            var _obj = angular.copy(data[i]);
                            _obj.nodes = [];
                            tree.push(_obj);
                            pos[data[i].id] = [tree.length - 1];
                            data.splice(i, 1);
                            i--;
                        } else {
                            var posArr = pos[data[i].pid];
                            if (posArr != undefined) {

                                var obj = tree[posArr[0]];
                                for (var j = 1; j < posArr.length; j++) {
                                    obj = obj.nodes[posArr[j]];
                                }

                                var _obj = angular.copy(data[i]);
                                _obj.nodes = [];
                                obj.nodes.push(_obj);

                                pos[data[i].id] = posArr.concat([obj.nodes.length - 1]);
                                data.splice(i, 1);
                                i--;
                            }
                        }
                        i++;
                        if (i > data.length - 1) {
                            i = 0;
                        }
                    }

                    return tree;
                }

                function getTreeData() {
                    $scope.status.isLoading = true;
                    requestData($attrs.treeList2)
                        .then(function (results) {
                            var data = results[0];
                            $scope.treeList = buildTree(data);
                            $scope.status.isLoading = false;
                        })
                        .catch(function () {
                            $scope.status.isLoading = false;
                        });
                }

                $attrs.$observe("treeList2", getTreeData);

                //弹窗修改后的回调
                $scope.submitCallBack = function (_curRow, _data) {
                    modal.closeAll();
                    getTreeData();
                };
            }
        }
    };
    treeList2.$inject = ["requestData", "modal", "$timeout"];

    /**
     * 导航列表
     */
    function navList(requestData) {
        return {
            restrict: 'AE',
            scope: true,
            transclude: true,
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel, $transclude) {
                $transclude($scope, function (clone) {
                    $element.append(clone);
                });

                var statusInfo = {
                    isLoading: true
                };
                $scope.status = statusInfo;
                $scope.currentSelect = {};

                var formData = {};

                $scope.select = function (_project) {
                    $scope.currentSelect = _project;
                    ngModel && ngModel.$setViewValue(_project);
                };

                function getListData(_callback) {
                    if ($attrs.listSource) {
                        $scope.tbodyList = $scope.listSource;
                        _callback && _callback();
                        return;
                    }
                    statusInfo.isLoading = true;

                    requestData($attrs.navList)
                        .then(function (results) {
                            var data = results[0];
                            $scope.isLoading = false;
                            $scope.listData = data.data;
                            $scope.select($scope.listData[0]);
                        })
                        .catch(function () {
                            $scope.isLoading = false;
                        });
                };

                getListData();
            }
        }
    };
    navList.$inject = ["requestData"];

    /**
     * 异步下拉
     */
    function selectAsync(requestData) {
        return {
            restrict: 'A',
            scope: {},
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {

                requestData($attrs.selectAsync)
                    .then(function (results) {
                        var data = results[0];
                        var _options = '<option value="">请选择</option>';
                        var _length = data.length;
                        for (var i = 0; i < _length; i++) {
                            _options += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
                        }
                        $element.html(_options);
                        ngModel && $element.val(ngModel.$viewValue);
                    });
            }
        }
    };
    selectAsync.$inject = ["requestData"];

    /**
     * 级联下拉
     */
    function relativeSelect(requestData, $timeout) {
        return {
            restrict: 'A',
            scope: {},
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
                var _relativeTo = $attrs.relativeTo;
                var _relativeSelect = $attrs.relativeSelect;
                var isSelectFirst = angular.isDefined($attrs.selectFirst);
                var relativeInitload = angular.isDefined($attrs.relativeInitload);

                $element.on("change", changeHandle);

                $element.on("update", function (e, _data) {
                    getData(_data);
                });

                function changeHandle() {
                    var _data = {};
                    _data[$element[0].name] = $element.val();
                    $(_relativeTo).trigger("update", _data);
                }

                function getData(_data) {
                    requestData(_relativeSelect, _data)
                        .then(function (results) {
                            var data = results[0];
                            var _options = isSelectFirst ? '' : '<option value="">请选择</option>';
                            var _length = data.length;
                            var _value = "";
                            for (var i = 0; i < _length; i++) {
                                if (data[i].selected || (isSelectFirst && i == 0)) {
                                    _value = data[i].value;
                                }
                                _options += '<option ' + (data[i].enabled === 0 ? ' class="text-muted"' : '') + ' value="' + data[i].value + '">' + data[i].text + '</option>';
                            }
                            $element.html(_options);
                            //$element.trigger("change");
                            $element.val(_value);
                            ngModel && ngModel.$setViewValue(_value);
                            changeHandle();
                        });
                }

                if (relativeInitload) {
                    $timeout(changeHandle);
                }
            }
        }
    };
    relativeSelect.$inject = ["requestData", "$timeout"];

    /**
     * 图表
     */
    function eChart(requestData, dialogChart) {
        return {
            restrict: 'A',
            scope: {
                clickToUrl: "@",
                clickToDialog: "@",
                chartParams: "="
            },
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
                $scope.isLoading = false;

                require(['echarts'], function (echarts) {
                    var myChart = echarts.init($element[0]);

                    function reSize() {
                        myChart.resize();
                    };
                    $(window).on("resize", reSize);
                    $scope.$on('$destroy', function () {
                        $(window).off("resize", reSize);
                        myChart.dispose();
                    });

                    myChart.on("click", function (_data) {
                        ngModel && ngModel.$setViewValue(_data.data);
                        if ($scope.clickToUrl) {
                            window.location.assign($scope.clickToUrl);
                        } else if ($scope.clickToDialog) {
                            dialogChart($scope.$parent.mainConfig.viewsDir + $scope.clickToDialog);
                        }
                    });

                    if (angular.isDefined($attrs.chartParams)) {
                        //监听具体值
                        $scope.$watch("chartParams", function (value) {
                            loadChart($attrs.chart, value);
                        }, true);
                    } else {
                        $attrs.$observe("chart", function (value) {
                            loadChart($attrs.chart);
                        });
                        loadChart($attrs.chart);
                    }

                    function loadChart(_url, _params) {
                        if ($scope.isLoading) {
                            return;
                        }
                        $scope.isLoading = true;
                        myChart.showLoading();
                        requestData(_url, _params)
                            .then(function (results) {
                                var _data = results[0];
                                myChart.hideLoading();
                                //解决百度图表雷达图 Tip 显示不正确的问题
                                if (_data.polar) {
                                    _data.tooltip.formatter = function (_items) {
                                        var _str = _items[0].name;
                                        angular.forEach(_items, function (_item) {
                                            _str += '<br>' + _item.seriesName + ": " + _item.data;
                                        });
                                        return _str;
                                    }
                                } else {
                                    if (_data.tooltip.formatter && _data.tooltip.formatter.indexOf("function") == 0) {
                                        _data.tooltip.formatter = eval("(" + _data.tooltip.formatter + ")");
                                    }
                                }
                                myChart.setOption(_data);
                                $scope.isLoading = false;
                            })
                            .catch(function (_msg) {
                                $scope.isLoading = false;
                                myChart.hideLoading();
                            });
                    };
                });
            }
        };
    };
    eChart.$inject = ["requestData", "dialogChart"];

    /**
     * 自动补全
     */
    function angucomplete($parse, requestData, $sce, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                "placeholder": "@",
                "selectedItem": "=?",
                "url": "@",
                "titleField": "@",
                "descriptionField": "@",
                //"localData": "=?",
                "searchFields": "@",
                "matchClass": "@"
            },
            require: "?^ngModel",
            templateUrl: 'tpl/autocomplete.html',
            link: function ($scope, elem, attrs, ngModel) {
                $scope.lastSearchTerm = null;
                $scope.currentIndex = null;
                $scope.justChanged = false;
                $scope.searchTimer = null;
                $scope.hideTimer = null;
                $scope.searching = false;
                $scope.pause = 300;
                $scope.minLength = 1;
                $scope.searchStr = null;

                var isNewSearchNeeded = function (newTerm, oldTerm) {
                    return newTerm.length >= $scope.minLength && newTerm != oldTerm
                };

                $scope.processResults = function (responseData, str) {
                    if (responseData && responseData.length > 0) {
                        $scope.results = [];

                        var titleFields = [];
                        if ($scope.titleField && $scope.titleField != "") {
                            titleFields = $scope.titleField.split(",");
                        }

                        for (var i = 0; i < responseData.length; i++) {
                            // Get title variables
                            var titleCode = [];

                            for (var t = 0; t < titleFields.length; t++) {
                                titleCode.push(responseData[i][titleFields[t]]);
                            }

                            var description = "";
                            if ($scope.descriptionField) {
                                description = responseData[i][$scope.descriptionField];
                            }

                            var text = titleCode.join(' ');
                            if ($scope.matchClass) {
                                var re = new RegExp(str, 'i');
                                var strPart = text.match(re)[0];
                                text = $sce.trustAsHtml(text.replace(re, '<span class="' + $scope.matchClass + '">' + strPart + '</span>'));
                            }

                            var resultRow = {
                                id: responseData[i].id,
                                title: text,
                                description: description,
                                //image: image,
                                originalObject: responseData[i]
                            };

                            $scope.results[$scope.results.length] = resultRow;
                        }


                    } else {
                        $scope.results = [];
                    }
                };

                $scope.searchTimerComplete = function (str) {
                    // Begin the search

                    if (str.length >= $scope.minLength) {
                        if ($scope.localData) {
                            var searchFields = $scope.searchFields.split(",");

                            var matches = [];

                            for (var i = 0; i < $scope.localData.length; i++) {
                                var match = false;

                                for (var s = 0; s < searchFields.length; s++) {
                                    match = match || (typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                                }

                                if (match) {
                                    matches[matches.length] = $scope.localData[i];
                                }
                            }

                            $scope.searching = false;
                            $scope.processResults(matches, str);

                        } else {
                            requestData($scope.url, {q: str})
                                .then(function (results) {
                                    var data = results[0];
                                    $scope.searching = false;
                                    $scope.processResults(data, str);
                                })
                                .catch(function (error) {
                                    $scope.searching = false;
                                    console.error(error);
                                });
                        }
                    }
                };

                $scope.hideResults = function () {
                    $scope.hideTimer = $timeout(function () {
                        $scope.showDropdown = false;
                    }, $scope.pause);
                };

                $scope.resetHideResults = function () {
                    if ($scope.hideTimer) {
                        $timeout.cancel($scope.hideTimer);
                    }
                };

                $scope.hoverRow = function (index) {
                    $scope.currentIndex = index;
                };

                $scope.keyPressed = function (event) {
                    if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                        if (!$scope.searchStr || $scope.searchStr == "") {
                            $scope.showDropdown = false;
                            $scope.lastSearchTerm = null
                        } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                            $scope.lastSearchTerm = $scope.searchStr;
                            $scope.showDropdown = true;
                            $scope.currentIndex = -1;
                            $scope.results = [];

                            if ($scope.searchTimer) {
                                $timeout.cancel($scope.searchTimer);
                            }

                            $scope.searching = true;

                            $scope.searchTimer = $timeout(function () {
                                $scope.searchTimerComplete($scope.searchStr);
                            }, $scope.pause);
                        }
                    } else {
                        event.preventDefault();
                    }
                };

                $scope.selectResult = function (result) {
                    if ($scope.matchClass) {
                        result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                    }
                    $scope.searchStr = $scope.lastSearchTerm = result.title;
                    $scope.selectedItem = result;
                    $scope.showDropdown = false;
                    $scope.results = [];
                    ngModel && ngModel.$setViewValue(result.id);
                };

                var inputField = elem.find('input');

                inputField.on('keyup', $scope.keyPressed);

                elem.on("keyup", function (event) {
                    if (event.which === 40) {
                        if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                            $scope.currentIndex++;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                        $scope.$apply();
                    } else if (event.which == 38) {
                        if ($scope.currentIndex >= 1) {
                            $scope.currentIndex--;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 13) {
                        if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                            $scope.selectResult($scope.results[$scope.currentIndex]);
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        } else {
                            $scope.results = [];
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 27) {
                        $scope.results = [];
                        $scope.showDropdown = false;
                        $scope.$apply();
                    } else if (event.which == 8) {
                        $scope.selectedItem = null;
                        $scope.$apply();
                    }
                });

            }
        };
    };
    angucomplete.$inject = ["$parse", "requestData", "$sce", "$timeout"];

    /**
     * checkbox
     */
    function checkboxGroup() {
        return {
            restrict: "A",
            scope: {
                checkboxGroup: "="
            },
            link: function ($scope, $elem, $attrs) {
                if (!angular.isArray($scope.checkboxGroup)) $scope.checkboxGroup = [];

                //if ($scope.checkboxGroup.indexOf($attrs.value) !== -1) {
                //    $elem[0].checked = true;
                //}

                // Update array on click
                $elem.on('click', function () {
                    var index = $scope.checkboxGroup.indexOf($attrs.value);
                    // Add if checked
                    if ($elem[0].checked) {
                        if (index === -1) $scope.checkboxGroup.push($attrs.value);
                    }
                    // Remove if unchecked
                    else {
                        if (index !== -1) $scope.checkboxGroup.splice(index, 1);
                    }
                    $scope.$apply();
                });

                $scope.$watchCollection("checkboxGroup", function (value) {
                    if (value) {
                        if ($scope.checkboxGroup.indexOf($attrs.value) !== -1) {
                            $elem[0].checked = true;
                        }
                    }
                })
            }
        }
    }

    /**
     * 下拉
     */
    function chosen(requestData, $timeout) {
        return {
            restrict: 'A',
            scope: {
                chosen: '='
            },
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
                var chosenConfig = {
                    no_results_text: "没有找到",
                    display_selected_options: false
                };
                $attrs.width && (chosenConfig.width = $attrs.width);

                require(['chosen'], function () {
                    if ($attrs.selectSource) {
                        if (angular.isDefined($attrs.chosenAjax)) {
                            $element.chosen(chosenConfig);

                            var $chosenContainer = $element.next();
                            var $input = $('input', $chosenContainer);
                            var searchStr = "";
                            var isChinessInput = false;
                            var typing = false;
                            var requestQueue;

                            function handleSearch(q) {
                                var selected = $('option:selected', $element).not(':empty').clone().attr('selected', true);
                                requestQueue && requestQueue.abort();
                                requestQueue = $.ajax({
                                    url: $attrs.selectSource,
                                    type: 'post',
                                    data: {q: q},
                                    dataType: 'json',
                                    success: function (_data) {
                                        if (_data.code == 200) {
                                            var _options = '';
                                            var _length = _data.data.length;
                                            var _selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [ngModel.$viewValue];
                                            for (var i = 0; i < _length; i++) {
                                                if (_selected.indexOf(_data.data[i].value) == -1) {
                                                    _options += '<option value="' + _data.data[i].value + '">' + _data.data[i].text + '</option>';
                                                }
                                            }
                                            $element.html(_options).prepend(selected);
                                            $element.trigger("chosen:updated");
                                            var keyRight = $.Event('keydown');
                                            keyRight.which = 39;
                                            $input.val(q).trigger(keyRight);

                                            if (_data.data.length > 0) {
                                                $chosenContainer.find('.no-results').hide();
                                            } else {
                                                $chosenContainer.find('.no-results').show();
                                            }
                                        }
                                    },
                                    complete: function () {
                                        $scope.$digest();
                                    }
                                });


                                //requestData($attrs.selectSource, {q: q})
                                //    .then(function (results) {
                                //        var data = results[0];
                                //        var _options = '';
                                //        var _length = data.length;
                                //        var _selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [ngModel.$viewValue];
                                //        for (var i = 0; i < _length; i++) {
                                //            if (_selected.indexOf(data[i].value) == -1) {
                                //                _options += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
                                //            }
                                //        }
                                //        $element.html(_options).prepend(selected);
                                //        $element.trigger("chosen:updated");
                                //        var keyRight = $.Event('keydown');
                                //        keyRight.which = 39;
                                //        $input.val(q).trigger(keyRight);
                                //
                                //        if (data.length > 0) {
                                //            $chosenContainer.find('.no-results').hide();
                                //        } else {
                                //            $chosenContainer.find('.no-results').show();
                                //        }
                                //    });
                            };

                            function processValue(e) {
                                var field = $(this);

                                //don't fire ajax if...
                                if ((e.type === 'paste' && field.is(':not(:focus)')) ||
                                    (e.keyCode && (
                                        (e.keyCode === 9) ||//Tab
                                        (e.keyCode === 13) ||//Enter
                                        (e.keyCode === 16) ||//Shift
                                        (e.keyCode === 17) ||//Ctrl
                                        (e.keyCode === 18) ||//Alt
                                        (e.keyCode === 19) ||//Pause, Break
                                        (e.keyCode === 20) ||//CapsLock
                                        (e.keyCode === 27) ||//Esc
                                        (e.keyCode === 33) ||//Page Up
                                        (e.keyCode === 34) ||//Page Down
                                        (e.keyCode === 35) ||//End
                                        (e.keyCode === 36) ||//Home
                                        (e.keyCode === 37) ||//Left arrow
                                        (e.keyCode === 38) ||//Up arrow
                                        (e.keyCode === 39) ||//Right arrow
                                        (e.keyCode === 40) ||//Down arrow
                                        (e.keyCode === 44) ||//PrntScrn
                                        (e.keyCode === 45) ||//Insert
                                        (e.keyCode === 144) ||//NumLock
                                        (e.keyCode === 145) ||//ScrollLock
                                        (e.keyCode === 91) ||//WIN Key (Start)
                                        (e.keyCode === 93) ||//WIN Menu
                                        (e.keyCode === 224) ||//command key
                                        (e.keyCode >= 112 && e.keyCode <= 123)//F1 to F12
                                    ))) {
                                    return false;
                                }

                                if (isChinessInput && (e.keyCode != 32 && (e.keyCode < 48 || e.keyCode > 57))) {
                                    return false;
                                }

                                $chosenContainer.find('.no-results').hide();

                                var q = $.trim(field.val());
                                if (!q && searchStr == q) {
                                    return false;
                                }
                                searchStr = q;

                                typing = true;

                                if ($scope.searchTimer) {
                                    $timeout.cancel($scope.searchTimer);
                                }

                                $scope.searchTimer = $timeout(function () {
                                    typing = false;
                                    handleSearch(q);
                                }, 600);
                            };

                            $('.chosen-search > input, .chosen-choices .search-field input', $chosenContainer).on('keyup', processValue).on('paste', function (e) {
                                var that = this;
                                setTimeout(function () {
                                    processValue.call(that, e);
                                }, 500);
                            }).on('keydown', function (e) {
                                if (e.keyCode == 229) {
                                    isChinessInput = true;
                                } else {
                                    isChinessInput = false;
                                }
                            });
                        } else {
                            requestData($attrs.selectSource)
                                .then(function (results) {
                                    var data = results[0];
                                    var _options = '';
                                    var _length = data.length;
                                    var _selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [ngModel.$viewValue];
                                    for (var i = 0; i < _length; i++) {
                                        _options += '<option value="' + data[i].value + '"' + (_selected.indexOf(data[i].value) > -1 ? 'selected' : '') + '>' + data[i].text + '</option>';
                                    }
                                    $element.html(_options);
                                    $element.chosen($scope.chosen || chosenConfig);
                                });
                        }
                    } else {
                        $element.chosen($scope.chosen || chosenConfig);
                    }
                })
            }
        }
    };
    chosen.$inject = ["requestData", "$timeout"];

    /**
     * form-item
     */
    function formItem($compile) {
        return {
            restrict: 'AE',
            scope: true,
            replace: true,
            link: function ($scope, $element, $attrs) {
                var _src = $scope.$eval($attrs.src);
                var _item = "";
                switch (_src.type) {
                    case "text":
                        _item = '<input type="' + _src.type + '" name="' + _src.key + '" ng-init="formData[\'' + _src.key + '\']=\'' + (_src.value || "") + '\'" ng-model="formData[\'' + _src.key + '\']" class="ipt" placeholder="' + _src.placeholder + '" />';
                        break;
                    case "date":
                        _item = '<input type="' + _src.type + '" name="' + _src.key + '" ng-init="formData[\'' + _src.key + '\']=\'' + (_src.value || "") + '\'" ng-model="formData[\'' + _src.key + '\']" class="ipt" placeholder="' + _src.placeholder + '" convert-to-date/>';
                        break;
                    case "checkbox":
                        _item = '<div class="form-ctrl" ng-init="formData[\'' + _src.key + '\']=[\'' + (_src.value || "") + '\']">';
                        angular.forEach(_src.options, function (item) {
                            _item += '<label class="label">' +
                                '<input type="' + _src.type + '" name="' + _src.key + '" checkbox-group="formData[\'' + _src.key + '\']"  value="' + item + '" /> ' + item +
                                '</label>';
                        });
                        _item += '</div>';
                        break;
                    case "radio":
                        _item = '<div class="form-ctrl" ng-init="formData[\'' + _src.key + '\']=\'' + (_src.value || "") + '\'">';
                        angular.forEach(_src.options, function (item) {
                            _item += '<label class="label">' +
                                '<input type="' + _src.type + '" name="' + _src.key + '" ng-model="formData[\'' + _src.key + '\']"  value="' + item + '" /> ' + item +
                                '</label>';
                        });
                        _item += '</div>';
                        break;
                    case "select":
                        _item = '<select class="select select-w" name="' + _src.key + '" ng-init="formData[\'' + _src.key + '\']=\'' + (_src.value || "") + '\'" ng-model="formData[\'' + _src.key + '\']"  >';
                        _item += '<option value="" >请选择</option>';
                        angular.forEach(_src.options, function (item) {
                            _item += '<option value="' + item + '" >' + item + '</option>';
                        });
                        _item += '</select>';
                        break;
                    case "textarea":
                        _item = '<textarea name="' + _src.key + '" ng-init="formData[\'' + _src.key + '\']=\'' + (_src.value || "") + '\'" ng-model="formData[\'' + _src.key + '\']"  class="textarea" placeholder="' + _src.placeholder + '"></textarea>';
                        break;
                }
                $element.append($compile(_item)($scope));
            }
        }
    };
    formItem.$inject = ["$compile"];

    /**
     * 自定义配置 (资源相关)
     */
    function customConfig($timeout) {
        return {
            restrict: 'AE',
            scope: true,
            transclude: true,
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel, $transclude) {
                $timeout(function () {
                    ngModel && ($scope.dataList = ngModel.$viewValue || []);
                });

                $scope.$watchCollection("dataList", function (value) {
                    if (value && ngModel) {
                        ngModel.$setViewValue(value);
                    }
                });

                $scope.addRow = function () {
                    $scope.dataList.push({});
                };

                $scope.delRow = function (n) {
                    $scope.dataList.splice(n, 1);
                };

                $transclude($scope, function (clone) {
                    $element.append(clone);
                });
            }
        };
    };
    customConfig.$inject = ["$timeout"];

    /**
     * 加入项目
     */
    angular.module('manageApp.main')
        .directive("ngView", ngView)
        .directive("convertToDate", convertToDate)
        .directive("convertToNumber", convertToNumber)
        .directive("detailsInfo", detailsInfo)
        .directive("formValidator", formValidator)
        .directive("tableList", tableList)
        .directive("tableCell", tableCell)
        .directive("pagination", pagination)
        .directive("pagination2", pagination2)
        .directive("filterConditions", filterConditions)
        .directive("treeList", treeList)
        .directive("treeList2", treeList2)
        .directive("navList", navList)
        .directive("selectAsync", selectAsync)
        .directive("relativeSelect", relativeSelect)
        .directive("chart", eChart)
        .directive("angucomplete", angucomplete)
        .directive("checkboxGroup", checkboxGroup)
        .directive("chosen", chosen)
        .directive("formItem", formItem)
        .directive("customConfig", customConfig)
});