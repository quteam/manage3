/**
 * Created by hao on 15/11/21.
 */

define('modal/directives', ['modal/init'], function () {

    //弹窗
    function modal(ngDialog) {
        return {
            restrict: 'A',
            scope: {
                modalScope: '='
            },
            link: function (scope, elem, attrs) {
                elem.on('click', function (e) {
                    e.preventDefault();

                    var ngDialogScope = angular.isDefined(scope.modalScope) ? scope.modalScope : 'noScope';
                    angular.isDefined(attrs.ngDialogClosePrevious) && ngDialog.close(attrs.ngDialogClosePrevious);

                    var defaults = ngDialog.getDefaults();

                    ngDialog.open({
                        template: attrs.ngDialog,
                        className: attrs.ngDialogClass || defaults.className,
                        controller: attrs.ngDialogController,
                        controllerAs: attrs.ngDialogControllerAs,
                        bindToController: attrs.ngDialogBindToController,
                        scope: ngDialogScope,
                        data: attrs.ngDialogData,
                        showClose: attrs.ngDialogShowClose === 'false' ? false : (attrs.ngDialogShowClose === 'true' ? true : defaults.showClose),
                        closeByDocument: attrs.ngDialogCloseByDocument === 'false' ? false : (attrs.ngDialogCloseByDocument === 'true' ? true : defaults.closeByDocument),
                        closeByEscape: attrs.ngDialogCloseByEscape === 'false' ? false : (attrs.ngDialogCloseByEscape === 'true' ? true : defaults.closeByEscape),
                        overlay: attrs.ngDialogOverlay === 'false' ? false : (attrs.ngDialogOverlay === 'true' ? true : defaults.overlay),
                        preCloseCallback: attrs.ngDialogPreCloseCallback || defaults.preCloseCallback
                    });
                });
            }
        };
    };
    modal.$inject = ['modal'];

    //右侧遮罩层
    function modalRight(ngDialog) {
        return {
            restrict: 'A',
            scope: {
                modalScope: '='
            },
            link: function ($scope, $elem, $attrs) {
                var dialogWidth = $attrs.modalRight || "50%";
                $elem.on('click', function (e) {
                    e.preventDefault();

                    ngDialog.close();
                    //var _dialogs = ngDialog.getOpenDialogs();
                    //if (_dialogs.length) {
                    //    return;
                    //};

                    ngDialog.open({
                        template: $attrs.modalUrl,
                        className: 'ngdialog-theme-right',
                        cache: false,
                        trapFocus: true,
                        overlay: ($attrs.modalOverlay == "true"),
                        data: $attrs.modalData || $scope.modalScope.tr,
                        scope: $scope.modalScope,
                        controller: ["$scope", "$element", function ($scope, $element) {
                            $(".ngdialog-content", $element).width(dialogWidth);
                        }]
                    });
                });
            }
        };
    };
    modalRight.$inject = ['modal'];

    //中间遮罩层
    function modalCenter(ngDialog) {
        return {
            restrict: 'A',
            scope: {
                modalScope: '='
            },
            link: function ($scope, $elem, $attrs) {
                var dialogWidth = $attrs.modalCenter || "50%";
                $elem.on('click', function (e) {
                    e.preventDefault();

                    //ngDialog.close();

                    ngDialog.open({
                        template: $attrs.modalUrl,
                        //className: 'ngdialog-theme-right',
                        cache: false,
                        trapFocus: false,
                        //overlay: false,
                        data: $attrs.modalData || $scope.modalScope.tr,
                        scope: $scope.modalScope,
                        controller: ["$scope", "$element", function ($scope, $element) {
                            $(".ngdialog-content", $element).width(dialogWidth);
                        }]
                    });
                });
            }
        };
    };
    modalCenter.$inject = ['modal'];

    angular.module('manageApp.modal')
        .directive("modal", modal)
        .directive("modalRight", modalRight)
        .directive("modalCenter", modalCenter);
});