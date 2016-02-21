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

    angular.module('manageApp.project')
        .controller('importScoreCtrl', importScoreCtrl)
});