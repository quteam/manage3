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
        'moment': '../libs/moment.min',
        'echarts': '../libs/echarts.min',
        'chosen': '../libs/chosen.jquery.min',
        'jQuery': '../libs/jquery.min',
        'angular': '../libs/angular.min'
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
define('datePicker', ['datepicker/datepicker']);

define('manageApp', [
    'angular',
    'manageApp.template',
    'manageApp.modal',
    'manageApp.main',
    'manageApp.project',
    'manageApp.upload',
    'datePicker'
], function () {
    return angular.module('manageApp', [
        'ngRoute',
        'manageApp.template',
        'manageApp.modal',
        'manageApp.main',
        'manageApp.project',
        'manageApp.upload',
        'datePicker'
    ]);
});

require(['manageApp'], function (app) {
    app.config(['$routeProvider', '$templateRequestProvider', function ($routeProvider, $templateRequestProvider) {
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

        $templateRequestProvider.httpOptions({
            headers: {
                'template': '1'
            }
        });
    }]);

    angular.bootstrap(document, ['manageApp']);
});