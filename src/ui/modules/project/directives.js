/**
 * Created by hao on 15/11/5.
 */

define('project/directives', ['moment', 'project/init'], function (moment) {
    //日历系统
    function tableCalendar(requestData) {
        return {
            link: function ($scope, $element, $attrs) {
                $scope.statusList = {};
                $scope.dateSelect = function (_date) {
                    window.location.assign($attrs.selectTo + _date.format("YYYY-MM-DD"));
                };
                $scope.changeMonth = function (_date) {
                    var _month = _date.format("YYYY-MM");
                    requestData($attrs.tableCalendar, {month: _month})
                        .then(function (_data) {
                            $scope.statusList = _data[0];
                        })
                };
                $scope.changeMonth(moment());
            }
        }
    };
    tableCalendar.$inject = ["requestData"];

    /**
     * 打分
     */
    function scoreConfig() {
        return {
            restrict: 'AE',
            scope: {
                teacherList: "=",
                selectCount: "=?"
            },
            require: "?^ngModel",
            transclude: true,
            link: function ($scope, $element, $attrs, ngModel, $transclude) {
                $scope.$watch("teacherList", function (value) {
                    if (value) {
                        var _count = 0;
                        angular.forEach(value, function (v, k) {
                            if (v.ruleIdList.length) {
                                _count++;
                            }
                        });
                        ngModel.$setViewValue(_count);
                    }
                }, true);

                $transclude($scope, function (clone) {
                    $element.append(clone);
                });
            }
        };
    };

    angular.module('manageApp.project')
        .directive('tableCalendar', tableCalendar)
        .directive('scoreConfig', scoreConfig)
});