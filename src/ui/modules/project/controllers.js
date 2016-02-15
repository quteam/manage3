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

    angular.module('manageApp.project')
        .controller('projectPanelCtrl', projectPanelCtrl)
});