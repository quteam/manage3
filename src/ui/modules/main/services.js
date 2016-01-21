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

    angular.module('manageApp.main')
        .service('dialogConfirm', dialogConfirm)
});