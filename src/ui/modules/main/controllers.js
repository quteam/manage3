/**
 * Created by hao on 15/11/5.
 */

define('main/controllers', ['main/init'], function () {
    /**
     * 主控
     */
    function mainCtrl($scope) {
        $scope.mainStatus = {
            navFold: document.body.clientWidth < 1500,
            navigation: "",
            msgBubble: 0 //消息气泡
        };

        //页面跳转
        $scope.pageTo = function (_url) {
            window.location.assign(_url);
        };

        //获取主要信息
        $.getJSON(Config.getMainInfo, function (_data) {
                if (_data.code == 200) {
                    angular.extend($scope.mainStatus, _data.data);
                }
            })
            .complete(function () {
                $scope.$digest();
            });

        //后退
        $(document).on("click", ".top-nav-wrap .backBtn", function () {
            window.history.back();
        })
    };
    mainCtrl.$inject = ["$scope"];

    /**
     * 一个空控制器
     */
    function oneCtrl() {

    }

    /**
     * 侧边菜单
     */
    function sideNav($scope) {
    };
    sideNav.$inject = ["$scope"];

    /**
     *
     */
    function pageCtrl($scope, modal) {
        modal.close();
    };
    pageCtrl.$inject = ["$scope", "modal"];


    angular.module('manageApp.main')
        .controller('mainCtrl', mainCtrl)
        .controller('oneCtrl', oneCtrl)
        .controller('sideNav', sideNav)
        .controller('pageCtrl', pageCtrl)
});