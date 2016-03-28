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

    angular.module('manageApp.project')
        .directive('tableCalendar', tableCalendar)
});