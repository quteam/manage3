/**
 * Created by hao on 15/11/5.
 */

define('main/directives', ['main/init'], function () {

    /**
     * Clear ng-view template cache
     */
    function ngView($route, $templateCache) {
        return {
            restrict: 'A',
            priority: -500,
            link: function ($scope, $element) {
                $templateCache.remove($route.current.loadedTemplateUrl);
            }
        };
    };
    ngView.$inject = ["$route", "$templateCache"];

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
                    getData({});
                }

                function getData(params) {
                    $scope.isLoading = true;
                    requestData($attrs.detailsInfo, params)
                        .then(function (data) {
                            $scope.isLoading = false;
                            if ($scope.detailsHandler) {
                                $scope.details = $scope.detailsHandler(data);
                            } else {
                                $scope.details = data;
                            }
                        })
                        .catch(function () {
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
    function formValidator(requestData) {
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
                        .then(function (data) {
                            formStatus.submitting = false;
                            formStatus.submitInfo = "";
                            if (angular.isFunction($scope.submitCallBack)) {
                                $scope.submitCallBack(data);
                            } else if (data.url) {
                                window.location.assign(data.options.url);
                            }
                        })
                        .catch(function (error) {
                            formStatus.submitting = false;
                            formStatus.submitInfo = error || '提交失败。';
                            angular.isFunction($scope.submitCallBack) && $scope.submitCallBack(data);
                        });
                })
            }
        }
    };
    formValidator.$inject = ["requestData"];

    /**
     * 表格
     */
    function tableList(requestData, modal, dialogConfirm, $timeout) {
        return {
            restrict: 'AE',
            scope: {
                listParams: "=",
                listSelected: "=",
                listSource: "="
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
                        requestData(_url, {})
                            .then(function () {
                                $scope.tbodyList.splice($scope.tbodyList.indexOf(_tr), 1);
                            })
                            .catch(function (error) {
                                alert(error || '删除错误');
                            });
                    });
                };

                //弹窗修改后的回调
                $scope.submitCallBack = function (_data) {
                    if (_data.code == 200) {
                        modal.closeAll();
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
                    $.post($scope.listData, angular.merge({}, formData, {page: statusInfo.currentPage}), function (data, status, headers, config) {
                            if (data.code == 200) {
                                if (data.options) {
                                    statusInfo.totalCount = data.options.totalCount || statusInfo.totalCount;
                                    statusInfo.pageSize = data.options.pageSize || statusInfo.pageSize;
                                    statusInfo.totalPage = Math.ceil(statusInfo.totalCount / statusInfo.pageSize);
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
                        }, 'json')
                        .error(function () {
                            statusInfo.isLoading = false;
                            statusInfo.loadFailMsg = '加载出错';
                        })
                        .complete(function () {
                            _callback && _callback();
                            $scope.$digest();
                            bindSelectOneEvent();
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
                        //$scope.$apply();
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
                            .then(function (_data) {
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
    function treeList(requestData, $filter) {
        return {
            restrict: 'AE',
            scope: {},
            require: "?^ngModel",
            templateUrl: 'tpl/tree.html',
            link: function ($scope, $element, $attrs, ngModel) {
                $scope.status = {};
                $scope.treeList = [];
                $scope.curTree1 = {};
                $scope.curTree2 = {};
                $scope.curTree3 = {};
                $scope.status.isLoading = true;

                $scope.selectTree1 = function (tree) {
                    $scope.curTree1 = tree;
                };
                $scope.selectTree2 = function (tree) {
                    $scope.curTree2 = tree;
                    var _subTree = $filter("filter")($scope.treeList, {pid: tree.id}, tree);
                    if (_subTree.length < 1) {
                        var _tree = angular.copy(tree);
                        _tree.p = $scope.curTree1;
                        ngModel && ngModel.$setViewValue(_tree);
                    }
                };
                $scope.selectTree3 = function (tree) {
                    $scope.curTree3 = tree;
                    var _tree = angular.copy(tree);
                    _tree.p = $scope.curTree2;
                    _tree.p2 = $scope.curTree1;
                    ngModel && ngModel.$setViewValue(_tree);
                };

                requestData($attrs.treeList)
                    .then(function (data) {
                        $scope.treeList = data;
                        $scope.status.isLoading = false;
                    })
                    .catch(function () {
                        $scope.status.isLoading = false;
                    });
            }
        }
    };
    treeList.$inject = ["requestData", "$filter"];

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
                        .then(function (data) {
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
                    .then(function (data) {
                        var _options = '<option value="">请选择</option>';
                        var _length = data.length;
                        for (var i = 0; i < _length; i++) {
                            _options += '<option value="' + data[i].value + '"' + (ngModel.$viewValue == data[i].value ? 'selected' : '') + '>' + data[i].text + '</option>';
                        }
                        $element.html(_options);
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
            link: function ($scope, $element, $attrs) {
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
                    console.log(_data);
                    $(_relativeTo).trigger("update", _data);
                }

                function getData(_data) {
                    requestData(_relativeSelect, _data)
                        .then(function (data) {
                            var _options = isSelectFirst ? '' : '<option value="">请选择</option>';
                            var _length = data.length;
                            for (var i = 0; i < _length; i++) {
                                _options += '<option ' + (data[i].enabled === 0 ? ' class="text-muted"' : '') + ' value="' + data[i].value + '" ' + (data[i].selected || (isSelectFirst && i == 0) ? 'selected' : '') + '>' + data[i].text + '</option>';
                            }
                            $element.html(_options);
                            //$element.trigger("change");
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
                clickToUrl: "=",
                clickToDialog: "="
                //chartParams: "="
            },
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
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
                            dialogChart($scope.clickToDialog);
                        }
                    });

                    if ($attrs.chartParams) {
                        //监听具体值
                        $attrs.$observe("chartParams", function (value) {
                            loadChart($attrs.chart, $scope.$eval(value));
                        });
                    }
                    loadChart($attrs.chart);

                    function loadChart(_url, _params) {
                        myChart.showLoading();
                        requestData(_url, _params)
                            .then(function (_data) {
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
                                }
                                myChart.setOption(_data);
                            })
                            .catch(function (_msg) {
                                console.error(_msg);
                                myChart.hideLoading();
                            });
                    };

                    //loadChart();
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
                "placeholder": "@placeholder",
                "selectedItem": "=selectedItem",
                "url": "@url",
                "titleField": "@titleField",
                "descriptionField": "@descriptionField",
                //"localData": "=localdata",
                "searchFields": "@searchfields",
                "matchClass": "@matchclass"
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
                            requestData($scope.url, {q: str}).then(function (data) {
                                $scope.searching = false;
                                $scope.processResults(data, str);
                            }).catch(function (error) {
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
    function chosen(requestData) {
        return {
            restrict: 'A',
            scope: {
                chosen: '='
            },
            require: "?^ngModel",
            link: function ($scope, $element, $attrs, ngModel) {
                require(['chosen'], function () {
                    if ($attrs.selectSource) {
                        if (angular.isDefined($attrs.chosenAjax)) {
                            $element.chosen({
                                no_results_text: "没有找到"
                            });

                            var $chosenContainer = $element.next();
                            var $input = $('input', $chosenContainer);
                            var searchStr = "";

                            $('.chosen-search > input, .chosen-choices .search-field input', $chosenContainer).on('keyup', processValue).on('paste', function (e) {
                                var that = this;
                                setTimeout(function () {
                                    processValue.call(that, e);
                                }, 500);
                            });

                            function processValue(e) {
                                var field = $(this),
                                    q = $.trim(field.val());
                                if (!q || searchStr == q) {
                                    return false;
                                }
                                searchStr = q;

                                //don't fire ajax if...
                                if ((e.type === 'paste' && field.is(':not(:focus)')) ||
                                    (e.which && (
                                        (e.which === 9) ||//Tab
                                        (e.which === 13) ||//Enter
                                        (e.which === 16) ||//Shift
                                        (e.which === 17) ||//Ctrl
                                        (e.which === 18) ||//Alt
                                        (e.which === 19) ||//Pause, Break
                                        (e.which === 20) ||//CapsLock
                                        (e.which === 27) ||//Esc
                                        (e.which === 33) ||//Page Up
                                        (e.which === 34) ||//Page Down
                                        (e.which === 35) ||//End
                                        (e.which === 36) ||//Home
                                        (e.which === 37) ||//Left arrow
                                        (e.which === 38) ||//Up arrow
                                        (e.which === 39) ||//Right arrow
                                        (e.which === 40) ||//Down arrow
                                        (e.which === 44) ||//PrntScrn
                                        (e.which === 45) ||//Insert
                                        (e.which === 144) ||//NumLock
                                        (e.which === 145) ||//ScrollLock
                                        (e.which === 91) ||//WIN Key (Start)
                                        (e.which === 93) ||//WIN Menu
                                        (e.which === 224) ||//command key
                                        (e.which >= 112 && e.which <= 123)//F1 to F12
                                    ))) {
                                    return false;
                                }

                                var selected = $('option:selected', $element).not(':empty').clone().attr('selected', true);
                                requestData($attrs.selectSource, {q: q})
                                    .then(function (data) {
                                        var _options = '';
                                        var _length = data.length;
                                        var _selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [ngModel.$viewValue];
                                        for (var i = 0; i < _length; i++) {
                                            if (_selected.indexOf(data[i].value) == -1) {
                                                _options += '<option value="' + data[i].value + '">' + data[i].text + '</option>';
                                            }
                                        }
                                        $element.html(_options).prepend(selected);
                                        $element.trigger("chosen:updated");
                                        var keyRight = $.Event('keyup');
                                        keyRight.which = 39;
                                        $input.val(q).trigger(keyRight);
                                    });
                            };

                        } else {
                            requestData($attrs.selectSource)
                                .then(function (data) {
                                    var _options = '';
                                    var _length = data.length;
                                    var _selected = angular.isArray(ngModel.$viewValue) ? ngModel.$viewValue : [ngModel.$viewValue];
                                    for (var i = 0; i < _length; i++) {
                                        _options += '<option value="' + data[i].value + '"' + (_selected.indexOf(data[i].value) > -1 ? 'selected' : '') + '>' + data[i].text + '</option>';
                                    }
                                    $element.html(_options);
                                    $element.chosen($scope.chosen || {
                                            no_results_text: "没有找到"
                                        });
                                });
                        }
                    } else {
                        $element.chosen($scope.chosen || {
                                no_results_text: "没有找到"
                            });
                    }
                })
            }
        }
    };
    chosen.$inject = ["requestData"];

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
        .directive("navList", navList)
        .directive("selectAsync", selectAsync)
        .directive("relativeSelect", relativeSelect)
        .directive("chart", eChart)
        .directive("angucomplete", angucomplete)
        .directive("checkboxGroup", checkboxGroup)
        .directive("chosen", chosen)
});