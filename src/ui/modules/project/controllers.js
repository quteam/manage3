/**
 * Created by hao on 15/11/5.
 */

define('project/controllers', ['project/init'], function () {
    /**
     * 项目面板
     */
    function projectPanelCtrl($scope) {
        $scope.options = {};
        $scope.projectList = [];
        $scope.currentProject = {};
        $scope.getProjectInfo = function (_project) {
            $.post($scope.options.panelUrl, {id: _project.id}, function (_data) {
                    if (_data.code == 200) {
                        $scope.currentProject.info = _data.data;
                    }
                }, 'json')
                .complete(function () {
                    $scope.$digest();
                });
        };

        $scope.show = function (_project) {
            $scope.currentProject = _project;
            $scope.getProjectInfo(_project);
        };
    };
    projectPanelCtrl.$inject = ['$scope'];

    /**
     * Tag 管理
     */
    function tagCtrl($scope, $attrs, tagsService) {
        $scope.formData = {};
        tagsService.setConfig({tagsListUrl: $attrs.tagsList});
        tagsService.getTags().then(function (_list) {
            $scope.tagsList = _list;
        }, function (_err) {
            $scope.getError = _err;
        })
    };
    tagCtrl.$inject = ["$scope", "$attrs", "tagsService"];

    /**
     * 房型管理
     */
    function houseCtrl($scope, modal, dialogConfirm) {
        $scope.listSelected = [];
        $scope.delSelected = function (_url) {
            dialogConfirm('确定删除这些户型?', function () {
                $.post(_url, {ids: $scope.listSelected.join(",")}, function (data) {
                        if (data.code == 200) {
                            $scope.$broadcast("reloadList");
                        } else {
                            alert(data.message || '删除错误');
                        }
                    }, 'json')
                    .error(function () {
                        alert('请求错误');
                    });
            });
        };

        $scope.submitCallBack = function (_data) {
            if (_data.code == 200) {
                modal.close();
                $scope.$broadcast("reloadList");
            }
        };
    };
    houseCtrl.$inject = ["$scope", "modal", "dialogConfirm"];

    /**
     * 房间管理
     */
    function roomCtrl($scope, modal) {
        $scope.listSelected = [];
        $scope.listParams = {};

        $scope.batchEdit = function (_url, _width) {
            modal.open({
                template: _url,
                className: 'ngdialog-theme-right',
                cache: false,
                trapFocus: false,
                overlay: false,
                scope: $scope,
                controller: ["$scope", "$element", function ($scope, $element) {
                    $(".ngdialog-content", $element).width(_width);
                }]
            });
        };

        $scope.submitCallBack = function (_data) {
            if (_data.code == 200) {
                modal.close();
                $scope.$broadcast("reloadList");
            }
        };
    };
    roomCtrl.$inject = ["$scope", "modal"];

    /**
     * 楼盘表
     */
    function roomTableCtrl($scope, modal) {
        $scope.submitCallBack = function (_data) {
            if (_data.code == 200) {
                modal.close();
            }
        };
    };
    roomTableCtrl.$inject = ["$scope", "modal"];

    /**
     * 房间价格管理
     */
    function priceCtrl($scope, modal) {
        $scope.listSelected = [];
        $scope.listParams = {};

        $scope.batchEdit = function (_url, _width) {
            modal.open({
                template: _url,
                className: 'ngdialog-theme-right',
                cache: false,
                trapFocus: false,
                overlay: false,
                scope: $scope,
                controller: ["$scope", "$element", function ($scope, $element) {
                    $(".ngdialog-content", $element).width(_width);
                }]
            });
        };

        $scope.submitCallBack = function (_data) {
            if (_data.code == 200) {
                modal.close();
                $scope.$broadcast("reloadList");
            }
        };
    };
    priceCtrl.$inject = ["$scope", "modal"];

    /**
     *  组织架构管理
     */
    function orgPageCtrl($scope) {
        $scope.itemData = {};

        $scope.$watch("itemData.item", function (value) {
            if (value) {
                $scope.itemData.jobListParams = {"itemID": value.id};
            }
        });
    };
    orgPageCtrl.$inject = ["$scope"];

    /**
     *  组织架构管理 - 岗位筛选
     */
    function jobListCtrl($scope, modal, $timeout) {
        $scope.delSelected = function (selected) {
            $scope.$broadcast("deleteSelected", selected);
        };
    };
    jobListCtrl.$inject = ["$scope", "modal", "$timeout"];

    /**
     * 组织架构管理 - 新增岗位
     */
    function jobAddCtrl($scope, modal) {
        $scope.formData = {};

        $scope.selectRelative = function () {
            var _dialog = modal.open({
                template: "tpl/dialog-tree.html",
                cache: false,
                trapFocus: false,
                overlay: true,
                scope: $scope,
                controller: ["$scope", "$element", function ($scope, $element) {
                    $(".ngdialog-content", $element).width(300);
                }]
            });


            $scope.confirm = function (selectItem) {
                _dialog.close();
                $scope.formData.pid = selectItem.id;
            };
        };
    };
    jobAddCtrl.$inject = ["$scope", "modal"];

    /**
     *  组织架构管理 - 成员列表
     */
    function memberListCtrl($scope, modal) {
        $scope.$watchCollection("itemData.jobIDs", function (value) {
            if (value) {
                $scope.itemData.memberListParams = {"jobIDs": value.join(",")};
            }
        })
    };
    memberListCtrl.$inject = ["$scope", "modal"];

    /**
     * 组织架构管理 - 新增成员
     */
    function memberAddCtrl($scope, modal) {
        $scope.formData = {};

        $scope.selectRelative = function () {
            var _dialog = modal.open({
                template: "tpl/dialog-tree.html",
                cache: false,
                trapFocus: false,
                overlay: true,
                scope: $scope,
                controller: ["$scope", "$element", function ($scope, $element) {
                    $(".ngdialog-content", $element).width(300);
                }]
            });


            $scope.confirm = function (selectItem) {
                _dialog.close();
                $scope.formData.pid = selectItem.id;
            };
        };
    };
    memberAddCtrl.$inject = ["$scope", "modal"];

    /**
     * 折扣管理
     */
    function discountPageCtrl($scope, modal) {
        $scope.submitCallBack = function (_data) {
            if (_data.code == 200) {
                modal.close();
                $scope.$broadcast("reloadList");
            }
        };

        $scope.$watch("itemData.item", function (value) {
            if (value) {
                $scope.itemData.discountListParams = {"itemID": value.id};
            }
        });
    };
    discountPageCtrl.$inject = ["$scope", "modal"];

    /**
     * 折扣管理 - 添加折扣
     */
    function discountCtrl($scope) {
        var itemData = $scope.itemData = {};
        itemData.selectedRoomList = [];

        $scope.$watch("itemData.item", function (value) {
            if (value) {
                $scope.itemData.roomListParams = {"itemID": value.id};
            }
        });

        $scope.submitDiscount = function (_url) {
            var _checked = [];
            angular.forEach(itemData.selectedRoomList, function (room) {
                _checked.push(room.id);
            });

            $.post(_url, {ids: _checked.join(",")}, function (_data) {
                    if (_data.code == 200) {
                        window.location.assign(_data.url);
                    }
                }, 'json')
                .complete(function () {
                    $scope.$digest();
                });
        };

        $scope.addRoom = function () {
            angular.merge(itemData.selectedRoomList, itemData.roomList);
        };

        $scope.delRoom = function () {
            angular.forEach(itemData.roomList2, function (room) {
                itemData.selectedRoomList.splice(itemData.selectedRoomList.indexOf(room), 1);
            })
        }
    };
    discountCtrl.$inject = ["$scope"];

    /**
     * 房源列表
     */
    function houseSourceCtrl($scope) {
        $scope.status = {
            viewType: "table"
        };
        $scope.dataHandler = function (_data) {
            var _roomTable = {};
            _data.roomTable = _roomTable;
            return _data;
        }
    };
    houseSourceCtrl.$inject = ["$scope"];

    /**
     * 房源生成
     */
    function houseSourceAddCtrl($scope, $http, $httpParamSerializer) {
        $scope.itemData = {};
        $scope.formData = {};
        $scope.formData.numRole = 1;
        $scope.formData.floorInfo = {};
        $scope.formData.houseType = [];
        $scope.houseTypeList = [
            {id: 1, name: "A1"},
            {id: 2, name: "A2"},
            {id: 3, name: "A3"}
        ];//总户型
        var status = {
            viewType: "table",      //table , list
            //pageType: "list",       //list , create
            step: 1,
            submitting: false
        };
        $scope.status = status;

        //生成房源
        //$scope.createHouse = function () {
        //    status.pageType = "create";
        //};
        //第一步的选择户型
        $scope.selectHouseType = function (e, houseType) {
            houseType.selected = e.currentTarget.checked;
            var _houseType = [];
            angular.forEach($scope.houseTypeList, function (_type) {
                if (_type.selected) {
                    _houseType.push(_type);
                }
            });
            $scope.formData.houseType = _houseType;
        };
        //修改一行楼层
        $scope.changeFloorRow = function (_floor, _index) {
            angular.forEach($scope.buildTable.buildingFloors[_index].rooms, function (room) {
                room.floorName = _floor;
            })
        };
        //修改一列户型
        $scope.changeHouseTypeColumn = function (_houseType, _index) {
            angular.forEach($scope.buildTable.buildingFloors, function (floor) {
                floor.rooms[_index].houseType = _houseType.name;
            })
        };
        //修改一行户型
        $scope.changeHouseTypeRow = function (_houseType, _index) {
            angular.forEach($scope.buildTable.buildingFloors[_index].rooms, function (room) {
                room.houseType = _houseType.name;
            })
        };
        //提交房源
        $scope.submitSource = function (_url) {
            var _formData = {rooms: []};

            if ($scope.formData.unitNum == 0) {
                _formData.rooms.push({
                    floor: $scope.buildTable.buildingFloor,
                    houseType: $scope.buildTable.houseType,
                    houseNo: $scope.buildTable.houseNo,
                    houseUnit: $scope.formData.unitNum,
                    floorName: $scope.buildTable.buildingFloor
                });
            } else {
                angular.forEach($scope.buildTable.buildingFloors, function (floor) {
                    angular.forEach(floor.rooms, function (room) {
                        _formData.rooms.push(room);
                    });
                })
            }

            $http({
                method: 'POST',
                url: _url,
                data: _formData,
                transformRequest: function (data) {
                    return $httpParamSerializer(data);
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .success(function (data, status, headers, config) {
                    status.submitting = false;
                    if (data.code == 200) {
                        status.submitInfo = data.message || '提交成功';
                        data.url && window.location.assign(data.url);
                    } else {
                        status.submitInfo = data.message || '提交错误';
                    }
                })
                .error(function () {
                    status.submitting = false;
                    status.submitInfo = '提交失败。';
                })
        };

        $scope.buildTable = {};

        //0 补位
        function pad(num) {
            if (num <= 9) {
                return "0" + num;
            } else {
                return "" + num;
            }
        };


        /**
         * 楼层+房号

         buildTable = {
            buildingUnits: [{                   //楼栋单元
                name: "",                       //单元名称
                col: ""                         //单元每层户数
            }],
            buildingRoomNos: [{                 //单元房号
                unit:"",                        //单元名称
                name:""                         //房号名称
            }}],
            buildingFloors: [{                  //每层房间
                floor: 1,                       //楼层
                rooms: [{
                    houseUnit: "",              //单元
                    houseNo: "",                //房间号
                    houseType: "",              //户型
                    unitNo:"",                  //单元房号
                    floorName:"",               //楼层名称
                    floor: 1                    //楼层
                }]
            }],
            houseNo:"",                         //别墅房号
            houseType:123,                      //别墅户型
            buildingFloor: 1                    //楼层
        };
         */
        $scope.buildTable = {
            buildingUnits: [],
            buildingRoomNos: [],
            buildingFloors: [],
            buildingFloor: $scope.formData.floor,
            houseNo: "",
            houseType: ""
        };

        function createTable1(config) {
            var buildTable = {
                buildingUnits: [],
                buildingRoomNos: [],
                buildingFloors: [],
                buildingFloor: $scope.formData.floor
            };
            if (config.unitList) {
                for (var i = 0, l = config.unitList.length; i < l; i++) {
                    buildTable.buildingUnits.push({
                        name: config.unitList[i],
                        col: config.unitColList[i]
                    });
                    for (var j = 0, m = config.unitColList[i]; j < m; j++) {
                        buildTable.buildingRoomNos.push({
                            unit: config.unitList[i],
                            name: pad(j + 1)
                        });
                    }
                }
            }
            //生成详细楼层
            if (buildTable.buildingRoomNos.length > 0) {
                for (var i = buildTable.buildingFloor; i > 0; i--) {
                    var roomList = [];
                    for (var j = 0, m = buildTable.buildingRoomNos.length; j < m; j++) {
                        roomList.push({
                            houseUnit: buildTable.buildingRoomNos[j].unit,
                            houseNo: i + buildTable.buildingRoomNos[j].name,
                            houseType: $scope.formData.houseType[0].name,
                            unitNo: buildTable.buildingRoomNos[j].name,
                            floor: i,
                            floorName: i
                        });
                    }
                    buildTable.buildingFloors.push({
                        floor: i,
                        rooms: roomList
                    });
                }
            } else {
                for (var i = buildTable.buildingFloor; i > 0; i--) {
                    buildTable.buildingFloors.push({
                        floor: i
                    });
                }
                buildTable.houseType = $scope.formData.houseType[0].name;
            }
            angular.merge($scope.buildTable, buildTable);
        }

        //楼层+顺序号（单元横向）
        function createTable2(config) {
            var buildTable = {
                buildingUnits: [],
                buildingRoomNos: [],
                buildingFloors: [],
                buildingFloor: $scope.formData.floor
            };
            for (var i = 0, l = config.unitList.length; i < l; i++) {
                buildTable.buildingUnits.push({
                    name: config.unitList[i],
                    col: config.unitColList[i]
                });
                for (var j = 0, m = config.unitColList[i]; j < m; j++) {
                    buildTable.buildingRoomNos.push({
                        unit: config.unitList[i],
                        name: pad(j + 1)
                    });
                }
            }
            //生成详细楼层
            for (var i = buildTable.buildingFloor; i > 0; i--) {
                var roomList = [];
                for (var j = 0, m = buildTable.buildingRoomNos.length; j < m; j++) {
                    roomList.push({
                        houseUnit: buildTable.buildingRoomNos[j].unit,
                        houseNo: i + pad(j + 1),
                        houseType: $scope.formData.houseType[0].name,
                        unitNo: buildTable.buildingRoomNos[j].name,
                        floor: i,
                        floorName: i
                    });
                }
                buildTable.buildingFloors.push({
                    floor: i,
                    rooms: roomList
                });
            }
            angular.merge($scope.buildTable, buildTable);
        }

        $scope.$watch("formData.floorInfo", function (config) {
            if (config && config.unitList) {
                switch ($scope.formData.numRole) {
                    case 1:
                        createTable1(config);
                        break;
                    case 2:
                        createTable2(config);
                        break;
                }
            }
        }, true);
        $scope.$watch("formData.floor", function (floor, oldFloor) {
            if (floor && floor != oldFloor) {
                switch ($scope.formData.numRole) {
                    case 1:
                        createTable1($scope.formData.floorInfo);
                        break;
                    case 2:
                        createTable2($scope.formData.floorInfo);
                        break;
                }
            }
        });
        $scope.$watch("formData.numRole", function (numRole, oldNumRole) {
            if (numRole && numRole != oldNumRole) {
                switch (numRole) {
                    case 1:
                        createTable1($scope.formData.floorInfo);
                        break;
                    case 2:
                        createTable2($scope.formData.floorInfo);
                        break;
                }
            }
        })
    };
    houseSourceAddCtrl.$inject = ["$scope", "$http", "$httpParamSerializer"];

    /**
     * 客户管理
     */
    function customerPageCtrl($scope) {
        $scope.itemData = {};
        $scope.pageInfo = {
            tab: 1
        }
    };
    customerPageCtrl.$inject = ["$scope"];

    /**
     * 客户分配
     */
    function customerDispatchCtrl($scope, $element) {
        $scope.customerInfo = {
            customerCount: 0,
            dispatchCount: 0
        };
        $scope.formData = {};
        $scope.dispatchAll = function () {
            var $num = $(".numIpt", $element);
            var _val = Math.floor($scope.customerInfo.customerCount / $num.length);
            $num.val(_val).trigger("change");
            $scope.customerInfo.dispatchCount = _val * $num.length;
        };
        $scope.dispatchThisGroup = function ($event) {
            var $this = $($event.currentTarget);
            var $num = $(".numIpt", $this.parent().next());

            var dispatchCount = 0;
            $(".numIpt", $this.parent().parent().siblings()).each(function () {
                dispatchCount += parseInt(this.value) || 0;
            });

            var _val = Math.floor(($scope.customerInfo.customerCount - dispatchCount) / $num.length);
            $num.val(_val).trigger("change");
            $scope.customerInfo.dispatchCount = dispatchCount + _val * $num.length;
        };

        $scope.$watch("formData", function () {
            var dispatchCount = 0;
            $(".numIpt", $element).each(function () {
                dispatchCount += parseInt(this.value) || 0;
            });
            $scope.customerInfo.dispatchCount = dispatchCount;
        }, true)
    };
    customerDispatchCtrl.$inject = ["$scope", "$element"];

    angular.module('manageApp.project')
        .controller('projectPanelCtrl', projectPanelCtrl)
        .controller('tagCtrl', tagCtrl)
        .controller('houseCtrl', houseCtrl)
        .controller('roomCtrl', roomCtrl)
        .controller('roomTableCtrl', roomTableCtrl)
        .controller('priceCtrl', priceCtrl)
        .controller('orgPageCtrl', orgPageCtrl)
        .controller('jobListCtrl', jobListCtrl)
        .controller('jobAddCtrl', jobAddCtrl)
        .controller('memberListCtrl', memberListCtrl)
        .controller('memberAddCtrl', memberAddCtrl)
        .controller('discountPageCtrl', discountPageCtrl)
        .controller('discountCtrl', discountCtrl)
        .controller('houseSourceCtrl', houseSourceCtrl)
        .controller('houseSourceAddCtrl', houseSourceAddCtrl)
        .controller('customerPageCtrl', customerPageCtrl)
        .controller('customerDispatchCtrl', customerDispatchCtrl)
});