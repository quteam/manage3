/**
 * Created by hao on 15/11/18.
 */
define('main/services', ['main/init'], function () {
    //弹窗确认
    function dialogConfirm($rootScope, modal) {
        return function (_text, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.confirmText = '确定删除?';
            modal.openConfirm({
                template: 'tpl/dialog-confirm.html',
                scope: _$scope
            }).then(_callBack);
        };
    };
    dialogConfirm.$inject = ['$rootScope', 'modal'];

    //普通弹窗
    function dialog($rootScope, modal) {
        return function (_content, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.content = _content;
            modal.openConfirm({
                template: 'tpl/dialog-center.html',
                scope: _$scope
            }).then(_callBack);
        };
    };
    dialog.$inject = ['$rootScope', 'modal'];

    //图表弹窗
    function dialogChart($rootScope, modal) {
        return function (_url) {
            var _$scope = $rootScope.$new(false);
            _$scope.url = _url;
            modal.open({
                template: 'tpl/dialog-chart.html',
                scope: _$scope
            });
        };
    };
    dialogChart.$inject = ['$rootScope', 'modal'];


    angular.module('manageApp.main')
        .service('dialogConfirm', dialogConfirm)
        .service('dialog', dialog)
        .service('dialogChart', dialogChart)
});