/**
 * Created by hao on 15/11/5.
 */

define('project/controllers', ['project/init'], function () {
    //录入成绩
    function importScoreCtrl($scope, requestData, $element, dialogConfirm, modal, $rootScope, $timeout) {
        $scope.formData = {};
        $scope.hasScore = false;
        $scope.canContinue = false;

        $scope.typeStudent = function () {
            $element.find(".studentScoreIpt").focus();
        };

        var _needSaveConfirm = true;
        var _needNotSaveConfirm = true;
        var $selectBanji = $element.find(".selectBanji");
        var $selectKemu = $element.find(".selectKemu");
        var $selectDate = $element.find(".selectDate");
        var _banjiModel = $selectBanji.attr("ng-model").split(".")[1];
        var _kemuModel = $selectKemu.attr("ng-model").split(".")[1];
        var _dateModel = $selectDate.attr("ng-model").split(".")[1];
        var _banjiValue = $selectBanji.val();
        var _kemuValue = $selectKemu.val();
        var _dateValue = $selectDate.val();

        function checkOneStep() {
            $scope.$digest();
            _banjiValue = $selectBanji.val();
            _kemuValue = $selectKemu.val();
            _dateValue = $selectDate.val();

            $scope.canContinue = _banjiValue && _kemuValue && _dateValue;
        };

        //第一步的选择
        $selectBanji.on("change", function (e) {
            var $this = $(this);
            if ($scope.hasScore && $scope.canContinue) {
                var _newValue = $this.val();
                $this.val(_banjiValue);

                var _$scope = $rootScope.$new(false);
                _$scope.confirmText = '你还没有保存当前录入记录,确定要保存?';
                _$scope.confirmBtnTxt = '保存';
                _$scope.cancelBtnTxt = '不保存';
                modal.openConfirm({
                    template: 'tpl/dialog-confirm.html',
                    scope: _$scope
                }).then(function () {
                    $timeout(function () {
                        _needSaveConfirm = false;
                        $element.find(".saveBtn").trigger("click");
                        $scope.formData[_banjiModel] = _newValue;
                        checkOneStep();
                    });
                }).catch(function (_type) {
                    if (_type == 'cancelBtn') {
                        $timeout(function () {
                            _needNotSaveConfirm = false;
                            $element.find(".notSaveBtn").trigger("click");
                            $scope.formData[_banjiModel] = _newValue;
                            checkOneStep();
                        });
                    }
                });
            } else {
                $timeout(checkOneStep);
            }
        });
        $selectKemu.on("change", function (e) {
            var $this = $(this);
            if ($scope.hasScore && $scope.canContinue) {
                var _newValue = $this.val();
                $this.val(_kemuValue);

                var _$scope = $rootScope.$new(false);
                _$scope.confirmText = '你还没有保存当前录入记录,确定要保存?';
                _$scope.confirmBtnTxt = '保存';
                _$scope.cancelBtnTxt = '不保存';
                modal.openConfirm({
                    template: 'tpl/dialog-confirm.html',
                    scope: _$scope
                }).then(function () {
                    $timeout(function () {
                        _needSaveConfirm = false;
                        $element.find(".saveBtn").trigger("click");
                        $scope.formData[_kemuModel] = _newValue;
                        checkOneStep();
                    });
                }).catch(function (_type) {
                    if (_type == 'cancelBtn') {
                        $timeout(function () {
                            _needNotSaveConfirm = false;
                            $element.find(".notSaveBtn").trigger("click");
                            $scope.formData[_kemuModel] = _newValue;
                            checkOneStep();
                        });
                    }
                });
            } else {
                $timeout(checkOneStep);
            }
        });
        $selectDate.on("change", function (e) {
            var $this = $(this);
            if ($scope.hasScore && $scope.canContinue) {
                var _newValue = $this.val();
                $this.val(_dateValue);

                var _$scope = $rootScope.$new(false);
                _$scope.confirmText = '你还没有保存当前录入记录,确定要保存?';
                _$scope.confirmBtnTxt = '保存';
                _$scope.cancelBtnTxt = '不保存';
                modal.openConfirm({
                    template: 'tpl/dialog-confirm.html',
                    scope: _$scope
                }).then(function () {
                    $timeout(function () {
                        _needSaveConfirm = false;
                        $element.find(".saveBtn").trigger("click");
                        $scope.formData[_dateModel] = _newValue;
                        checkOneStep();
                    });
                }).catch(function (_type) {
                    if (_type == 'cancelBtn') {
                        $timeout(function () {
                            _needNotSaveConfirm = false;
                            $element.find(".notSaveBtn").trigger("click");
                            $scope.formData[_dateModel] = _newValue;
                            checkOneStep();
                        });
                    }
                });
            } else {
                $timeout(checkOneStep);
            }
        });

        $scope.typeScore = function ($e, _data) {
            if ($e.keyCode == 13) {
                requestData(_url, _data)
                    .then(function () {
                        //刷新数据
                        $scope.formData.time = Date.now();
                        //
                        var $ipt = $element.find(".studentNameIpt input");
                        $ipt.val("").focus();
                        $element.find(".studentScoreIpt").val("");
                        $scope.hasScore = true;
                    })
                    .catch(function (error) {
                        alert(error || '录入成绩错误');
                    });
            }
        };

        //保存录入的成绩
        $scope.saveScore = function (_text) {
            if (_needSaveConfirm) {
                dialogConfirm(_text, function () {
                    requestData($scope.saveScoreUrl, $scope.formData)
                        .then(function () {
                            modal.closeAll();
                        })
                        .catch(function (error) {
                            alert(error || '保存错误');
                        })
                });
            } else {
                requestData($scope.saveScoreUrl, $scope.formData)
                    .then(function () {
                        _needSaveConfirm = true;
                    })
                    .catch(function (error) {
                        _needSaveConfirm = true;
                        alert(error || '保存错误');
                    })
            }
        };

        //不保存录入的成绩
        $scope.notSaveScore = function (_text) {
            if (_needNotSaveConfirm) {
                dialogConfirm(_text, function () {
                    requestData($scope.saveScoreUrl, $scope.formData)
                        .then(function () {
                            modal.closeAll();
                        })
                        .catch(function (error) {
                        })
                });
            } else {
                requestData($scope.saveScoreUrl, $scope.formData)
                    .then(function () {
                        _needNotSaveConfirm = true;
                    })
                    .catch(function (error) {
                        _needNotSaveConfirm = true;
                    })
            }
        };

        //列表处理事件: 是否录入成绩
        $scope.listCallback = function (_data) {
            $scope.hasScore = _data.hasScore;
        }

        //退出事件
        $scope.$on("$destroy", function () {
            var _$scope = $rootScope.$new(false);
            _$scope.confirmText = '你还没有保存当前录入记录,确定要保存?';
            _$scope.confirmBtnTxt = '保存';
            _$scope.cancelBtnTxt = '不保存';
            modal.openConfirm({
                template: 'tpl/dialog-confirm.html',
                scope: _$scope
            }).then(function () {
                $timeout(function () {
                    _needSaveConfirm = false;
                    $scope.saveScore()
                });
            }).catch(function (_type) {
                if (_type == 'cancelBtn') {
                    $timeout(function () {
                        _needNotSaveConfirm = false;
                        $scope.notSaveScore()
                    });
                }
            });
        })
    };
    importScoreCtrl.$inject = ['$scope', 'requestData', '$element', 'dialogConfirm', 'modal', '$rootScope', '$timeout'];

    //发送通知
    function noticePageCtrl($scope, $element, $timeout) {
        var $select = $element.find(".selectRecipient");
        $timeout(function () {
            $scope.formData = angular.extend($scope.$parent.formData, $scope.formData);
            $scope.formData.recipient = [];
            $scope.selectOne = function (_data) {
                var _index = $scope.formData.recipient.indexOf(_data.id);
                if (_index > -1) {
                    $scope.formData.recipient.splice(_index, 1);
                } else {
                    $scope.formData.recipient.push(_data.id);
                }
                $timeout(function () {
                    $select.trigger("chosen:updated");
                });
            };


            $scope.selectMultiple = function (trees, e) {
                var $e = $(e.currentTarget);
                var isSelected = $e.data("selected");
                angular.forEach(trees, function (_node) {
                    var _index = $scope.formData.recipient.indexOf(_node.id);
                    if (isSelected) {
                        if (_index > -1) {
                            $scope.formData.recipient.splice(_index, 1);
                        }
                    } else {
                        if (_index == -1) {
                            $scope.formData.recipient.push(_node.id);
                        }
                    }
                });
                if (!isSelected) {
                    $e.data("selected", true);
                    $e.text('取消全选');
                } else {
                    $e.data("selected", false);
                    $e.text('全选');
                }

                $timeout(function () {
                    $select.trigger("chosen:updated");
                });
            };
        });
    };
    noticePageCtrl.$inject = ['$scope', '$element', '$timeout'];

    //
    function noticeSubmitCtrl($scope) {
        $scope.submitCallBack = function (_data1, _data2) {
            if (_data2) {
                alert("提交成功");
                if (_data2.url) {
                    window.location.assign(_data2.url);
                } else {
                    window.location.reload();
                }
            } else {
                alert("提交失败");
            }
        }
    };
    noticeSubmitCtrl.$inject = ['$scope'];

    angular.module('manageApp.project')
        .controller('importScoreCtrl', importScoreCtrl)
        .controller('noticePageCtrl', noticePageCtrl)
        .controller('noticeSubmitCtrl', noticeSubmitCtrl)
});