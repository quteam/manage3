/**
 * Created by hao on 15/11/18.
 */
define('main/services', ['main/init'], function () {
    //请求拦截 用于登录超时
    function redirectInterceptor($q, $location) {
        return {
            response: function (response) {
                if (typeof response.data === 'string' && /^<!DOCTYPE html>/.test(response.data)) {
                    window.location.assign(response.config.url);
                    return response;
                } else {
                    return response;
                }
            }
        }
    };
    redirectInterceptor.$inject = ['$q', '$location'];

    //数据请求
    function requestData($q, $http, $httpParamSerializer) {
        return function (_url, _params) {
            var defer = $q.defer();
            $http({
                method: 'POST',
                url: _url,
                data: _params || {},
                transformRequest: function (data) {
                    return $httpParamSerializer(data);
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .success(function (_data, status, headers, config) {
                    if (status == 200 && _data.code == 200) {
                        defer.resolve([_data.data, _data]);
                    } else {
                        defer.reject(_data.msg || '出错了');
                    }
                })
                .error(function () {
                    defer.reject("提交失败!");
                });

            return defer.promise;
        }
    };
    requestData.$inject = ['$q', '$http', '$httpParamSerializer'];

    //弹窗确认
    function dialogConfirm($rootScope, modal) {
        return function (_text, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.confirmText = _text || '确定删除?';
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
    function dialogChart($rootScope, modal, $http) {
        return function (_url) {
            var _$scope = $rootScope.$new(false);
            var _params = {};
            var _urlObj = _url.split("?");
            if (_urlObj[1]) {
                angular.forEach(_urlObj[1].split("&"), function (_row) {
                    var _arr = _row.split("=");
                    _params[_arr[0]] = _arr[1];
                })
            }
            _$scope.url = _url;
            _$scope.urlParams = _params;
            modal.open({
                template: 'tpl/dialog-center.html',
                scope: _$scope
            });
        };
    };
    dialogChart.$inject = ['$rootScope', 'modal', '$http'];

    angular.module('manageApp.main')
        .factory('redirectInterceptor', redirectInterceptor)
        .service('requestData', requestData)
        .service('dialogConfirm', dialogConfirm)
        .service('dialog', dialog)
        .service('dialogChart', dialogChart)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('redirectInterceptor');
        }])
});