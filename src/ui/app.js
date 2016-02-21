/**
 * Created by hao on 15/11/5.
 */

//load css files
!(function () {
    var scripts = document.getElementsByTagName("script");
    var loaderScript = scripts[scripts.length - 1];
    require.dir = loaderScript.src.match(/[^?#]*\//)[0];
})();


require.config({
    baseUrl: require.dir + 'modules',
    paths: {
        'echarts': '../libs/echarts.min',
        'chosen': '../libs/chosen.jquery.min',
        'jQuery': '../libs/jquery.min',
        'angular': '../libs/angular'
    },
    shim: {
        'jQuery': {
            exports: 'jQuery'
        },
        'chosen': {
            deps: ['jQuery']
        },
        'echarts': {
            exports: 'echarts'
        },
        'angular': {
            deps: ['jQuery'],
            exports: 'angular'
        }
    },
    urlArgs: ''
});

//@ifdef !production
define('manageApp.template', ['angular'], function () {
    angular.module('manageApp.template', [])
});
//@endif


define('manageApp.main', ['main/init', 'main/services', 'main/controllers', 'main/directives', 'main/filters']);
define('manageApp.project', ['project/init', 'project/services', 'project/controllers', 'project/directives', 'project/filters']);
define('manageApp.modal', ['modal/init', 'modal/services', 'modal/directives']);
define('manageApp.upload', ['upload/init', 'upload/directives']);

define('manageApp', [
    'angular',
    'manageApp.template',
    'manageApp.modal',
    'manageApp.main',
    'manageApp.project',
    'manageApp.upload'
], function () {
    return angular.module('manageApp', [
        'ngRoute',
        'manageApp.template',
        'manageApp.modal',
        'manageApp.main',
        'manageApp.project',
        'manageApp.upload'
    ]);
});

require(['manageApp'], function (app) {
    app.config(['$routeProvider', function ($routeProvider) {
        if (window.Config) {
            $routeProvider
                .when("/:page*", {
                    templateUrl: function (param) {
                        var _url = (Config.viewsDir || '') + param.page;
                        delete param.page;
                        var _param = $.param(param);
                        return _param ? _url + "?" + _param : _url;
                    },
                    resolve: {
                        load: function () {
                        }
                    }
                })
                .otherwise({redirectTo: Config.indexPage});
        } else {
            $routeProvider
                .when("/:page*", {
                    templateUrl: function (param) {
                        var _url = param.page;
                        delete param.page;
                        var _param = $.param(param);
                        return _param ? _url + "?" + _param : _url;
                    },
                    resolve: {
                        load: function () {
                        }
                    }
                })
        }
    }]);

    angular.bootstrap(document, ['manageApp']);
});