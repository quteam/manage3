/**
 * Created by hao on 15/11/5.
 */

define('project/controllers', ['project/init'], function () {

    angular.module('manageApp.project')
        .controller('projectPanelCtrl', projectPanelCtrl)
});