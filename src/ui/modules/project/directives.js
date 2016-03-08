/**
 * Created by hao on 15/11/5.
 */

define('project/directives', ['project/init'], function () {
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
                $scope.dataList = [];

                //$scope.$watch("dataList", function () {
                //    var formData = {};
                //    angular.forEach($scope.dataList, function (_row, _index) {
                //        var _data = {};
                //        for (var i = 0, l = _row.length; i < l; i++) {
                //            _data[inputName[i]] = _row[i];
                //        }
                //        formData[_index] = _data;
                //    });
                //    ngModel.$setViewValue(formData);
                //}, true);

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

    angular.module('manageApp.project')
        .directive('customConfig', customConfig)
});