/**
 * Created by hao on 15/11/5.
 */

define('project/directives', ['project/init'], function () {

    /**
     * 项目列表
     */
    function projectMenu($http, $httpParamSerializer) {
        return {
            restrict: 'EA',
            scope: true,
            transclude: true,
            link: function ($scope, $element, $attrs, $ctrls, $transclude) {
                $transclude($scope, function (clone) {
                    $element.append(clone);
                });

                $scope.isLoading = true;
                $http({
                    method: 'POST',
                    url: $attrs.projectMenu,
                    transformRequest: function (data) {
                        return $httpParamSerializer(data);
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .success(function (data, status, headers, config) {
                        $scope.isLoading = false;
                        if (data.code == 200) {
                            $scope.projectList = data.data;
                            $scope.show($scope.projectList[0]);
                        }
                    })
                    .error(function () {
                        $scope.isLoading = false;
                    });
            }
        }
    };
    projectMenu.$inject = ["$http", "$httpParamSerializer"];

    /**
     * 进度条
     */
    function projectPanel() {
        return {
            restrict: 'EA',
            scope: true,
            transclude: true,
            link: function ($scope, $element, $attrs, $ctrls, $transclude) {
                $transclude($scope, function (clone) {
                    $element.append(clone);
                });

                $scope.options.panelUrl = $attrs.projectPanel;
            }
        }
    };

//
    angular.module('manageApp.project')
        .directive('projectMenu', projectMenu)
        .directive('projectPanel', projectPanel)
});