/**
 * Created by hao on 15/11/5.
 */

define('project/controllers', ['project/init'], function () {
    //录入成绩
    function importScoreCtrl($scope, requestData, $element) {
        $scope.formData = {};

        $scope.typeStudent = function () {
            $element.find("input").eq(1).focus();
        };

        $scope.typeScore = function ($e, _url, _data) {
            if ($e.keyCode == 13) {
                requestData(_url, _data)
                    .then(function () {
                        //刷新数据
                        $scope.formData.time = Date.now();
                        //
                        var $ipt = $element.find("input");
                        $ipt.val("").eq(0).focus();
                    })
                    .catch(function (error) {
                        alert(error || '录入成绩错误');
                    });
            }
        }
    };
    importScoreCtrl.$inject = ['$scope', 'requestData', '$element'];

    //发送通知
    function noticePageCtrl($scope, $element, $timeout) {
        var $select = $element.find(".selectRecipient");
        $scope.recipient = [];
        $scope.recipientList = [];
        $scope.selectOne = function (_data) {
            var _index = $scope.recipientList.indexOf(_data);
            if (_index > -1) {
                $scope.recipientList.splice(_index, 1);
                $scope.recipient.splice(_index, 1);
            } else {
                $scope.recipientList.push(_data);
                $scope.recipient.push(_data.id);
            }
            $timeout(function () {
                $select.trigger("chosen:updated");
            });
        };


        $scope.selectMultiple = function (trees, e) {
            var $e = $(e.currentTarget);
            var isSelected = $e.data("selected");
            angular.forEach(trees, function (_node) {
                var _index = $scope.recipientList.indexOf(_node);
                if (isSelected) {
                    if (_index > -1) {
                        $scope.recipientList.splice(_index, 1);
                        $scope.recipient.splice(_index, 1);
                    }
                } else {
                    if (_index == -1) {
                        $scope.recipientList.push(_node);
                        $scope.recipient.push(_node.id);
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
    };
    noticePageCtrl.$inject = ['$scope', '$element', '$timeout'];

    angular.module('manageApp.project')
        .controller('importScoreCtrl', importScoreCtrl)
        .controller('noticePageCtrl', noticePageCtrl)
});