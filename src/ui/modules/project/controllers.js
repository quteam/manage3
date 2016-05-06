/**
 * Created by hao on 15/11/5.
 */

define('project/controllers', ['project/init'], function () {
    //录入成绩
    function importScoreCtrl($scope, requestData, $element, dialogConfirm, modal) {
        $scope.formData = {};

        $scope.typeStudent = function () {
            $element.find(".studentScoreIpt").focus();
        };

        $scope.typeScore = function ($e, _url, _data) {
            if ($e.keyCode == 13) {
                requestData(_url, _data)
                    .then(function () {
                        //刷新数据
                        $scope.formData.time = Date.now();
                        //
                        var $ipt = $element.find(".studentNameIpt input");
                        $ipt.val("").focus();
                        $element.find(".studentScoreIpt").val("");
                    })
                    .catch(function (error) {
                        alert(error || '录入成绩错误');
                    });
            }
        };

        $scope.saveScore = function (_text, _url, _data) {
            dialogConfirm(_text, function () {
                requestData(_url, _data)
                    .then(function () {
                        modal.closeAll();
                    })
                    .catch(function (error) {
                        alert(error || '保存错误');
                    })
            });
        }

    };
    importScoreCtrl.$inject = ['$scope', 'requestData', '$element', 'dialogConfirm', 'modal'];

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
                window.location.reload();
            } else {
                alert("提交失败")
            }
        }
    };
    noticeSubmitCtrl.$inject = ['$scope'];

    angular.module('manageApp.project')
        .controller('importScoreCtrl', importScoreCtrl)
        .controller('noticePageCtrl', noticePageCtrl)
        .controller('noticeSubmitCtrl', noticeSubmitCtrl)
});