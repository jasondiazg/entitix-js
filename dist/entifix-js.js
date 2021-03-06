'use strict';

(function () {
    'use strict';

    //Module creation

    var entifix = angular.module('entifix-js', ['app.config', 'angular-jwt', 'angular-md5']);

    //Init components    
    entifix.directive('compile', ['$compile', function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(function (scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            }, function (value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            });
        };
    }]);

    entifix.service('BaseComponentFunctions', service);
    service.$inject = [];
    function service() {
        var sv = this;

        //Properties

        //Methods
        sv.CreateStringHtmlComponent = function (componentConstruction) {
            var stringbindings = '';
            if (componentConstruction.bindings) if (componentConstruction.bindings.length > 0) for (var i = 0; i < componentConstruction.bindings.length; i++) {
                stringbindings += componentConstruction.bindings[i].name + '=' + '"' + componentConstruction.bindings[i].value + '"';
            }var stringhtml = '<' + componentConstruction.name;

            if (stringbindings.length > 0) stringhtml += ' ' + stringbindings;

            stringhtml += '></' + componentConstruction.name + '>';

            return stringhtml;
        };

        sv.CreateStringHtmlComponentAndBindings = function (componentConstruction, bindingConnectionPath) {
            var stringbindings = '';
            var objectbindings = {};
            if (componentConstruction.bindings) {
                if (componentConstruction.bindings.length > 0) {
                    for (var i = 0; i < componentConstruction.bindings.length; i++) {
                        var binding = componentConstruction.bindings[i];
                        var tempstring = binding.name + '=';

                        var isCorrect = false;

                        //String binding
                        if (typeof binding.value == 'string') {
                            tempstring += '"' + binding.value;
                            isCorrect = true;
                        };

                        //Object and Method binding
                        if (!isCorrect && bindingConnectionPath && binding.value != null) {
                            tempstring += '"' + bindingConnectionPath + '.' + binding.name;
                            objectbindings[binding.name] = binding.value;
                            isCorrect = true;
                        };

                        if (isCorrect) stringbindings += ' ' + tempstring + (binding.isExecutable ? '()"' : '"');
                    }
                }
            }

            var stringhtml = '<' + componentConstruction.name;

            if (stringbindings.length > 0) stringhtml += stringbindings;

            stringhtml += '></' + componentConstruction.name + '>';

            var result = {
                stringhtml: stringhtml,
                objectbindings: objectbindings
            };

            return result;
        };

        return sv;
    };
})();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// SESSION PROVIDER ******************************************************************************************
// ============================================================================================================
// ============================================================================================================ 
// ============================================================================================================
(function () {
    'use strict';

    var module = angular.module('entifix-js');

    module.provider("EntifixSession", [function () {

        var prov = this;

        // SERVICE INSTANCE __________________________________________________________________________________________________________________________________________________________________________
        // ===========================================================================================================================================================================================
        // ===========================================================================================================================================================================================
        prov.$get = ['EntifixConfig', '$state', '$injector', 'jwtHelper', 'md5', '$window', function (EntifixConfig, $state, $injector, jwtHelper, md5, $window) {

            var sv = {};

            //Properties and Fields___________________________________________________________________________________________________________________________
            //================================================================================================================================================

            //Fields
            var _inLoginProcess = false;
            var _currentUser = null;
            var _currentUserName = null;
            var _currentSystemOwner = null;
            var _currentPermissions = null;
            var _isRefreshingToken = false;
            var _user = null;

            //Properties
            sv.isInLoginProcess = {
                get: function get() {
                    return _inLoginProcess;
                }
            };

            sv.isRefreshingToken = {
                get: function get() {
                    return _isRefreshingToken;
                },
                set: function set(value) {
                    _isRefreshingToken = value;
                }
            };

            sv.redirect = {
                get: function get() {
                    return localStorage.getItem(EntifixConfig.redirectName);
                },
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.redirectName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.redirectName.get());
                }
            };

            sv.authApp = {
                get: function get() {
                    return localStorage.getItem(EntifixConfig.authAppName);
                },
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.authAppName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.authAppName.get());
                }
            };

            sv.authToken = {
                get: function get() {
                    return localStorage.getItem(EntifixConfig.authTokenName.get());
                },
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.authTokenName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.authTokenName.get());
                }
            };

            sv.refreshTokenLS = {
                get: function get() {
                    return localStorage.getItem(EntifixConfig.refreshTokenName.get());
                },
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.refreshTokenName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.refreshTokenName.get());
                }
            };

            sv.permissionsToken = {
                get: function get() {
                    return localStorage.getItem(EntifixConfig.permissionsTokenName.get());
                },
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.permissionsTokenName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.permissionsTokenName.get());
                }
            };

            sv.user = {
                get: function get() {
                    return _user;
                },
                set: function set(user) {
                    return _user = user;
                }
            };

            sv.expiredSessionKey = {
                set: function set(value) {
                    localStorage.setItem(EntifixConfig.expiredSessionKeyName.get(), value);
                },
                remove: function remove() {
                    localStorage.removeItem(EntifixConfig.expiredSessionKeyName.get());
                }
            };

            sv.currentUser = {
                get: function get() {
                    if (_currentUser == null) {
                        var tmptoken = sv.authToken.get();
                        if (tmptoken) _currentUser = jwtHelper.decodeToken(tmptoken).name;
                    }
                    return _currentUser;
                }
            };

            sv.currentUserName = {
                get: function get() {
                    if (_currentUserName == null) {
                        var tmptoken = sv.authToken.get();
                        if (tmptoken) _currentUserName = jwtHelper.decodeToken(tmptoken).userName;
                    }
                    return _currentUserName;
                }
            };

            sv.currentSystemOwner = {
                get: function get() {
                    var tmptoken = sv.authToken.get();
                    if (tmptoken) _currentSystemOwner = jwtHelper.decodeToken(tmptoken).systemOwner;
                    return _currentSystemOwner;
                }
            };

            sv.currentPermissions = {
                get: function get() {
                    if (_currentPermissions == null) {
                        var tmptoken = sv.permissionsToken.get();
                        if (tmptoken) _currentPermissions = jwtHelper.decodeToken(tmptoken).permissions;
                    }
                    return _currentPermissions;
                }

                //================================================================================================================================================

                //Methods_________________________________________________________________________________________________________________________________________
                //================================================================================================================================================

                // Public section _____________________________________________________________________

            };sv.TryLogIn = function (user, password, actionAccept, actionReject, actionError) {
                _inLoginProcess = true;

                //Resouce to login
                var hashPass = md5.createHash(password);

                var $http = $injector.get('$http');
                $http({
                    method: 'POST',
                    url: EntifixConfig.authUrl.get(),
                    data: { user: user, password: hashPass }
                }).then(function (response) {
                    if (!response.data.isLogicError) {
                        if (EntifixConfig.devMode.get()) console.info('DevMode: Login success');

                        //Save token from response
                        sv.saveTokens(response.data.data[EntifixConfig.authTokenName.get()], response.data.data[EntifixConfig.refreshTokenName.get()]);

                        if (actionAccept) actionAccept();

                        _inLoginProcess = false;

                        if (!actionAccept && !EntifixConfig.devMode.get()) manageAuthRedirectAction();
                    } else {
                        if (EntifixConfig.devMode.get()) console.info('DevMode: Login reject with message - ' + response.data.message);

                        if (actionReject) actionReject(response.data.message);

                        _inLoginProcess = false;
                    }
                }, function (error) {
                    if (EntifixConfig.devMode.get()) console.warn('DevMode: Login error');

                    if (actionError) actionError(error);

                    _inLoginProcess = false;
                });
            };

            sv.refreshToken = function (actionAccept, actionReject, actionError) {
                if (sv.refreshTokenLS.get() && !jwtHelper.isTokenExpired(sv.refreshTokenLS.get()) && !sv.isRefreshingToken.get()) {
                    _inLoginProcess = true;
                    sv.isRefreshingToken.set(true);
                    var $http = $injector.get('$http');
                    $http({
                        method: 'POST',
                        url: EntifixConfig.refreshUrl.get(),
                        data: _defineProperty({}, EntifixConfig.refreshTokenName.get(), sv.refreshTokenLS.get())
                    }).then(function (response) {

                        if (!response.data.isLogicError) {
                            if (EntifixConfig.devMode.get()) console.info('DevMode: Refresh success');

                            //Save token from response
                            sv.saveTokens(response.data.data[EntifixConfig.authTokenName.get()], response.data.data[EntifixConfig.refreshTokenName.get()]);

                            if (actionAccept) actionAccept(response.data);
                        } else {
                            if (actionReject) actionReject(response.data.message);

                            if (EntifixConfig.devMode.get()) {
                                console.info('DevMode: Refresh token reject with message - ' + response.data.message);
                                sv.tryLoginAsDeveloper();
                            } else manageRedirectAction();
                        }

                        _inLoginProcess = false;
                        sv.isRefreshingToken.set(false);
                    }, function (error) {
                        _inLoginProcess = false;
                        sv.isRefreshingToken.set(false);

                        if (actionError) actionError(error);

                        if (EntifixConfig.devMode.get()) {
                            console.warn('DevMode: Refresh token error');
                            sv.tryLoginAsDeveloper();
                        } else {
                            sv.expiredSessionKey.set(true);
                            manageRedirectAction();
                        }
                    });
                } else {
                    if (EntifixConfig.devMode.get()) {
                        console.warn('DevMode: There is no refresh token');
                        sv.tryLoginAsDeveloper().then(function () {
                            console.info('Login successfully');
                        }).catch(function (error) {
                            console.error('Error when trying login as developer ' + error);
                        });
                    } else {
                        sv.expiredSessionKey.set(true);
                        manageRedirectAction();
                    }
                }
            };

            sv.checkPermissions = function (permission) {
                if (sv.currentPermissions.get()) {
                    if (permission instanceof String) {
                        return sv.currentPermissions.get().filter(function (e) {
                            return e == permission;
                        }).length > 0;
                    } else if (permission instanceof Array) {
                        return permission.filter(function (p) {
                            return sv.currentPermissions.get().filter(function (e) {
                                return e == p;
                            }).length > 0;
                        }).length > 0;
                    }
                } else {
                    return false;
                }
            };

            sv.checkNavigation = function (transition) {
                checkAuthentication(transition);
                checkStatePermissions(transition);
            };

            sv.tryLoginAsDeveloper = function () {
                return new Promise(function (resolve, reject) {
                    if (!EntifixConfig.devMode.get()) {
                        console.error('Developer login tried in without DevMode');
                        reject();
                    }

                    if (!EntifixConfig.devUser.get()) {
                        console.warn('DevMode: No developer user configuration');
                        reject();
                    }

                    sv.TryLogIn(EntifixConfig.devUser.get().user, EntifixConfig.devUser.get().password, resolve, null, reject);
                });
            };

            sv.loadPermissions = function () {
                var $http = $injector.get('$http');
                $http({ method: 'GET', url: EntifixConfig.permissionsUrl.get() }).then(function (response) {
                    var permissions = response.data && response.data.data ? jwtHelper.decodeToken(response.data.data[EntifixConfig.permissionsTokenName.get()]).permissions : [];
                    if (permissions && permissions.length > 0) {
                        sv.permissionsToken.set(response.data.data[EntifixConfig.permissionsTokenName.get()]);
                    } else {
                        if (!EntifixConfig.devMode.get()) {
                            manageRedirectAction();
                        }
                    }
                }, function (error) {
                    var $mdToast = $injector.get('$mdToast');
                    $mdToast.show($mdToast.simple().textContent('Error when trying to load permissions...').position('bottom right').hideDelay(3000));
                });
            };

            sv.saveTokens = function (token, refreshToken) {
                sv.authToken.set(token);
                sv.refreshTokenLS.set(refreshToken);
                sv.expiredSessionKey.remove();
            };

            sv.logout = function () {
                sv.authToken.remove();
                sv.refreshTokenLS.remove();
                sv.permissionsToken.remove();
                sv.redirect.set(EntifixConfig.thisApplication.get());
                sv.authApp.set(EntifixConfig.authUrl.get());
                $window.location.href = EntifixConfig.authApplication.get();
            };

            // Private section _____________________________________________________________________
            function manageAuthRedirectAction() {
                var redirectTo = sv.redirect.get();
                if (redirectTo != null) {
                    sv.redirect.remove();
                    sv.authApp.remove();
                    $window.location.href = redirectTo;
                } else if (EntifixConfig.thisApplication.get()) $window.location.href = EntifixConfig.thisApplication.get();
            };

            function manageRedirectAction() {
                sv.logout();
            }

            function checkAuthentication(transition) {
                var e = transition.$from();
                var toState = transition.$to();
                var authSkipped = toState.skipAuthorization || false;
                var authenticated = sv.authToken.get() != null && !jwtHelper.isTokenExpired(sv.refreshTokenLS.get());
                var requiresLogin = toState.data && (toState.data.requiresLogin || toState.data.requiresLoginDev) && !authSkipped;

                if (requiresLogin && !authenticated) {
                    if (EntifixConfig.devMode.get()) {
                        console.info('DevMode: No active session');
                        if (EntifixConfig.authApplication.get()) console.warn('DevMode: Redirect to ' + EntifixConfig.authApplication.get());else console.warn('DevMode: No auth application registered');
                    } else {
                        transition.abort();
                        manageRedirectAction();
                    }
                }
            };

            function checkStatePermissions(transition) {
                var e = transition.$from();
                var toState = transition.$to();
                if (toState.data && toState.data.securityContext) {
                    if (!sv.checkPermissions(toState.data.securityContext)) {
                        var m = 'There is no unauthorized state defined';

                        if (!EntifixConfig.devMode.get()) {
                            if (EntifixConfig.unauthorizedStateName.get()) {
                                console.warn('Permission required: ' + toState.data.securityContext + ' - Redirect to no authorization state: ' + EntifixConfig.unauthorizedStateName.get());
                                transition.abort();
                                $state.go(EntifixConfig.unauthorizedStateName.get());
                            } else console.error(m);
                        } else {
                            console.info('DevMode: Not allowed acces to this state => ' + toState.name);
                            console.warn(m);
                        }
                    }
                } else return true;
            };

            //================================================================================================================================================


            return sv;
        }];
        // ============================================================================================================================================================================================================================
        // ============================================================================================================================================================================================================================
    }]);
})();

// NO AUTHORIZED COMPONENT ************************************************************************************
// ============================================================================================================
// ============================================================================================================ 
// ============================================================================================================
(function () {
    'use strict';

    var component = {
        template: '<div layout="column" layout-align="center center"> \
                        <div> \
                            <img ng-src="{{vm.imgError}}"/> \
                        </div> \
                        <div class="text-danger"> \
                            <h1>&nbsp; {{vm.header}}</h1> \
                        </div> \
                        <div> \
                            <h2>{{vm.infoError}}</h2> \
                        </div> \
                        <div> \
                            <h3>{{vm.infoUser}}</h3> \
                        </div> \
                        <div> \
                            <p>{{vm.footer}}</p> \
                        </div> \
                    </div> \
                    ',
        controller: componentController,
        controllerAs: 'vm',
        bindings: {
            infoError: '@',
            header: '@',
            infoUser: '@',
            footer: '@',
            imgError: '@'
        }
    };

    componentController.$inject = ['EntifixSession'];
    function componentController(EntifixSession) {
        var vm = this;

        vm.$onInit = function () {
            vm.nameCurrentUser = EntifixSession.currentUser.get();
            vm.currentUserName = EntifixSession.currentUserName.get();
            vm.header = vm.header ? vm.header : 'Acceso Restringido';
            vm.infoError = vm.infoError ? vm.infoError : 'El usuario actual no tiene permisos para ver el recurso solicitado';
            vm.infoUser = vm.infoUser ? vm.infoUser : "Usuario: " + vm.nameCurrentUser + " - " + vm.currentUserName;
            vm.footer = vm.footer ? vm.footer : "Si necesita el acceso, por favor comuníquese con el administrador del sistema.";
            vm.imgError = vm.imgError ? vm.imgError : "./app/img/error.png";
        };
    };

    angular.module('entifix-js').component('entifixNoAuthorized', component);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').filter('percentage', ['$filter', function ($filter) {
        return function (input) {
            var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
            return $filter('number')(input * 100, decimals) + '%';
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive('entifixElasticTextArea', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function link($scope, element) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function resize() {
                    if ($scope.initialHeight != '') {
                        element[0].style.height = $scope.initialHeight;
                        $scope.initialHeight = '';
                    } else element[0].style.height = "" + element[0].scrollHeight + "px";
                };
                element.on("input change", resize);
                $timeout(resize, 0);
            }
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive("entifixFileRead", [function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    if (!attrs.multiple) {
                        var files = elem[0].files[0];
                        ngModel.$setViewValue(files);
                    } else {
                        var files = elem[0].files;
                        ngModel.$setViewValue(files);
                    }
                });
            }
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive('entifixNextFocus', function () {
        return {
            restrict: 'A',
            link: function link($scope, elem, attrs) {

                elem.bind('keydown', function (e) {
                    var code = e.keyCode || e.which;
                    if (code === 13 || code === 39 || code === 9) {
                        var focusNext;
                        var len;
                        e.preventDefault();
                        var pageElems = document.querySelectorAll(attrs.nextFocus),
                            elem = e.target;
                        focusNext = false, len = pageElems.length;
                        for (var i = 0; i < len; i++) {
                            var pe = pageElems[i];
                            if (focusNext) {
                                if (pe.style.display !== 'none') {
                                    pe.focus();
                                    break;
                                }
                            } else if (pe === e.target) {
                                focusNext = true;
                            }
                        }
                    }
                    if (code === 37) {
                        var focusPrevious;
                        var len;
                        e.preventDefault();
                        var pageElems = document.querySelectorAll(attrs.nextFocus),
                            elem = e.target;
                        focusPrevious = false, len = pageElems.length;
                        for (var i = len - 1; i >= 0; i--) {
                            var pe = pageElems[i];
                            if (focusPrevious) {
                                if (pe.style.display !== 'none') {
                                    pe.focus();
                                    break;
                                }
                            } else if (pe === e.target) {
                                focusPrevious = true;
                            }
                        }
                    }
                });
            }
        };
    });
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive('entifixNumberBlock', function () {
        return {
            restrict: 'A',
            link: function link($scope, elem, attrs) {
                if (attrs.numberValidation == "true") {
                    elem.bind('keydown', function (e) {
                        var code = e.keyCode || e.which;
                        if (!(code === 8 || // backspace
                        code === 46 || // delete
                        code === 110 || code === 190 || // decimal point
                        code === 9 || // tab
                        code === 37 || // left arrow
                        code === 39 || // right arrow
                        code >= 48 && code <= 57 && !e.shiftKey || code >= 96 && code <= 105 && !e.shiftKey)) {
                            // numbers
                            e.preventDefault();
                        }
                    });
                }
            }
        };
    });
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive('entifixNumberValidation', function () {
        return {
            require: 'ngModel',
            link: function link(scope, element, attrs, ctrl) {
                if (attrs.numberValidation == "true") {
                    ctrl.$parsers.push(function (value) {
                        if (ctrl.$isEmpty(value)) {
                            ctrl.$setValidity('number', true);
                            return null;
                        } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
                            ctrl.$setValidity('number', true);
                            return value;
                        } else ctrl.$setValidity('number', false);
                    });
                }
            }
        };
    });
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').directive("entifixSecurityContext", ['EntifixSession', '$compile', function (EntifixSession, $compile) {
        return {
            restrict: 'A',
            priority: 1001,
            terminal: true,
            scope: {
                perm: "&permission"
            },
            compile: function compile(element, attributes) {
                var permission = attributes.entifixSecurityContext;

                element.removeAttr('entifix-security-context');

                if (EntifixSession.checkPermissions(permission)) element.attr('ng-if', true);else element.attr('ng-if', false);

                var fn = $compile(element);
                return function (scope) {
                    fn(scope);
                };
            }
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').service('EntifixDateGenerator', service);

    service.$inject = [];

    function service() {
        var vm = this;

        // Properties and fields
        // =========================================================================================================================

        // Fields

        // Properties

        // =========================================================================================================================


        // Methods
        // =========================================================================================================================

        function activate() {};

        vm.transformStringToDate = function (value) {
            if (isInvalidDate(value)) {
                var dayOrYear = value.split("-");
                if (dayOrYear.length > 0 && dayOrYear[0].length > 2) var isToDisplay = false;else var isToDisplay = true;

                if (value.length > 10) var isDateTime = true;else var isDateTime = false;

                if (value && !(value instanceof Date)) {
                    if (isDateTime) {
                        if (isToDisplay) {
                            var reggie = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/;
                            var dateArray = reggie.exec(value);
                            return new Date(+dateArray[3], +dateArray[2] - 1, +dateArray[1], +dateArray[4], +dateArray[5], +dateArray[6]);
                        } else {
                            var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
                            var dateArray = reggie.exec(value);
                            return new Date(+dateArray[1], +dateArray[2] - 1, +dateArray[3], +dateArray[4], +dateArray[5], +dateArray[6]);
                        }
                    } else {
                        if (isToDisplay) {
                            var reggie = /(\d{2})-(\d{2})-(\d{4})/;
                            var dateArray = reggie.exec(value);
                            return new Date(+dateArray[3], +dateArray[2] - 1, +dateArray[1]);
                        } else {
                            var reggie = /(\d{4})-(\d{2})-(\d{2})/;
                            var dateArray = reggie.exec(value);
                            return new Date(+dateArray[3], +dateArray[2] - 1, +dateArray[1]);
                        }
                    }
                } else if (value) {
                    return value;
                } else return null;
            } else return new Date(value);
        };

        vm.transformDateToString = function (value, type, isToDisplay) {
            var valueToReturn;
            var type = type.toUpperCase();
            if (value instanceof Date) {
                if (type == 'DATE' || type == 'DATETIME') {
                    var year = value.getFullYear();
                    var month = (value.getMonth() + 1).toString();
                    var day = value.getDate().toString();

                    if (month.length < 2) month = '0' + month;
                    if (day.length < 2) day = '0' + day;

                    if (isToDisplay) valueToReturn = day + '-' + month + '-' + year;else valueToReturn = year + '-' + month + '-' + day;
                }

                if (type == 'DATETIME' || type == 'TIME') {
                    var hours = value.getHours().toString();
                    var minutes = value.getMinutes().toString();
                    var seconds = value.getSeconds().toString();

                    if (hours.length < 2) hours = '0' + hours;
                    if (minutes.length < 2) minutes = '0' + minutes;
                    if (seconds.length < 2) seconds = '0' + seconds;

                    if (type == 'DATETIME') valueToReturn += ' ';

                    valueToReturn += hours + ':' + minutes + ':' + seconds;
                }
                return valueToReturn;
            }
            return value;
        };

        function isInvalidDate(value) {
            var valueDate = new Date(value);
            if (valueDate === 'Invalid Date' || isNaN(valueDate)) return true;
            return false;
        }

        // =========================================================================================================================

        // Constructor call
        activate();
    };
})();
'use strict';

(function () {
        'use strict';

        angular.module('entifix-js').service('EntifixStringUtils', service);

        service.$inject = [];

        function service() {
                var vm = this;

                // Properties and fields
                // =========================================================================================================================

                // Fields
                var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";

                // Properties

                // =========================================================================================================================


                // Methods
                // =========================================================================================================================

                function activate() {};

                vm.getCleanedString = function (stringToClean) {
                        for (var i = 0; i < specialChars.length; i++) {
                                stringToClean = stringToClean.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
                        }stringToClean = stringToClean.toLowerCase();
                        stringToClean = stringToClean.replace(/ /g, "");
                        stringToClean = stringToClean.replace(/á/gi, "a");
                        stringToClean = stringToClean.replace(/é/gi, "e");
                        stringToClean = stringToClean.replace(/í/gi, "i");
                        stringToClean = stringToClean.replace(/ó/gi, "o");
                        stringToClean = stringToClean.replace(/ú/gi, "u");
                        stringToClean = stringToClean.replace(/ñ/gi, "n");
                        return stringToClean;
                };

                // =========================================================================================================================

                // Constructor call
                activate();
        };
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').factory('EntifixCollectionFormatter', factory);

    factory.$inject = ['EntifixDateGenerator'];

    function factory(EntifixDateGenerator) {
        return function () {
            var vm = this;

            // Properties and fields
            // =========================================================================================================================

            // Fields
            var _transformValues = [];

            // Properties

            // =========================================================================================================================


            // Methods
            // =========================================================================================================================

            function activate() {};

            function getFilters(collection, singleParam) {
                var filters = [];
                collection.forEach(function (element) {
                    if (element[singleParam.property]) filters.push({ property: singleParam.resource.getKeyProperty.get(), value: element[singleParam.property] });
                });
                return filters;
            }

            function processProperty(collection, singleParam, onEnd) {
                if (singleParam.type == 'entity') {
                    if (!(_transformValues && _transformValues.length > 0 && _transformValues.filter(function (tv) {
                        return tv.property == singleParam.property;
                    }).length > 0)) {
                        var filters = getFilters(collection, singleParam);
                        singleParam.resource.getEnumerationBind(singleParam.display, function (enumeration) {
                            _transformValues.push({ property: singleParam.property, enumResult: enumeration });
                            transformValue(collection, singleParam, onEnd);
                        }, null, filters);
                    }
                    transformValue(collection, singleParam, onEnd);
                } else {
                    transformValue(collection, singleParam, onEnd);
                }
            };

            function transformValue(collection, singleParam, onEnd) {
                collection.forEach(function (element) {
                    var value = element[singleParam.property];

                    //Transform dates
                    if (value && singleParam.type == 'date' || singleParam.type == 'datetime') {
                        if (value && !(value instanceof Date)) var asDate = EntifixDateGenerator.transformStringToDate(value);else if (value) var asDate = value;else var asDate = null;

                        element[singleParam.outProperty || singleParam.property] = EntifixDateGenerator.transformDateToString(asDate, singleParam.type, true);
                        onEnd();
                    }

                    //Transform entity
                    if (singleParam.type == 'entity') {
                        var transform = function transform() {
                            var tempCollectionConf = _transformValues.filter(function (tv) {
                                return tv.property == singleParam.property;
                            });
                            if (tempCollectionConf.length > 0) {
                                var tempCollectionValues = tempCollectionConf[0].enumResult;
                                if (tempCollectionValues && tempCollectionValues.length > 0) {
                                    var idValue = value;
                                    if (value instanceof Object) idValue = singleParam.resource.getId(value);

                                    var tempValues = tempCollectionValues.filter(function (enumValue) {
                                        return enumValue.Value == idValue;
                                    });
                                    if (tempValues.length > 0) element[singleParam.outProperty || singleParam.property] = tempValues[0].Display;

                                    onEnd();
                                }
                            }
                        };

                        if (_transformValues && _transformValues.length > 0 && _transformValues.filter(function (tv) {
                            return tv.property == singleParam.property && tv.enumResult.length;
                        }).length > 0) transform();
                    }

                    if (singleParam.type == 'boolean') {
                        if (value) element[singleParam.outProperty || singleParam.property] = 'Si';else element[singleParam.outProperty || singleParam.property] = 'No';
                    }
                });
            }

            //parameters: Object
            // -> { collection, type, resource, property, display, outProperty }
            vm.transform = function (parameters) {
                return new Promise(function (resolve, reject) {
                    processProperty(parameters.collection, parameters, function () {
                        resolve();
                    });
                });
            };

            //parameters: Object
            // -> { collection, properties [ {type, resource, property, display, outProperty} ] }
            vm.transformMultiple = function (parameters) {
                _transformValues = [];
                return new Promise(function (resolve, reject) {
                    var transformed = 0;
                    var steps = 0;

                    parameters.properties.forEach(function (propertyParams) {
                        processProperty(parameters.collection, propertyParams, function () {
                            transformed++;
                            if (transformed >= parameters.collection.length) {
                                transformed = 0;
                                steps++;
                                if (steps >= parameters.properties.length) resolve();
                            }
                        });
                    });
                });
            };

            // =========================================================================================================================

            // Constructor call
            activate();
        };
    };
})();
'use strict';

// ENTIFIX GLOBAL CONFIGURATION *******************************************************************************
// ============================================================================================================

(function () {
    'use strict';

    var module = angular.module('entifix-js');

    module.provider("EntifixConfig", [function () {

        var prov = this;
        var $authUrl,
            $refreshUrl,
            $unauthorizedStateName,
            $authTokenName,
            $refreshTokenName,
            $expiredSessionKeyName,
            $redirectName,
            $authAppName,
            $thisApplication,
            $authApplication,
            $devMode = false,
            $devUser,
            $permissionsTokenName,
            $permissionsUrl,
            $systemOwnerEntityName,
            $systemOwnerEntitySwapName,
            $systemOwnerDisplayName,
            $idSystemOwnerPropertyName,
            $xlsSheetResourceName,
            $pdfResourceName;

        prov.setAuthUrl = function (value) {
            $authUrl = value;
        };

        prov.setRefreshUrl = function (value) {
            $refreshUrl = value;
        };

        prov.setUnauthorizedStateName = function (value) {
            $unauthorizedStateName = value;
        };

        prov.setAuthTokenName = function (value) {
            $authTokenName = value;
        };

        prov.setRefreshTokenName = function (value) {
            $refreshTokenName = value;
        };

        prov.setRedirectName = function (value) {
            $redirectName = value;
        };

        prov.setAuthName = function (value) {
            $authAppName = value;
        };

        prov.setThisApplication = function (value) {
            $thisApplication = value;
        };

        prov.setAuthApplication = function (value) {
            $authApplication = value;
        };

        prov.setDevMode = function (value) {
            $devMode = value;
        };

        prov.setDevUser = function (value) {
            $devUser = value;
        };

        prov.setPermissionsTokenName = function (value) {
            $permissionsTokenName = value;
        };

        prov.setPermissionsUrl = function (value) {
            $permissionsUrl = value;
        };

        prov.setExpiredSessionKeyName = function (value) {
            $expiredSessionKeyName = value;
        };

        prov.setSystemOwnerEntityName = function (value) {
            $systemOwnerEntityName = value;
        };

        prov.setSystemOwnerEntitySwapName = function (value) {
            $systemOwnerEntitySwapName = value;
        };

        prov.setSystemOwnerDisplayName = function (value) {
            $systemOwnerDisplayName = value;
        };

        prov.setIdSystemOwnerPropertyName = function (value) {
            $idSystemOwnerPropertyName = value;
        };

        prov.setXlsSheetResourceName = function (value) {
            $xlsSheetResourceName = value;
        };

        prov.setpdfResourceName = function (value) {
            $pdfResourceName = value;
        };

        prov.checkAuth = function () {
            var authenticated = localStorage.getItem($authTokenName);
            if (!authenticated) {
                localStorage.setItem($redirectName, $thisApplication);
                localStorage.setItem($authAppName, $authApplication);
                window.location.replace($authApplication);
            }
        };

        // SERVICE INSTANCE __________________________________________________________________________________________________________________________________
        // ===================================================================================================================================================
        prov.$get = [function () {

            var sv = {};

            //Properties and Fields___________________________________________________________________________________________________________________________
            //================================================================================================================================================

            //Fields

            sv.redirectName = {
                get: function get() {
                    return $redirectName;
                }
            };

            sv.authAppName = {
                get: function get() {
                    return $authAppName;
                }
            };

            sv.thisApplication = {
                get: function get() {
                    return $thisApplication;
                }
            };

            sv.authApplication = {
                get: function get() {
                    return $authApplication;
                }
            };

            sv.authUrl = {
                get: function get() {
                    return $authUrl;
                }
            };

            sv.refreshUrl = {
                get: function get() {
                    return $refreshUrl;
                }
            };

            sv.devMode = {
                get: function get() {
                    return $devMode;
                }
            };

            sv.authTokenName = {
                get: function get() {
                    return $authTokenName;
                }
            };

            sv.refreshTokenName = {
                get: function get() {
                    return $refreshTokenName;
                }
            };

            sv.devUser = {
                get: function get() {
                    return $devUser;
                }
            };

            sv.unauthorizedStateName = {
                get: function get() {
                    return $unauthorizedStateName;
                }
            };

            sv.permissionsTokenName = {
                get: function get() {
                    return $permissionsTokenName;
                }
            };

            sv.permissionsUrl = {
                get: function get() {
                    return $permissionsUrl;
                }
            };

            sv.expiredSessionKeyName = {
                get: function get() {
                    return $expiredSessionKeyName;
                }
            };

            sv.systemOwnerEntityName = {
                get: function get() {
                    return $systemOwnerEntityName;
                }
            };

            sv.systemOwnerEntitySwapName = {
                get: function get() {
                    return $systemOwnerEntitySwapName;
                }
            };

            sv.systemOwnerDisplayName = {
                get: function get() {
                    return $systemOwnerDisplayName;
                }
            };

            sv.idSystemOwnerPropertyName = {
                get: function get() {
                    return $idSystemOwnerPropertyName;
                }
            };

            sv.xlsSheetResourceName = {
                get: function get() {
                    return $xlsSheetResourceName;
                }
            };

            sv.pdfResourceName = {
                get: function get() {
                    return $pdfResourceName;
                }
            };

            return sv;
        }];
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').service('EntifixErrorManager', service);

    service.$inject = ['EntifixSession', '$mdDialog', '$mdToast'];

    function service(EntifixSession, $mdDialog, $mdToast) {
        var vm = this;

        // Properties and Fields========================================================================================================================================================
        //==============================================================================================================================================================================


        //==============================================================================================================================================================================


        // Methods _____________________________________________________________________________________________________________________________________________________________________
        //==============================================================================================================================================================================

        // ERROR 401
        vm.unauthorizedError = function (error) {
            EntifixSession.refreshToken();
        };

        // ERROR 404
        vm.notFoundError = function (error) {
            $mdToast.show($mdToast.simple().textContent('¡Error 404! El recurso solicitado no fue encontrado.').position('bottom right').hideDelay(3000));
        };

        // ERROR 500
        vm.internalServerError = function (error) {
            $mdToast.show($mdToast.simple().textContent('¡Error 500! El recurso solicitado presenta un error en el servidor.').position('bottom right').hideDelay(3000));
        };

        //==============================================================================================================================================================================
    };
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').service('EntifixMetadata', service);

    service.$inject = [];

    function service() {
        var vm = this;

        // Properties and Fields========================================================================================================================================================
        //==============================================================================================================================================================================

        vm.metadata = {
            get: function get() {
                return globalMetadata;
            }
        };

        //==============================================================================================================================================================================
        // Methods _____________________________________________________________________________________________________________________________________________________________________
        //==============================================================================================================================================================================

        vm.getDefinedMembers = function (resourceName) {
            var allDefinedMembers = getResource(resourceName).definedMembers || [];

            if (!getResource(resourceName).denyInheritance) {
                var base = getBase(resourceName);

                while (base) {
                    if (base.definedMembers) allDefinedMembers = allDefinedMembers.concat(base.definedMembers);

                    if (base.denyInheritance) base = null;else base = getBase(base.name);
                }
            }

            return allDefinedMembers;
        };

        vm.getExcludedMembers = function (resourceName) {
            var allExcludedMembers = getResource(resourceName).excludeMembers || [];

            var base = getBase(resourceName);

            while (base) {
                if (base.excludeMembers) allExcludedMembers = allExcludedMembers.concat(base.excludeMembers);

                base = getBase(base.name);
            }

            return allExcludedMembers;
        };

        vm.getTransformProperties = function (resourceName) {
            return vm.getDefinedMembers(resourceName).filter(function (p) {
                return p.transformType && p.transformType != "false";
            });
        };

        vm.getPaginableProperties = function (resourceName) {
            return vm.getDefinedMembers(resourceName).filter(function (p) {
                return p.paginable == 'true' || p.paginable == true;
            });
        };

        vm.getJoinProperties = function (resourceName) {
            return vm.getDefinedMembers(resourceName).filter(function (p) {
                return p.joinable;
            });
        };

        vm.getKeyProperty = function (resourceName) {
            var resource = getResource(resourceName);
            var keyProperty = resource.keyProperty;
            var base = getBase(resourceName);

            while (base && !keyProperty) {
                if (base.keyProperty) keyProperty = base.keyProperty;

                base = getBase(base.name);
            }

            if (!keyProperty) keyProperty = 'id'; //default value for key property

            return keyProperty;
        };

        vm.getOpProperty = function (resourceName) {
            var resource = getResource(resourceName);
            var opProperty = resource.opProperty;
            var base = getBase(resourceName);

            while (base && !opProperty) {
                if (base.opProperty) opProperty = base.opProperty;

                base = getBase(base.name);
            }

            if (!opProperty) opProperty = 'op'; //default value for key property

            return opProperty;
        };

        vm.getResourceURL = function (resourceName) {
            var resource = getResource(resourceName);

            var path = resource.url;

            var base = getBase(resourceName);

            while (base) {
                if (base && base.url) path = base.url + '/' + path;

                base = getBase(base.name);
            }

            return path;
        };

        vm.getTypeInfo = function (resourceName) {
            var resource = getResource(resourceName);
            var typeInfo = resource.type;

            if (!typeInfo) {
                var base = getBase(resourceName);
                while (base && !typeInfo) {
                    if (base.type) typeInfo = base.type;

                    base = getBase(base.name);
                }
            }

            return typeInfo;
        };

        vm.allowUrlPrefix = function (resourceName) {
            var resource = getResource(resourceName);
            var allowPrefix = resource.allowUrlPrefix;

            if (!allowPrefix) {
                var base = getBase(resourceName);
                while (base && !allowPrefix) {
                    allowPrefix = base.allowUrlPrefix;
                    base = getBase(base.name);
                }
            }

            return allowPrefix || false;
        };

        vm.allowUrlPostfix = function (resourceName) {
            var resource = getResource(resourceName);
            var allowPostfix = resource.allowUrlPostfix;

            if (!allowPostfix) {
                var base = getBase(resourceName);
                while (base && !allowPostfix) {
                    allowPostfix = base.allowPostfix;
                    base = getBase(base.name);
                }
            }

            return allowPostfix || false;
        };

        vm.denyBarPrefix = function (resourceName) {
            var resource = getResource(resourceName);
            return resource.denyBarPrefix || false;
        };

        vm.getDefaultUrl = function (resourceName) {
            var resource = getResource(resourceName);
            var defaultUrl = resource.defaultUrl;

            if (!defaultUrl) defaultUrl = 'default';

            return defaultUrl;
        };

        vm.getRequestOptions = function (resourceName) {
            var resource = getResource(resourceName);
            if (resource.requestOptions != null || resource.requestOptions != undefined) return resource.requestOptions;else {
                return undefined;
            }
        };

        vm.getStartDateProperty = function (resourceName) {
            var definedMembers = vm.getDefinedMembers(resourceName);
            var startProperty = null;

            if (definedMembers.length > 0) definedMembers.forEach(function (dm) {
                if (dm.startDate) {
                    startProperty = dm.name;return false;
                } else return true;
            });

            return startProperty;
        };

        vm.getEndDateProperty = function (resourceName) {
            var definedMembers = vm.getDefinedMembers(resourceName);
            var endProperty = null;

            if (definedMembers.length > 0) definedMembers.every(function (dm) {
                if (dm.endDate) {
                    endProperty = dm.name;return false;
                } else return true;
            });

            return endProperty;
        };

        vm.getNotApplyProperty = function (resourceName) {
            var definedMembers = vm.getDefinedMembers(resourceName);
            var notApplyProperty = null;

            if (definedMembers.length > 0) definedMembers.every(function (dm) {
                if (dm.notApply) {
                    notApplyProperty = dm.name;return false;
                } else return true;
            });

            return notApplyProperty;
        };

        vm.isProcessedEntity = function (resourceName, entity) {
            var definedMembers = vm.getDefinedMembers(resourceName);
            var processedProperty = void 0,
                processedValue = void 0;

            if (definedMembers.length > 0) definedMembers.every(function (dm) {
                if (dm.processedValue) {
                    processedProperty = dm.name;processedValue = dm.processedValue;return false;
                } else return true;
            });

            if (entity[processedProperty] == processedValue) return true;
            return false;
        };

        vm.getBodyDataFile = function (options) {
            return {
                title: options.title,
                columns: getBodyDataFileColumns(options),
                tableStriped: options.tableStriped != undefined ? options.tableStriped : "true",
                pageSize: options.pageSize || "Letter",
                pageOrientation: options.pageOrientation || "Landscape",
                data: getBodyDataFilePdfXls(options)
            };
        };

        //==============================================================================================================================================================================
        // Utilities ===================================================================================================================================================================
        //==============================================================================================================================================================================

        function getBase(resourceName) {
            var resource = globalMetadata.resources.filter(function (r) {
                return r.name == resourceName;
            })[0];

            if (resource.base) return globalMetadata.resources.filter(function (r) {
                return r.name == resource.base;
            })[0];

            return null;
        };

        function getResource(resourceName) {
            return globalMetadata.resources.filter(function (r) {
                return r.name == resourceName;
            })[0];
        };

        function getBodyDataFileColumns(options) {
            var columns = [];

            options.columns.forEach(function (column, index) {
                columns.push({ description: column.display, columnName: "Field_" + (index + 1) });
            });

            return columns;
        }

        function getBodyDataFilePdfXls(options) {
            var data = [];

            options.data.forEach(function (row) {
                var dataRow = {};
                options.columns.forEach(function (column, index) {
                    dataRow["Field_" + (index + 1)] = row[column.name] || "";
                });
                data.push(dataRow);
            });

            return data;
        }

        //==============================================================================================================================================================================
    };
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').service('EntifixNotification', service);

    service.$inject = [];

    function service() {
        var vm = this;

        vm.success = function (options) {
            var body = options.body || 'Acción realizada correctamente';
            var header = options.header || '¡Hecho!';

            if (options.isToast) {
                var toast = swal.mixin({ toast: true, position: options.position || 'bottom-end', timer: options.timer || 3000 });
                toast({ type: 'success', title: header + " " + body });
            } else {
                swal(header, body, 'success');
            }
        };

        vm.error = function (options) {
            var body = options.body || 'Error al realizar la acción solicitada';
            var header = options.header || '¡Error!';

            if (options.isToast) {
                var toast = swal.mixin({ toast: true, position: options.position || 'bottom-end', timer: options.timer || 3000 });
                toast({ type: 'error', title: header + " " + body });
            } else {
                swal(header, body, 'error');
            }
        };

        vm.info = function (options) {
            var body = options.body || '';
            var header = options.header || 'Información';

            if (options.isToast) {
                var toast = swal.mixin({ toast: true, position: options.position || 'bottom-end', timer: options.timer || 3000 });
                toast({ type: 'info', title: header + " " + body });
            } else {
                swal(header, body, 'info');
            }
        };

        vm.warning = function (options) {
            var body = options.body || '';
            var header = options.header || 'Precaución';

            if (options.isToast) {
                var toast = swal.mixin({ toast: true, position: options.position || 'bottom-end', timer: 3000 });
                toast({ type: 'warning', title: header + " " + body });
            } else {
                swal(header, body, 'warning');
            }
        };

        vm.confirm = function (options) {
            var header = options.header || '¿Está seguro de proceder?';

            swal({
                title: header,
                text: options.body,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: options.confirmButtonText || 'Sí',
                cancelButtonText: options.cancelButtonText || 'No'
            }).then(function (response) {
                if (response.value && options.actionConfirm) {
                    options.actionConfirm(response);
                } else if (options.actionCancel) {
                    options.actionCancel(response);
                }
            }).catch(function (error) {
                if (options.actionCancel) {
                    options.actionCancel(error);
                }
            });
        };

        return vm;
    };
})();

(function () {
    'use strict';

    angular.module('entifix-js').factory('EntifixNotifier', factory);

    factory.$inject = ['EntifixNotification'];

    function factory(EntifixNotification) {
        return function (resource, isToast) {
            var vm = this;

            // Properties and fields
            // =========================================================================================================================

            // Fields
            var _savedMessage = 'Registro guardado correctamente';
            var _deletedMessage = 'Registro eliminado correctamente';
            var _errorSaveMessage = 'No se pudo guardar el registro correctamente. Por favor inténtelo de nuevo';
            var _errorDeleteMessage = 'No se pudo eliminar el registro correctamente. Por favor inténtelo de nuevo';
            var _errorValidationMessage = 'No se pudo guardar el registro porque no todos los datos están correctos';

            // Properties
            vm.savedMessage = {
                get: function get() {
                    return _savedMessage;
                },
                set: function set(value) {
                    _savedMessage = value;
                }
            };

            vm.deletedMessage = {
                get: function get() {
                    return _deletedMessage;
                },
                set: function set(value) {
                    _deletedMessage = value;
                }
            };

            vm.errorSaveMessage = {
                get: function get() {
                    return _errorSaveMessage;
                },
                set: function set(value) {
                    _savedMessage = value;
                }
            };

            vm.errorDeleteMessage = {
                get: function get() {
                    return errorDeleteMessage;
                },
                set: function set(value) {
                    errorDeleteMessage = value;
                }
            };

            vm.errorValidationMessage = {
                get: function get() {
                    return _errorValidationMessage;
                },
                set: function set(value) {
                    errorValidationMessage = value;
                }
            };

            // =========================================================================================================================


            // Methods
            // =========================================================================================================================

            var activate = function activate() {
                resource.listenSaved(saved);
                resource.listenDeleted(deleted);
                resource.listenErrorSave(errorSave);
                resource.listenErrorDelete(errorDelete);
                resource.listenNonValidSave(nonValidSave);
            };

            var saved = function saved(args) {
                var message = _savedMessage;
                if (args.message) {
                    message = args.message;
                }

                EntifixNotification.success({ "body": message, "header": undefined, "isToast": isToast });
            };

            var deleted = function deleted(args) {
                var message = _deletedMessage;
                if (args.message) {
                    message = args.message;
                }

                EntifixNotification.success({ "body": message, "header": undefined, "isToast": isToast });
            };

            var errorSave = function errorSave(args) {
                var message = _errorSaveMessage;
                if (args.message) {
                    message = args.message;
                }

                EntifixNotification.error({ "body": message, "header": undefined, "isToast": isToast });
            };

            var errorDelete = function errorDelete(args) {
                var message = _errorDeleteMessage;
                if (args.message) {
                    message = args.message;
                }

                EntifixNotification.error({ "body": message, "header": undefined, "isToast": isToast });
            };

            var nonValidSave = function nonValidSave(args) {
                var message = _errorValidationMessage;
                if (args.message) {
                    message = args.message;
                }

                EntifixNotification.error({ "body": message, "header": undefined, "isToast": isToast });
            };

            // =========================================================================================================================

            // Constructor call
            activate();
        };
    };
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').factory('EntifixPager', factory);

    factory.$inject = ['EntifixCollectionFormatter'];

    function factory(EntifixCollectionFormatter) {
        return function (queryDetails, configuration, formats) {
            var vm = this;

            // Properties and fields
            // =========================================================================================================================

            // Fields

            var _isLoading = false;
            var _actionPreload;
            var _actionPostload;
            var _searchTextGetter;
            var _searchArrayGetter;
            var _columnsSelectedGetter;
            var _sizeGetter;
            var _pageGetter;
            var _inverseOrder;
            var _paginationSetter;
            // Properties

            vm.isLoading = {
                get: function get() {
                    return _isLoading;
                }
            };

            vm.sizeGetter = {
                get: function get() {
                    return _sizeGetter;
                },
                set: function set(value) {
                    _sizeGetter = value;
                }
            };

            vm.pageGetter = {
                get: function get() {
                    return _pageGetter;
                },
                set: function set(value) {
                    _pageGetter = value;
                }
            };

            vm.searchTextGetter = {
                get: function get() {
                    return _searchTextGetter;
                },
                set: function set(value) {
                    _searchTextGetter = value;
                }
            };

            vm.searchArrayGetter = {
                get: function get() {
                    return _searchArrayGetter;
                },
                set: function set(value) {
                    _searchArrayGetter = value;
                }
            };

            vm.columnsSelectedGetter = {
                get: function get() {
                    return _columnsSelectedGetter;
                },
                set: function set(value) {
                    _columnsSelectedGetter = value;
                }
            };

            vm.inverseOrder = {
                get: function get() {
                    return _inverseOrder;
                },
                set: function set(value) {
                    _inverseOrder = value;
                }
            };

            vm.showPageControls = {
                get: function get() {
                    if (configuration && configuration.showPageControls != null) return configuration.showPageControls;

                    if (vm.currentData && vm.currentData.length && vm.currentData.length > 0) return true;
                    return false;
                }
            };

            var inicialSize = {
                get: function get() {
                    if (configuration && configuration.inicialSize) return configuration.inicialSize;
                    return 10;
                }
            };

            var inicialPageSizes = {
                get: function get() {
                    if (configuration && configuration.inicialPageSizes) return configuration.inicialPageSizes;
                    return [10, 25, 50, 100, 200];
                }
            };

            var inicialCurrentPage = {
                get: function get() {
                    if (configuration && configuration.inicialCurrentPage) return configuration.inicialCurrentPage;
                    return 1;
                }

                // =========================================================================================================================


                // Methods
                // =========================================================================================================================

            };function activate() {
                vm.pageSizes = inicialPageSizes.get();
                vm.size = inicialSize.get();
                vm.page = inicialCurrentPage.get();
                vm.formater = new EntifixCollectionFormatter();
            };

            vm.listenBeforeLoad = function (callback) {
                _actionPreload = callback;
            };

            vm.listenAfterLoad = function (callback) {
                _actionPostload = callback;
            };

            vm.reload = function () {
                return requestData();
            };

            function requestData() {
                if (queryDetails.resource) {
                    _isLoading = true;

                    if (_actionPreload) _actionPreload();

                    return queryDetails.resource.getEntityPagination((vm.getPage() - 1) * vm.getSize(), vm.getSize(), vm.getConstantFilters(), queryDetails.resource.getPagFilters(vm.getSearchText(), vm.getSearchArray(), vm.getColumnsSelectedGetter()), queryDetails.sort).then(function (data) {
                        if (data) {
                            var total = data.total;
                            var page = vm.getPage();
                            var size = vm.getSize();
                            for (var i = 1; i <= vm.getSize(); i++) {
                                if (_inverseOrder) {
                                    var res = total - (page - 1) * size;
                                    var ord = total - (page - 1) * size - res - i;
                                    if (ord > 0) data.resultSet[i].order = ord;
                                } else {
                                    var ord = (page - 1) * size + i;
                                    if (ord <= total) {
                                        if (data.resultSet[i - 1]) data.resultSet[i - 1].order = ord;else console.info("Error en la paginación de registros. No concuerdan el total en el encabezado y la cantidad registros en el detalle");
                                    }
                                }
                            }

                            // Set pagination
                            vm.formater.transformMultiple({ collection: data.resultSet, properties: formats }).then(function () {
                                vm.currentData = data.resultSet;
                            });
                            vm.currentData = data.resultSet;
                            vm.totalData = data.total;

                            if (_actionPostload) _actionPostload();
                        }
                        _isLoading = false;
                    }, function (error) {
                        _isLoading = false;return error;
                    });
                } else {
                    console.error('No se ha construido correctamente el paginador');
                }
            };

            vm.getSize = function () {
                if (_sizeGetter) return _sizeGetter();

                if (vm.size) return vm.size;

                return 10;
            };

            vm.getPage = function () {
                if (_pageGetter) return _pageGetter();

                if (vm.page) return vm.page;

                return 1;
            };

            vm.getConstantFilters = function () {
                var constantFilters = null;
                if (queryDetails && queryDetails.constantFilters) {
                    if (queryDetails.constantFilters.getter) constantFilters = queryDetails.constantFilters.getter();else constantFilters = queryDetails.constantFilters;
                }

                return constantFilters;
            };

            vm.getSearchText = function () {
                if (_searchTextGetter) return _searchTextGetter();

                if (vm.searchText) return vm.searchText;

                return null;
            };

            vm.getSearchArray = function () {
                if (_searchArrayGetter) return _searchArrayGetter();

                if (vm.searchArray) return vm.searchArray;

                return null;
            };

            vm.getColumnsSelectedGetter = function () {
                if (_columnsSelectedGetter) return _columnsSelectedGetter();

                if (vm.columnsSelected) return vm.columnsSelected;

                return null;
            };

            vm.getDescriptionText = function () {
                if (vm.currentData && vm.currentData.length > 0) {
                    var start = (vm.getPage() - 1) * vm.getSize() + 1;
                    var end = start + vm.currentData.length - 1;

                    return 'Mostrando del ' + start + ' al ' + end + ' de ' + vm.totalData + ' registros';
                }

                return 'No hay registros que mostrar';
            };

            vm.sortTableColumns = {
                set: function set(filters) {
                    if (filters) queryDetails.sort = filters;
                }

                // =========================================================================================================================

                // Constructor call
            };activate();
        };
    };
})();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
    'use strict';

    angular.module('entifix-js').factory('EntifixResource', resource);

    resource.$inject = ['$http', 'EntifixMetadata', 'EntifixErrorManager', 'EntifixDateGenerator'];

    function resource($http, EntifixMetadata, EntifixErrorManager, EntifixDateGenerator) {
        var resource = function resource(resourceName) {
            var vm = this;

            // REQUESTS _____________________________________________________________________________________________________________________________________________________________________
            //==============================================================================================================================================================================

            var GET = function GET(actionSuccess, actionError, stringQueryParams, suffixUrl, returnPromise) {
                //Base URL for the resource
                var tempUrl = getBaseUrl();

                if (suffixUrl) tempUrl = tempUrl + "/" + suffixUrl;

                if (stringQueryParams) tempUrl = tempUrl + stringQueryParams;

                actionError = actionError || _defaultActionError;

                var requestConfig = { method: "GET", url: tempUrl };

                if (returnPromise) return $http(requestConfig).then(function (result) {
                    // Add only for GET trigger scenario
                    runTriggers(_eventType.loaded, result);
                    return result;
                });else $http(requestConfig).then(actionSuccess, actionError);
            };

            var POST = function POST(data, actionSuccess, actionError) {
                //Base URL for the resource
                var tempUrl = getBaseUrl();

                actionError = actionError || _defaultActionError;
                data = transformDataToRequest(data);

                var options = { method: "POST", url: tempUrl, data: data };
                var extraOptions = getRequestOptions();

                if (extraOptions) {
                    options.headers = extraOptions.headers;
                }
                $http(options).then(actionSuccess, actionError);
            };

            var PUT = function PUT(data, actionSuccess, actionError) {
                //Base URL for the resource
                var tempUrl = getBaseUrl();

                actionError = actionError || _defaultActionError;
                data = transformDataToRequest(data);

                var options = { method: "PUT", url: tempUrl, data: data };
                var extraOptions = getRequestOptions();

                if (extraOptions) {
                    options.headers = extraOptions.headers;
                }
                $http(options).then(actionSuccess, actionError);
            };

            var DELETE = function DELETE(id, actionSuccess, actionError) {
                //Base URL for the resource
                var tempUrl = getBaseUrl();

                var tempUrl = tempUrl + "/" + id;
                actionError = actionError || _defaultActionError;

                var options = { method: "DELETE", url: tempUrl };
                $http(options).then(actionSuccess, actionError);
            };

            var PATCH = function PATCH(data, actionSuccess, actionError) {
                //Base URL for the resource
                var tempUrl = getBaseUrl();

                actionError = actionError || _defaultActionError;
                data = transformDataToRequest(data);

                var options = { method: "PATCH", url: tempUrl, data: data };
                var extraOptions = getRequestOptions();

                if (extraOptions) {
                    options.headers = extraOptions.headers;
                }
                $http(options).then(actionSuccess, actionError);
            };

            //Format functions ===>>>>:

            function getBaseUrl() {
                var tempUrl = _resourceUrl;

                var postfix = vm.urlPostfix.get();

                if (postfix) {
                    if (!_denyBarPrefix) tempUrl += "/";
                    tempUrl += postfix;
                }

                return tempUrl;
            };

            function transformDataToRequest(data) {
                // Set type as a property
                var typeInfo = EntifixMetadata.getTypeInfo(resourceName);
                if (typeInfo && data[typeInfo.property] && data[_keyProperty]) data[typeInfo.property] = _defineProperty({}, typeInfo.property, typeInfo.value);

                // Transform properties
                var transformProperties = EntifixMetadata.getTransformProperties(resourceName);
                if (transformProperties.length > 0) {
                    for (var i = 0; i < transformProperties.length; i++) {
                        var TProperty = transformProperties[i];

                        if (data[TProperty.name]) {
                            // For entity properties
                            if (TProperty.type == "entity") {
                                var value = data[TProperty.name];

                                if (!isNaN(value)) {
                                    var keyValue = value;
                                    var keyNavigationProperty = TProperty.keyNavigationProperty || EntifixMetadata.getKeyProperty(TProperty.resource);
                                    data[TProperty.name] = _defineProperty({}, keyNavigationProperty, keyValue);
                                }
                            }

                            // For date properties
                            if (TProperty.type == "date" || TProperty.type == "datetime") {
                                if (!(data[TProperty.name] instanceof Date)) var dateValue = EntifixDateGenerator.transformStringToDate(data[TProperty.name]);else var dateValue = data[TProperty.name];

                                data[TProperty.name] = EntifixDateGenerator.transformDateToString(dateValue, TProperty.type, false);
                            }

                            // Other types of properties to transform....

                            /*if (TProperty.propertyMetaData.type == ?)
                            {
                              }*/
                        }
                    }
                }

                // Remove non persistent and excluded properties/members
                for (var property in data) {
                    if (property.substr(0, 1) == "$") delete data[property];
                };
                var excludedMembers = EntifixMetadata.getExcludedMembers(resourceName);
                for (var i = 0; i < excludedMembers.length; i++) {
                    delete data[excludedMembers[i]];
                } // Set type as an object
                if (typeInfo && typeInfo.type) {
                    switch (typeInfo.type) {
                        case "FormData":
                            var formData = new FormData();
                            for (var member in data) {
                                formData.append(member, data[member]);
                            }data = formData;
                            break;
                    }
                }

                return data;
            };

            function transformDataFromResponse(data) {
                if (data) {
                    //Transform properties
                    var transformProperties = EntifixMetadata.getTransformProperties(resourceName);

                    if (transformProperties.length > 0) {
                        for (var i = 0; i < transformProperties.length; i++) {
                            var TProperty = transformProperties[i];

                            if (data[TProperty.name]) {
                                //For entity properties
                                if (TProperty.type == "entity") {
                                    var objectValue = data[TProperty.name];
                                    var keyNavigationProperty = TProperty.keyNavigationProperty || EntifixMetadata.getKeyProperty(TProperty.resource);
                                    var keyValue = objectValue[keyNavigationProperty];

                                    if (TProperty.propertiesToMembers) for (var j = 0; j < TProperty.propertiesToMembers.length; j++) {
                                        if (TProperty.propertiesToMembers[j] instanceof Object) data[TProperty.propertiesToMembers[j].to || TProperty.propertiesToMembers[j].name] = objectValue[TProperty.propertiesToMembers[j].name];
                                    }data[TProperty.name] = keyValue;
                                }

                                //For date-time properties
                                if (TProperty.type == "date" || TProperty.type == "datetime") {
                                    var objectValue = data[TProperty.name];
                                    if (!(objectValue instanceof Date)) data[TProperty.name] = EntifixDateGenerator.transformStringToDate(objectValue);
                                }

                                //Other types of properties to transform....
                                /*if (TProperty.propertyMetaData.type == ?)
                                {
                                  }*/
                            }
                        }
                    }

                    return data;
                } else return null;
            };

            //==============================================================================================================================================================================


            // Properties and Fields _______________________________________________________________________________________________________________________________________________________            
            //==============================================================================================================================================================================

            //Fields ===>>>>:
            var _isSaving = false;
            var _isLoading = false;
            var _isDeleting = false;
            var _events = null;
            var _onMultipleDeletion = false;
            var _onMultipleStorage = false;
            var _urlPrefix;
            var _urlPostfix;

            var _resourceUrl = EntifixMetadata.getResourceURL(resourceName);
            var _keyProperty = EntifixMetadata.getKeyProperty(resourceName);
            var _opProperty = EntifixMetadata.getOpProperty(resourceName);
            var _allowUrlPrefix = EntifixMetadata.allowUrlPrefix(resourceName);
            var _allowUrlPostfix = EntifixMetadata.allowUrlPostfix(resourceName);
            var _denyBarPrefix = EntifixMetadata.denyBarPrefix(resourceName);

            var _defaultActionError = function _defaultActionError(error) {
                _isDeleting = false;
                _isLoading = false;
                _isSaving = false;
            };

            var _checkActionErrors = function _checkActionErrors(error) {
                switch (error.status) {
                    case 401:
                        EntifixErrorManager.unauthorizedError(error);
                        break;

                    case 404:
                        EntifixErrorManager.notFoundError(error);
                        break;

                    case 412:
                        EntifixErrorManager.preconditionFailedError(error);
                        break;

                    case 500:
                        EntifixErrorManager.internalServerError(error);
                        break;
                }
            };

            var _eventType = { save: 1, delete: 2, load: 3, saved: 4, deleted: 5, loaded: 6, errorSave: 7, errorDelete: 8, errorLoad: 9, nonValidSave: 10 };

            //Properties ===>>>>:
            vm.resourceName = {
                get: function get() {
                    return resourceName;
                }
            };

            vm.isSaving = {
                get: function get() {
                    return _isSaving || _onMultipleStorage;
                }
            };

            vm.isLoading = {
                get: function get() {
                    return _isLoading;
                }
            };

            vm.isDeleting = {
                get: function get() {
                    return _isDeleting || _onMultipleDeletion;
                }
            };

            vm.events = {
                get: function get() {
                    return _events;
                }
            };

            vm.onMultipleDeletion = {
                get: function get() {
                    return _onMultipleDeletion;
                },
                set: function set(value) {
                    _onMultipleDeletion = value;
                }
            };

            vm.onMultipleStorage = {
                get: function get() {
                    return _onMultipleStorage;
                },
                set: function set(value) {
                    _onMultipleStorage = value;
                }
            };

            vm.urlPrefix = {
                get: function get() {
                    if (_allowUrlPrefix && _urlPrefix) {
                        if (_urlPrefix instanceof Object && _urlPrefix.getter) return _urlPrefix.getter();

                        if (_urlPrefix) return _urlPrefix;
                    }

                    return null;
                },
                set: function set(value) {
                    if (_allowUrlPrefix) _urlPrefix = value;
                }
            };

            vm.urlPostfix = {
                get: function get() {
                    if (_allowUrlPostfix && _urlPostfix) {
                        if (_urlPostfix instanceof Object && _urlPostfix.getter) return _urlPostfix.getter();

                        if (_urlPostfix) return _urlPostfix;
                    }

                    return null;
                },
                set: function set(value) {
                    if (_allowUrlPostfix) _urlPostfix = value;
                }
            };

            vm.getCompleteResourceUrl = {
                get: function get() {
                    return getBaseUrl();
                }
            };

            vm.getCompleteFiltersUrl = {
                get: function get(searchText, searchArray, columnsSelected, constantFilters) {
                    if (!constantFilters) constantFilters = [];
                    return manageUriFilter(vm.getPagFilters(searchText, searchArray, columnsSelected).concat(constantFilters));
                }
            };

            vm.getMembersResource = {
                get: function get() {
                    return EntifixMetadata.getDefinedMembers(resourceName).filter(function (member) {
                        return !member.notDisplay;
                    });
                }
            };

            vm.getKeyProperty = {
                get: function get() {
                    return _keyProperty;
                }
            };

            vm.getOpProperty = {
                get: function get() {
                    return _opProperty;
                }
                //==============================================================================================================================================================================


                // Methods _____________________________________________________________________________________________________________________________________________________________________
                //==============================================================================================================================================================================


                //Private ===>>>>:

                //Manage request timing
            };function createArgs(response) {
                return { message: response.data ? response.data.message : response.data, fullResponse: response };
            };

            function onSaveTransactionEnd(callback, isError) {
                return function (response) {
                    var saveSuccess = response.data && !response.data.isLogicError;

                    if (!_onMultipleStorage && callback) callback(response, saveSuccess);

                    _isSaving = false;

                    if (!(response.status >= 200 && response.status < 300)) _checkActionErrors(response);

                    if (isError) runTriggers(_eventType.errorSave, createArgs(response));else if (!_onMultipleStorage) {
                        if (saveSuccess) runTriggers(_eventType.saved, createArgs(response));else runTriggers(_eventType.nonValidSave, createArgs(response));
                    }

                    if (_onMultipleStorage && callback) callback(response);
                };
            };

            function onQueryEnd(callback, isError) {
                return function (response) {
                    isError = isError || response.data && response.data.isLogicError;

                    if (callback) callback(response);

                    _isLoading = false;

                    if (!(response.status >= 200 && response.status < 300)) _checkActionErrors(response);

                    if (isError) runTriggers(_eventType.errorLoad, createArgs(response));else runTriggers(_eventType.loaded, createArgs(response));
                };
            };

            function onDeleteTransactionEnd(callback, isError) {
                return function (response) {
                    isError = isError || response.data && response.data.isLogicError;

                    if (!_onMultipleDeletion && callback) callback(response, isError);

                    _isDeleting = false;

                    if (!(response.status >= 200 && response.status < 300)) _checkActionErrors(response);

                    if (isError) runTriggers(_eventType.errorDelete, createArgs(response));else if (!_onMultipleDeletion) runTriggers(_eventType.deleted, createArgs(response));

                    if (_onMultipleDeletion && callback) callback(response);
                };
            };

            // Base functions for requests
            function _deleteEntity(idEntity, actionSuccess, actionError) {
                if (_isDeleting != true || _onMultipleDeletion) {
                    _isDeleting = true;
                    runTriggers(_eventType.delete);

                    DELETE(idEntity, onDeleteTransactionEnd(actionSuccess, false), onDeleteTransactionEnd(actionError, true));
                }
            };

            function _insertEntity(entity, actionSuccess, actionError) {
                if (_isSaving != true || _onMultipleStorage) {
                    _isSaving = true;
                    runTriggers(_eventType.save);

                    POST(entity, onSaveTransactionEnd(actionSuccess, false), onSaveTransactionEnd(actionError, true));
                }
            };

            function _updateEntity(entity, actionSuccess, actionError) {
                if (_isSaving != true || _onMultipleStorage) {
                    _isSaving = true;
                    runTriggers(_eventType.save);

                    PUT(entity, onSaveTransactionEnd(actionSuccess, false), onSaveTransactionEnd(actionError, true));
                }
            };

            function _replaceEntity(entity, actionSuccess, actionError) {
                if (_isSaving != true || _onMultipleStorage) {
                    _isSaving = true;
                    runTriggers(_eventType.save);

                    PATCH(entity, onSaveTransactionEnd(actionSuccess, false), onSaveTransactionEnd(actionError, true));
                }
            };

            function findEntity(id, ActionSuccess, ActionError) {
                _isLoading = true;

                var preSuccess = function preSuccess(response) {
                    _isLoading = true;

                    if (ActionSuccess) ActionSuccess(transformDataFromResponse(response.data ? response.data.data : response.data));

                    _isLoading = false;
                };

                GET(onQueryEnd(preSuccess), onQueryEnd(ActionError), manageUriFilter(id));
            };

            function convertToQueryParams(filters) {
                if (filters) {
                    if (filters instanceof Array) {
                        if (filters.length > 0) {
                            var querystring = "?";
                            for (var i = 0; i < filters.length; i++) {
                                var property = filters[i].property;
                                var value = filters[i].value;
                                var type = filters[i].type || "optional_filter";
                                var operator = filters[i].operator || "=";
                                var sort = filters[i].sort;

                                if (value != null && (property != null || sort != null)) {
                                    //Function filters
                                    if (typeof value == "function") {
                                        var possibleValue = value();
                                        if (possibleValue) {
                                            if (sort) querystring = querystring + "order_by" + "=" + sort + "|" + possibleValue;else {
                                                if (property == "skip" || property == "take") querystring = querystring + property + "=" + possibleValue;else querystring = querystring + type + "=" + property + "|" + operator + "|" + possibleValue;
                                            }
                                        }
                                    }

                                    //Clasic filters
                                    else {
                                            if (sort) querystring = querystring + "order_by" + "=" + sort + "|" + value;else {
                                                if (property === "skip" || property === "take" || type === "custom") querystring = querystring + property + "=" + value;else querystring = querystring + type + "=" + property + "|" + operator + "|" + value;
                                            }
                                        }

                                    //Other types of filters
                                    /*
                                    if/else (...)
                                    {
                                      }
                                    */
                                }

                                if (i < filters.length - 1) querystring = querystring + "&";
                            }

                            return querystring;
                        } else return null;
                    }
                }

                return null;
            };

            function manageUriFilter(filter) {
                if (filter) {
                    var stringfilter = null;

                    if (!isNaN(filter)) stringfilter = "/" + filter;else if (typeof filter === "string") stringfilter = "/" + filter;else if (filter instanceof Array) stringfilter = convertToQueryParams(filter);

                    return stringfilter;
                }

                return null;
            }

            //Public ===>>>>:

            vm.getEntityById = function (actionSuccess, actionError, id, suffix_pagination) {
                _isLoading = true;

                actionError = actionError || _defaultActionError;

                var tempSuffix = null;
                if (suffix_pagination) if (suffix_pagination instanceof Function) tempSuffix = suffix_pagination();

                var preSuccess = function preSuccess(response) {
                    _isLoading = true;
                    var resultData = response.data ? response.data.data : {};
                    actionSuccess(resultData);
                    _isLoading = false;
                };

                GET(onQueryEnd(preSuccess), onQueryEnd(actionError), manageUriFilter(id), tempSuffix);
            };

            vm.getCollection = function (actionSuccess, actionError, filters, suffix_pagination) {
                _isLoading = true;

                actionError = actionError || _defaultActionError;

                var tempSuffix = null;
                if (suffix_pagination) if (suffix_pagination instanceof Function) tempSuffix = suffix_pagination();

                var preSuccess = function preSuccess(response) {
                    _isLoading = true;
                    var resultData = response.data ? response.data.data : [];
                    actionSuccess(resultData);
                    _isLoading = false;
                };

                GET(onQueryEnd(preSuccess), onQueryEnd(actionError), manageUriFilter(filters), tempSuffix);
            };

            vm.getEnumerationBind = function (DisplayProperty, actionSuccess, actionError, filters) {
                var operateresults = function operateresults(results) {
                    var bindEnum = [];

                    results.forEach(function (element) {
                        bindEnum.push({ Value: element[_keyProperty], Display: element[DisplayProperty], entity: element });
                    });

                    actionSuccess(bindEnum);
                };

                return vm.getCollection(operateresults, actionError, filters);
            };

            vm.getEnumerationBindMultiDisplay = function (parameters) {
                var operateresults = function operateresults(results) {
                    var bindEnum = [];

                    results.forEach(function (element) {
                        if (parameters.displayProperties) {
                            var value = "";
                            parameters.displayProperties.forEach(function (displayProperty) {
                                if (displayProperty.type) value += element[displayProperty.property][displayProperty.display] + " - ";else value += element[displayProperty.property] + " - ";
                            });
                            value = value.substring(0, value.length - 2);
                            bindEnum.push({ Value: element[_keyProperty], Display: value, entity: element });
                        }
                    });

                    parameters.actionSuccess(bindEnum);
                };

                return vm.getCollection(operateresults, parameters.actionError, parameters.filters);
            };

            vm.getDefault = function (actionSuccess, actionError) {
                var defaultURL = EntifixMetadata.getDefaultUrl(resourceName);

                _isLoading = true;

                actionError = actionError || _defaultActionError;

                var preSuccess = function preSuccess(response) {
                    _isLoading = true;
                    var resultData = response.data ? response.data.data : [];
                    actionSuccess(resultData);
                    _isLoading = false;
                };

                GET(onQueryEnd(preSuccess), onQueryEnd(actionError), null, defaultURL);
            };

            vm.saveEntity = function (entity, actionSuccess, actionError) {
                if (entity[_keyProperty]) {
                    if (entity[_opProperty]) _replaceEntity(entity, actionSuccess, actionError);else _updateEntity(entity, actionSuccess, actionError);
                } else _insertEntity(entity, actionSuccess, actionError);
            };

            vm.insertEntity = function (entity, actionSuccess, actionError) {
                _insertEntity(entity, actionSuccess, actionError);
            };

            vm.updateEntity = function (entity, actionSuccess, actionError) {
                _updateEntity(entity, actionSuccess, actionError);
            };

            vm.replaceEntity = function (entity, actionSuccess, actionError) {
                _replaceEntity(entity, actionSuccess, actionError);
            };

            vm.deleteEntity = function (entity, actionSuccess, actionError) {
                var id = entity;

                if (entity instanceof Object) id = entity[_keyProperty];

                _deleteEntity(id, actionSuccess, actionError);
            };

            vm.loadAsResource = function (entity, ActionSuccess, ActionError) {
                var id = entity;

                if (entity instanceof Object) id = entity[_keyProperty];

                findEntity(id, ActionSuccess, ActionError);
            };

            vm.getEntityPagination = function (pageIndex, pageSize, constFilters, pagFilters, sort) {
                _isLoading = true;

                var skip = { property: "skip", value: pageIndex };
                var take = { property: "take", value: pageSize };
                var pagUrl = "";

                var allFilters = [skip, take];

                if (constFilters) {
                    if (constFilters instanceof String) pagUrl = constFilters + "/" + pagUrl;
                    if (constFilters instanceof Function) pagUrl = constFilters() ? constFilters() + "/" + pagUrl : pagUrl;
                    if (constFilters instanceof Array && constFilters.length > 0) allFilters = allFilters.concat(constFilters);
                }

                if (pagFilters && pagFilters.length > 0) allFilters = allFilters.concat(pagFilters);

                if (sort && sort.length > 0) allFilters = allFilters.concat(sort);

                return GET(null, null, manageUriFilter(allFilters), pagUrl, true).then(function (response) {
                    var dataPag = {
                        resultSet: response.data ? response.data.data : response.data,
                        total: parseInt(response.data ? response.data.info.total : response.data)
                    };
                    _isLoading = false;
                    return dataPag;
                }, function (error) {
                    _isLoading = false;
                    _checkActionErrors(error);
                });
            };

            vm.getPagFilters = function (searchText, searchArray, columnsSelected) {
                var resPagFilters = [];
                if (searchText && (!searchArray || searchArray.length <= 0)) {
                    var pagProperties = filterProperties(EntifixMetadata.getPaginableProperties(resourceName), columnsSelected);
                    var joinProperties = filterProperties(EntifixMetadata.getJoinProperties(resourceName), columnsSelected);

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = pagProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var prop = _step.value;

                            if (!prop.type || prop.type === "text" || prop.type === "date" || prop.type === "datetime") {
                                resPagFilters.push({ property: prop.pageProperty || prop.name, value: searchText, operator: "lk" });
                            } else if (prop.type === "boolean" || prop.type === "number") {
                                resPagFilters.push({ property: prop.pageProperty || prop.name, value: searchText, operator: "eq" });
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = joinProperties[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var prop = _step2.value;

                            resPagFilters.push({ property: joinProperties[prop].propertySearch, value: searchText });
                            resPagFilters.push({ property: joinProperties[prop].name, value: "join;" + joinProperties[prop].propertyJoin });
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                } else if (searchArray) {
                    var type = "fixed_filter";
                    searchArray.forEach(function (element) {
                        resPagFilters.push({ property: element.property, value: element.value, type: type, operator: element.operator });
                    });
                }

                return resPagFilters;
            };

            vm.getFile = function (options, callbackSuccess, callbackError) {
                var actionSuccess = callbackSuccess ? callbackSuccess : function (response) {
                    createDownloadFile(response, options);if (options.callbackSuccess) options.callbackSuccess();
                };
                var actionError = callbackError ? callbackError : function (response) {
                    _checkActionErrors(response);if (options.callbackError) options.callbackError();
                };
                var config = void 0;

                switch (options.requestType) {
                    case "simple-page":
                        config = { method: "POST", url: getBaseUrl(), data: EntifixMetadata.getBodyDataFile(options), responseType: "arraybuffer" };
                        break;

                    case "all-pages":
                        config = { method: "GET", url: getBaseUrl() + manageUriFilter(vm.getPagFilters(options.searchText, options.searchArray, options.columnsSelected).concat(options.constantFilters)), responseType: "arraybuffer" };
                        break;

                    case "custom-report":
                        config = { method: "POST", url: getBaseUrl(), data: options.data, responseType: "arraybuffer" };
                        break;

                    default:
                        config = { method: options.method, url: getBaseUrl(), data: options.data, responseType: options.responseType };
                }

                if (options.headers) config.headers = options.headers;

                $http(config).then(actionSuccess, actionError);
            };

            vm.getId = function (entity) {
                if (entity && entity instanceof Object && entity[_keyProperty]) {
                    var valuekey = entity[_keyProperty];
                    if (isNaN(valuekey)) return valuekey;else return parseInt(valuekey);
                }

                return null;
            };

            vm.isNewEntity = function (entity) {
                return vm.getId(entity) == null;
            };

            vm.isProcessedEntity = function (entity) {
                return EntifixMetadata.isProcessedEntity(resourceName, entity);
            };

            vm.getStartDateProperty = function () {
                return EntifixMetadata.getStartDateProperty(resourceName);
            };

            vm.getEndDateProperty = function () {
                return EntifixMetadata.getEndDateProperty(resourceName);
            };

            vm.getNotApplyProperty = function () {
                return EntifixMetadata.getNotApplyProperty(resourceName);
            };

            function getRequestOptions() {
                return EntifixMetadata.getRequestOptions(resourceName);
            }

            function filterProperties(properties, columnsSelected) {
                var filterProp = [];
                columnsSelected.forEach(function (cs) {
                    var filter = properties.filter(function (property) {
                        return property.display === cs;
                    });
                    if (filter.length > 0 && !filter[0].alwaysExclude) {
                        filterProp.push(filter[0]);
                    }
                });

                properties.forEach(function (property) {
                    if (property.alwaysInclude) {
                        var contains = filterProp.includes(property);
                        if (!contains) {
                            filterProp.push(property);
                        }
                    }
                });
                return filterProp;
            }

            function createDownloadFile(response, options) {
                var type = options.contentType || null;
                var blob = new Blob([response.data], { type: type });
                var blobURL = (window.URL || window.webkitURL).createObjectURL(blob);
                var anchor = document.createElement("a");
                anchor.download = options.fileName;
                anchor.href = blobURL;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
            }

            // Events management
            function addNewEvent(eventCallback, eventType) {
                if (_events) {
                    if (_events.filter(function (e) {
                        return e.callback === eventCallback && e.type == eventType;
                    }).length == 0) _events.push({ callback: eventCallback, type: eventType });
                } else _events = [{ callback: eventCallback, type: eventType }];
            };

            function runTriggers(eventType, args) {
                if (_events && _events.length > 0) _events.filter(function (e) {
                    return e.type == eventType;
                }).forEach(function (e) {
                    e.callback(args);
                });
            };

            vm.listenSave = function (callback) {
                addNewEvent(callback, _eventType.save);
            };

            vm.listenSaved = function (callback) {
                addNewEvent(callback, _eventType.saved);
            };

            vm.listenDelete = function (callback) {
                addNewEvent(callback, _eventType.delete);
            };

            vm.listenDeleted = function (callback) {
                addNewEvent(callback, _eventType.deleted);
            };

            vm.listenLoad = function (callback) {
                addNewEvent(callback, _eventType.load);
            };

            vm.listenLoaded = function (callback) {
                addNewEvent(callback, _eventType.loaded);
            };

            vm.listenErrorSave = function (callback) {
                addNewEvent(callback, _eventType.errorSave);
            };

            vm.listenErrorDelete = function (callback) {
                addNewEvent(callback, _eventType.errorDelete);
            };

            vm.listenErrorLoad = function (callback) {
                addNewEvent(callback, _eventType.errorLoad);
            };

            vm.listenNonValidSave = function (callback) {
                addNewEvent(callback, _eventType.nonValidSave);
            };

            vm.clearEvents = function () {
                _events = [];
            };

            //==============================================================================================================================================================================
        };

        return resource;
    };
})();
'use strict';

// ENTIFIX RESOURCE METADATA PROVIDER *************************************************************************
// ============================================================================================================
// ============================================================================================================ 
// ============================================================================================================
(function () {
    'use strict';

    var module = angular.module('entifix-js');

    module.provider("EntifixResourceMetadata", [function () {

        var prov = this;

        var $mainAPI;

        prov.setMainAPI = function (value) {
            $mainAPI = value;
        };

        prov.$get = ['$http', '$mdToast', function ($http, $mdToast) {

            var sv = {};

            //Properties and Fields___________________________________________________________________________________________________________________________
            //================================================================================================================================================

            //Fields

            //Properties

            //================================================================================================================================================

            //Methods_________________________________________________________________________________________________________________________________________
            //================================================================================================================================================
            function actionSuccess(response) {
                mergeMetadata(response.data.data);
            }

            function actionError() {
                $mdToast.show($mdToast.simple().textContent('Error when trying to load metadata...').position('bottom right').hideDelay(3000));
            }

            function mergeMetadata(metadata) {
                globalMetadata.resources.forEach(function (element) {
                    metadata.forEach(function (element_loaded) {
                        if (element.name == element_loaded.resourceName) element.url = element_loaded.apiUrl;
                    });
                });
            }

            // Public section _____________________________________________________________________
            sv.loadMetadata = function () {
                $http({ method: 'GET', url: $mainAPI }).then(actionSuccess, actionError);
            };

            //================================================================================================================================================


            return sv;
        }];
        // ============================================================================================================================================================================================================================
        // ============================================================================================================================================================================================================================
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').factory('EntifixTokenInterceptor', factory);

    factory.$inject = ['$q', '$timeout', 'EntifixSession', 'jwtHelper', 'EntifixConfig'];

    function factory($q, $timeout, EntifixSession, jwtHelper, EntifixConfig) {
        var request = function request(config) {
            if (config && config.url.substr(config.url.length - 5) == '.html' || config.url && (config.url == EntifixConfig.authUrl.get() || config.url == EntifixConfig.refreshUrl.get())) return config;
            return evaluateToken(config);
        };

        function evaluateToken(config) {
            var token = EntifixSession.authToken.get();
            if (token) {
                if (jwtHelper.isTokenExpired(token) && !EntifixSession.isRefreshingToken.get()) {
                    EntifixSession.refreshToken();
                }
                if (!EntifixSession.isRefreshingToken.get()) {
                    return config;
                } else {
                    var deferred = $q.defer();
                    evaluateRequestToSend(deferred, config);
                    return deferred.promise;
                }
            } else {
                return config;
            }
        }

        function evaluateRequestToSend(deferred, config) {
            if (!EntifixSession.isRefreshingToken.get()) {
                setLastAutorizationHeader(config);
                deferred.resolve(config);
            } else {
                $timeout(evaluateRequestToSend, 1000, true, deferred, config);
            }
        }

        function setLastAutorizationHeader(config) {
            config.headers.Authorization = 'Bearer ' + EntifixSession.authToken.get();
        }

        return {
            request: request
        };
    };
})();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
    'use strict';

    componentController.$inject = ['$stateParams', '$state', '$timeout', 'EntifixEntityModal', 'EntifixNotification', '$rootScope'];

    function componentController($stateParams, $state, $timeout, EntifixEntityModal, EntifixNotification, $rootScope) {
        var vm = this;

        vm.$onInit = function () {
            setdefaults();
            activate();
        };

        // Init Methods
        // ==============================================================================================================================================================

        function setdefaults() {
            // Defaults for table =======================================================================================================================================

            vm.componentConstruction.reload = vm.reload;

            if (checkDefaultTableConstruction('search')) {
                if (!vm.tableComponentConstruction.search) vm.tableComponentConstruction.search = {};
            }

            if (checkDefaultTableConstruction('edit')) {
                if (!vm.tableComponentConstruction.edit) vm.tableComponentConstruction.edit = {};

                var personalizeEditTable = vm.tableComponentConstruction.edit.customAction;

                vm.tableComponentConstruction.edit.customAction = function (entity) {
                    if (personalizeEditTable) personalizeEditTable(entity);else {
                        vm.entityQueryDetails.resource.loadAsResource(entity[vm.entityQueryDetails.resource.getKeyProperty.get()], function (entity) {
                            if (vm.isModal.get()) vm.openModal(entity);else vm.changeToSingleView(entity);
                        });
                    }
                };
            }

            if (checkDefaultTableConstruction('add')) {
                if (!vm.tableComponentConstruction.add) vm.tableComponentConstruction.add = {};

                var personalizeAddTable = vm.tableComponentConstruction.add.customAction;

                vm.tableComponentConstruction.add.customAction = function () {
                    if (personalizeAddTable) personalizeAddTable();else {
                        if (vm.isModal.get()) vm.openModal();else vm.changeToSingleView();
                    }
                };
            }

            if (checkDefaultTableConstruction('remove')) {
                if (!vm.tableComponentConstruction.remove) vm.tableComponentConstruction.remove = {};

                var personalizeRemoveTable = vm.tableComponentConstruction.remove.customAction;

                if (personalizeRemoveTable) vm.tableComponentConstruction.remove.customAction = function (entity) {
                    personalizeRemoveTable(entity);
                };
            };

            if (vm.isProcessEntity.get()) {
                if (checkDefaultTableConstruction('process')) {
                    if (!vm.tableComponentConstruction.process) vm.tableComponentConstruction.process = {};

                    var personalizeProcessTable = vm.tableComponentConstruction.process.customAction;

                    if (personalizeProcessTable) vm.tableComponentConstruction.process.customAction = function (entity) {
                        personalizeProcessTable(entity);
                    };
                };
            }

            if (!vm.tableQueryDetails) vm.tableQueryDetails = vm.queryDetails;

            if (!vm.entityQueryDetails) vm.entityQueryDetails = vm.queryDetails;

            if (!vm.isModal.get()) {
                // Defaults for entity form =============================================================================================================================
                if (checkDefaultEntityConstruction('cancel')) {
                    if (!vm.entityComponentConstruction.cancel) vm.entityComponentConstruction.cancel = {};

                    var personalizeCancelEntity = vm.entityComponentConstruction.cancel.customAction;

                    vm.entityComponentConstruction.cancel.customAction = function () {
                        if (personalizeCancelEntity) personalizeCancelEntity();else {
                            if (vm.entityQueryDetails.resource.isNewEntity(vm.entityComponentBindingOut.entity.get())) vm.changeToMainView();else loadEntity();
                        }
                    };
                }

                if (checkDefaultEntityConstruction('ok')) {
                    if (!vm.entityComponentConstruction.ok) vm.entityComponentConstruction.ok = {};

                    var personalizeOkEntity = vm.entityComponentConstruction.ok.customAction;

                    vm.entityComponentConstruction.ok.customAction = function () {
                        if (personalizeOkEntity) personalizeOkEntity();else vm.changeToMainView();
                    };
                }

                if (checkDefaultEntityConstruction('edit')) {
                    if (!vm.entityComponentConstruction.edit) vm.entityComponentConstruction.edit = {};

                    var personalizeEditEntity = vm.entityComponentConstruction.edit.customAction;

                    if (personalizeEditEntity) vm.entityComponentConstruction.edit.customAction = function (entity) {
                        personalizeEditEntity(entity);
                    };
                }

                if (checkDefaultEntityConstruction('save')) {
                    if (!vm.entityComponentConstruction.save) vm.entityComponentConstruction.save = {};

                    vm.entityComponentConstruction.save.autoChange = false;

                    var personalizeSaveEntity = vm.entityComponentConstruction.save.customAction;

                    if (personalizeSaveEntity) vm.entityComponentConstruction.save.customAction = function (entity) {
                        personalizeSaveEntity(entity);
                    };
                }

                if (checkDefaultEntityConstruction('remove')) {
                    if (!vm.entityComponentConstruction.remove) vm.entityComponentConstruction.remove = {};

                    var personalizeRemoveEntity = vm.entityComponentConstruction.remove.customAction;

                    if (personalizeRemoveEntity) vm.entityComponentConstruction.remove.customAction = function (entity) {
                        personalizeRemoveEntity(entity);
                    };
                }

                if (vm.isProcessEntity.get()) {
                    if (!vm.entityComponentConstruction.process) vm.entityComponentConstruction.process = {};

                    var personalizeProcessEntity = vm.entityComponentConstruction.process.customAction;

                    vm.entityComponentConstruction.process.customAction = function (entity, setViewState) {
                        if (personalizeProcessEntity) personalizeProcessEntity(entity, setViewState);else {
                            var ent = {};
                            ent[vm.entityQueryDetails.resource.getKeyProperty.get()] = entity[vm.entityQueryDetails.resource.getKeyProperty.get()];
                            ent[vm.entityQueryDetails.resource.getOpProperty.get()] = 'PROCESAR';
                            saveModal(ent, null, setViewState);
                        }
                    };
                }

                vm.tableComponentConstruction.blockTableOnChangeView = true;
                vm.entityComponentConstruction.canViewHistory = vm.canViewHistory;

                vm.entityQueryDetails.resource.listenSaved(function (args) {
                    if (vm.entityComponentConstruction.save.autoChange == false) vm.changeToSingleView(args.fullResponse.data.data);else vm.changeToMainView();
                });
                vm.entityQueryDetails.resource.listenDeleted(function () {
                    if (vm.entityComponentConstruction.remove.autoChange != false) vm.changeToMainView();
                });
            }
        };

        function checkDefaultTableConstruction(defaultValueName) {
            if (vm.tableComponentConstruction.useDefaults == null || vm.tableComponentConstruction.useDefaults == true) return true;

            if (vm.tableComponentConstruction.defaultValuesAllowed && vm.tableComponentConstruction.defaultValuesAllowed.length > 0) return vm.tableComponentConstruction.defaultValuesAllowed.filter(function (valueName) {
                return valueName == defaultValueName;
            }).length > 0;
        }

        function checkDefaultEntityConstruction(defaultValueName) {
            if (vm.entityComponentConstruction.useDefaults == null || vm.entityComponentConstruction.useDefaults == true) return true;

            if (vm.entityComponentConstruction.defaultValuesAllowed && vm.entityComponentConstruction.defaultValuesAllowed.length > 0) return vm.entityComponentConstruction.defaultValuesAllowed.filter(function (valueName) {
                return valueName == defaultValueName;
            }).length > 0;
        }

        function activate() {
            if (!vm.isModal.get()) {
                if ($stateParams[vm.paramName.get()]) {
                    _state = _states.singleView; // The change of the state compile the component     

                    var initForm = function initForm() {
                        if (vm.entityComponentBindingOut) {
                            if ($stateParams[vm.paramName.get()] != '-1' && $stateParams[vm.paramName.get()] != '0') loadEntity();else createEntity();
                        } else {
                            console.log('Ciclo de inicializacion del formulario');
                            $timeout(initForm, 100);
                        }
                    };

                    initForm();
                } else {
                    _state = _states.mainView;
                }
            }
        };

        function loadEntity() {
            vm.entityQueryDetails.resource.loadAsResource($stateParams[vm.paramName.get()], function (entity) {
                vm.entityComponentBindingOut.entity.set(entity);
            });
            vm.entityComponentBindingOut.showEditableFields.set(false);
        };

        function createEntity() {
            vm.entityComponentBindingOut.entity.set({});
            vm.entityComponentBindingOut.showEditableFields.set(true);
        };

        // ==============================================================================================================================================================


        // Properties & fields
        // ==============================================================================================================================================================

        // Fields
        var _states = { mainView: 1, singleView: 2 };
        var _state = _states.mainView;

        // Properties
        vm.onMainView = {
            get: function get() {
                return _state == _states.mainView;
            }
        };

        vm.onSingleView = {
            get: function get() {
                return _state == _states.singleView;
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter(_state);
                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                return 'Catálogo';
            }
        };

        vm.icon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.icon) {
                    if (vm.componentConstruction.icon.getter) return vm.componentConstruction.icon.getter(_state);
                    return vm.componentConstruction.icon;
                }

                return '';
            }
        };

        vm.paramName = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.paramName) return vm.componentConstruction.paramName;

                //Default value
                return 'id';
            }
        };

        vm.useMainTab = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.useMainTab != null) return vm.componentConstruction.useMainTab;

                return true;
            }
        };

        vm.showBar = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.showBar) {
                    if (vm.componentConstruction.showBar.getter) return vm.componentConstruction.showBar.getter(_state);
                    return vm.componentConstruction.showBar;
                }

                return true;
            }
        };

        vm.isModal = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isModal != null) return vm.componentConstruction.isModal;

                return false;
            }
        };

        vm.closeWhenSaving = {
            get: function get() {
                if (vm.entityComponentConstruction && vm.entityComponentConstruction.closeWhenSaving != null) return vm.entityComponentConstruction.closeWhenSaving;

                return true;
            }
        };

        vm.isProcessEntity = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isProcessEntity != null) return vm.componentConstruction.isProcessEntity;

                return false;
            }
        };

        vm.noFilterTooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.noFilterTooltip != null) return vm.componentConstruction.noFilterTooltip;

                return 'Quitar todos los filtros';
            }
        };

        vm.showNoFilter = {
            get: function get(skip) {
                if (vm.componentConstruction && vm.componentConstruction.showNoFilter != null) return vm.componentConstruction.showNoFilter;else {
                    if (!skip) {
                        if ($stateParams[vm.paramName.get()]) return false;

                        return true;
                    } else return true;
                }
            }
        };

        var _canViewHistory = true;
        vm.canViewHistory = {
            get: function get() {
                if (_canViewHistory) {
                    if ($stateParams[vm.paramName.get()]) return true;
                    return false;
                }
                return false;
            },

            set: function set(value) {
                _canViewHistory = value;
            }
        };

        vm.historyTooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.historyTooltip) return vm.componentConstruction.historyTooltip;

                //Default value
                return 'Mostrar Bitácora';
            }
        };

        vm.history = {
            get: function get() {
                return $rootScope.showHistory;
            },
            set: function set() {
                $rootScope.showHistory = !$rootScope.showHistory;
            }
        };

        vm.reload = {
            invoke: function invoke() {
                setdefaults();
            }

            // ==============================================================================================================================================================


            // Methods
            // ==============================================================================================================================================================

        };vm.changeToMainView = function () {
            $state.go($state.current.name, _defineProperty({}, vm.paramName.get(), null));
        };

        vm.changeToSingleView = function (entity) {
            var navid = -1;

            if (entity) navid = vm.entityQueryDetails.resource.getId(entity);

            if (vm.onSingleView.get() || vm.tableComponentBindingOut.allowedActions.canEdit.get() || vm.tableComponentBindingOut.allowedActions.canAdd.get() && navid == -1) $state.go($state.current.name, _defineProperty({}, vm.paramName.get(), navid));
        };

        vm.openModal = function (entity, event) {
            // Defaults for modal =======================================================================================================================================
            // Component Construction Configuration
            if (!vm.entityComponentConstruction) vm.entityComponentConstruction = {};

            if (checkDefaultEntityConstruction('cancel')) if (!vm.entityComponentConstruction.cancel) vm.entityComponentConstruction.cancel = {};

            if (checkDefaultEntityConstruction('edit')) if (!vm.entityComponentConstruction.edit) vm.entityComponentConstruction.edit = {};

            if (checkDefaultEntityConstruction('ok')) if (!vm.entityComponentConstruction.ok) vm.entityComponentConstruction.ok = {};

            if (checkDefaultEntityConstruction('save')) {
                if (!vm.entityComponentConstruction.save) vm.entityComponentConstruction.save = {};

                if (!vm.entityComponentConstruction.save.customAction) {
                    vm.entityComponentConstruction.save.customAction = function (entity, defaultOk, setViewState) {
                        saveModal(entity, defaultOk, setViewState);
                    };
                }
            }

            if (checkDefaultEntityConstruction('remove')) {
                if (!vm.entityComponentConstruction.remove) vm.entityComponentConstruction.remove = {};

                if (!vm.entityComponentConstruction.remove.customAction) {
                    vm.entityComponentConstruction.remove.customAction = function (entity, defaultOk, setViewState) {
                        EntifixNotification.confirm({
                            "body": "Está seguro de eliminar el registro",
                            "header": "Confirmación requerida",
                            "actionConfirm": function actionConfirm() {
                                vm.entityQueryDetails.resource.deleteEntity(entity, function () {
                                    defaultOk();$timeout(vm.tableComponentBindingOut.pager.reload(), 500);
                                });
                            },
                            "actionCancel": function actionCancel() {} });
                    };
                }
            }

            vm.entityComponentConstruction.event = event;

            if (vm.isProcessEntity.get()) {
                if (!vm.entityComponentConstruction.process) vm.entityComponentConstruction.process = {};

                if (!vm.entityComponentConstruction.process.customAction) {
                    vm.entityComponentConstruction.process.customAction = function (entity, defaultOk, setViewState) {
                        entity[vm.entityQueryDetails.resource.getOpProperty.get()] = 'PROCESAR';
                        saveModal(entity, defaultOk, setViewState);
                    };
                }
            }

            // Query Details Configuration
            if (!vm.entityQueryDetails) vm.entityQueryDetails = vm.queryDetails;

            // Component Binding Out Configuration
            if (!vm.entityComponentBindingOut) vm.entityComponentBindingOut = {};
            vm.entityComponentBindingOut.object = entity;

            // Component Behavior Configuration
            if (!vm.entityComponentBehavior) vm.entityComponentBehavior = {};

            // Creating new instance of EntifixEntityModal factory
            vm.modal = new EntifixEntityModal(vm.entityComponentConstruction, vm.entityComponentBehavior, vm.entityComponentBindingOut, vm.entityQueryDetails);

            // Call openModal method for call the modal behavior in its controller
            vm.modal.openModal();
        };

        function saveModal(entity, defaultOk, setViewState) {
            vm.entityQueryDetails.resource.saveEntity(entity, function (response, saveSuccess) {
                if (saveSuccess) {
                    if (defaultOk && vm.closeWhenSaving.get()) defaultOk();else if (response && response.data.data) setViewState(true, response.data.data);
                    if (vm.tableComponentBindingOut && vm.tableComponentBindingOut.pager) $timeout(vm.tableComponentBindingOut.pager.reload(), 500);
                }
            });
        }

        // ==============================================================================================================================================================
    };

    var component = {
        //templateUrl: 'dist/shared/components/entifixCatalog/entifixCatalog.html',
        template: ' \
                <!-- Main Tab Mode --> \
                    <div layout="row" ng-if="bindCtrl.useMainTab.get()"> \
                        <div flex="5" hide-xs show-gt-xs></div> \
                        <div flex-xs="100" flex-gt-xs="90"> \
                            <div ng-if="!bindCtrl.isModal.get()"> \
                                <md-toolbar ng-if="bindCtrl.showBar.get()" md-colors="{background:\'default-primary-500\'}"> \
                                    <div class="md-toolbar-tools" layout> \
                                        <div flex layout layout-align="start center"> \
                                            <md-button class="md-icon-button"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon></md-button> \
                                            <h2>&nbsp;{{bindCtrl.title.get()}}</h2> \
                                        </div> \
                                        <div layout layout-align="end end" ng-if="bindCtrl.showNoFilter.get()"> \
                                            <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.tableComponentBindingOut.cleanFilters()" aria-label="{{bindCtrl.tableComponentBindingOut.noFilterTooltip()}}"> \
                                                <md-tooltip>{{bindCtrl.noFilterTooltip.get()}}</md-tooltip> \
                                                <md-icon class="material-icons">delete_sweep</md-icon> \
                                            </md-button> \
                                        </div> \
                                        <div layout layout-align="end end" ng-if="bindCtrl.canViewHistory.get()"> \
                                            <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.history.set()"> \
                                                <md-tooltip>{{bindCtrl.historyTooltip.get()}}</md-tooltip> \
                                                <md-icon class="material-icons">history</md-icon> \
                                            </md-button> \
                                        </div> \
                                    </div> \
                                </md-toolbar> \
                                <div layout="column" ng-if="bindCtrl.onMainView.get()"> \
                                    <entifix-table \
                                        query-details="bindCtrl.tableQueryDetails" \
                                        component-construction="bindCtrl.tableComponentConstruction" \
                                        component-behavior="bindCtrl.tableComponentBehavior" \
                                        component-binding-out="bindCtrl.tableComponentBindingOut"> \
                                    </entifix-table> \
                                </div> \
                                <div layout="column" ng-if="bindCtrl.onSingleView.get()"> \
                                    <entifix-entity-form \
                                        query-details="bindCtrl.entityQueryDetails" \
                                        component-construction="bindCtrl.entityComponentConstruction"  \
                                        component-behavior="bindCtrl.entityComponentBehavior" \
                                        component-binding-out="bindCtrl.entityComponentBindingOut"> \
                                    </entifix-entity-form> \
                                </div> \
                            </div> \
                            <div ng-if="bindCtrl.isModal.get()"> \
                                <md-toolbar ng-if="bindCtrl.showBar.get()" md-colors="{background:\'default-primary-500\'}"> \
                                    <div class="md-toolbar-tools"> \
                                        <div flex layout layout-align="start center"> \
                                            <md-button class="md-icon-button"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon></md-button> \
                                            <h2>&nbsp;{{bindCtrl.title.get()}}</h2> \
                                        </div> \
                                        <div layout layout-align="end end" ng-if="bindCtrl.showNoFilter.get()"> \
                                            <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.tableComponentBindingOut.cleanFilters()" aria-label="{{bindCtrl.tableComponentBindingOut.noFilterTooltip()}}"> \
                                                <md-tooltip>{{bindCtrl.noFilterTooltip.get()}}</md-tooltip> \
                                                <md-icon class="material-icons">delete_sweep</md-icon> \
                                            </md-button> \
                                        </div> \
                                    </div> \
                                </md-toolbar> \
                                <div layout="column"> \
                                    <entifix-table \
                                        query-details="bindCtrl.tableQueryDetails" \
                                        component-construction="bindCtrl.tableComponentConstruction" \
                                        component-behavior="bindCtrl.tableComponentBehavior" \
                                        component-binding-out="bindCtrl.tableComponentBindingOut"> \
                                    </entifix-table> \
                                </div> \
                            </div> \
                        </div> \
                        <div flex="5" hide-xs show-gt-xs></div> \
                    </div> \
                    <!-- No Main Tab Mode --> \
                    <div ng-if="!bindCtrl.useMainTab.get()"> \
                        <md-content ng-if="!bindCtrl.isModal.get()"> \
                            <div layout> \
                                <div flex layout layout-align="start center"> \
                                    <span class="md-headline" ng-if="bindCtrl.showBar.get()"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon>{{"  " + bindCtrl.title.get()}}</span> \
                                </div> \
                                <div layout layout-align="end end" ng-if="bindCtrl.showNoFilter.get()"> \
                                    <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.tableComponentBindingOut.cleanFilters()" aria-label="{{bindCtrl.tableComponentBindingOut.noFilterTooltip()}}"> \
                                        <md-tooltip>{{bindCtrl.noFilterTooltip.get()}}</md-tooltip> \
                                        <md-icon class="material-icons">delete_sweep</md-icon> \
                                    </md-button> \
                                </div> \
                            </div> \
                            <md-content layout-padding> \
                                <div layout="column" ng-if="bindCtrl.onMainView.get()"> \
                                    <entifix-table \
                                        query-details="bindCtrl.tableQueryDetails" \
                                        component-construction="bindCtrl.tableComponentConstruction"  \
                                        component-behavior="bindCtrl.tableComponentBehavior" \
                                        component-binding-out="bindCtrl.tableComponentBindingOut"> \
                                    </entifix-table> \
                                </div>  \
                                <div layout="column" ng-if="bindCtrl.onSingleView.get()"> \
                                    <entifix-entity-form \
                                        query-details="bindCtrl.entityQueryDetails" \
                                        component-construction="bindCtrl.entityComponentConstruction" \
                                        component-behavior="bindCtrl.entityComponentBehavior" \
                                        component-binding-out="bindCtrl.entityComponentBindingOut"> \
                                    </entifix-entity-form> \
                                </div> \
                            </md-content> \
                        </md-content> \
                        <md-content ng-if="bindCtrl.isModal.get()"> \
                            <div layout> \
                                <div flex layout layout-align="start center"> \
                                    <span class="md-headline" ng-if="bindCtrl.showBar.get()"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon>&nbsp;{{bindCtrl.title.get()}}</span> \
                                </div> \
                                <div layout layout-align="end end" ng-if="bindCtrl.showNoFilter.get(true)"> \
                                    <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.tableComponentBindingOut.cleanFilters()" aria-label="{{bindCtrl.tableComponentBindingOut.noFilterTooltip()}}"> \
                                        <md-tooltip>{{bindCtrl.noFilterTooltip.get()}}</md-tooltip> \
                                        <md-icon class="material-icons">delete_sweep</md-icon> \
                                    </md-button> \
                                </div> \
                            </div> \
                            <md-content layout-padding> \
                                <div layout="row"> \
                                    <div flex> \
                                        <div layout="column"> \
                                            <entifix-table \
                                                query-details="bindCtrl.tableQueryDetails" \
                                                component-construction="bindCtrl.tableComponentConstruction"  \
                                                component-behavior="bindCtrl.tableComponentBehavior" \
                                                component-binding-out="bindCtrl.tableComponentBindingOut"> \
                                            </entifix-table> \
                                        </div> \
                                    </div> \
                                </div> \
                            </md-content> \
                        </md-content> \
                    </div>',
        controller: componentController,
        controllerAs: 'bindCtrl',
        bindings: {
            componentConstruction: '<',
            queryDetails: '<',
            tableComponentConstruction: '<',
            tableComponentBehavior: '<',
            tableComponentBindingOut: '=',
            tableQueryDetails: '=',
            entityComponentConstruction: '<',
            entityComponentBehavior: '<',
            entityComponentBindingOut: '=',
            entityQueryDetails: '='
        }
    };

    //Register component
    angular.module('entifix-js').component('entifixCatalog', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller($timeout, EntifixStringUtils, $scope) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);
        var _defaultTitle, plannedRecharge;

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.isLoading = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) vm.queryDetails.resource.isLoading.get();

                //Default value
                return false;
            }
        };

        //Label - Editable Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.requiredMatch = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMatch != null) return vm.componentConstruction.requiredMatch;

                //Default value
                return true;
            }
        };

        vm.requiredMatchMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMatchMessage) {
                    if (vm.componentConstruction.requiredMatchMessage.getter) return vm.componentConstruction.requiredMatchMessage.getter();

                    if (vm.componentConstruction.requiredMatchMessage.text) return vm.componentConstruction.requiredMatchMessage.text;
                }

                //Default value
                return 'Seleccione un elemento de la lista';
            }
        };

        vm.minLengthRequest = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minLengthRequest) return vm.componentConstruction.minLengthRequest;

                //Default value
                return 0;
            }
        };

        vm.minLength = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minLength) return vm.componentConstruction.minLength;

                //Default value
                return null;
            }
        };

        vm.minLengthMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minLengthMessage) {
                    if (vm.componentConstruction.minLengthMessage.getter) return vm.componentConstruction.minLengthMessage.getter();

                    if (vm.componentConstruction.minLengthMessage.text) return vm.componentConstruction.minLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado corto';
            }
        };

        vm.maxLength = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxLength) return vm.componentConstruction.maxLength;

                //Default value
                return null;
            }
        };

        vm.maxLengthMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxLengthMessage) {
                    if (vm.componentConstruction.maxLengthMessage.getter) return vm.componentConstruction.maxLengthMessage.getter();

                    if (vm.componentConstruction.maxLengthMessage.text) return vm.componentConstruction.maxLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado largo';
            }
        };

        vm.createNewEntityMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.createNewEntityMessage) {
                    if (vm.componentConstruction.createNewEntityMessage.getter) return vm.componentConstruction.createNewEntityMessage.getter();

                    if (vm.componentConstruction.createNewEntityMessage.text) return vm.componentConstruction.createNewEntityMessage.text;
                }

                //Default value
                return 'Agregar ';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            },

            set: function set(value) {
                if (value) vm.componentConstruction.title = { text: value };
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixautocomplete' + randomNumber;
            }
        };

        vm.mappingMethod = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.mapping) {
                    if (vm.componentConstruction.mapping.method) return vm.componentConstruction.mapping.method;
                    if (vm.componentConstruction.mapping.property) return function (element) {
                        return element[vm.componentConstruction.mapping.property];
                    };
                }
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.placeholder = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.placeholder) {
                    if (vm.componentConstruction.placeholder.getter) return vm.componentConstruction.placeholder.getter();

                    if (vm.componentConstruction.placeholder.text) return vm.componentConstruction.placeholder.text;
                }

                //Default value
                return "";
            }
        };

        vm.disabled = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.disabled) return vm.componentConstruction.disabled;

                //Default value
                return false;
            }
        };

        vm.loadAllItems = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.loadAllItems) return vm.componentConstruction.loadAllItems;

                //Default Value
                return false;
            }
        };

        vm.noCache = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.noCache != null) return vm.componentConstruction.noCache;

                //Default value
                return true;
            }
        };

        vm.notFoundText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.notFoundText) {
                    if (vm.componentConstruction.notFoundText.getter) return vm.componentConstruction.notFoundText.getter();

                    if (vm.componentConstruction.notFoundText.text) return vm.componentConstruction.notFoundText.text;
                }

                //Default value
                return 'No hay coincidencias. ';
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.canCreateNewEntity = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.canCreateNewEntity) return vm.componentConstruction.canCreateNewEntity;

                //Default value
                return false;
            }
        };

        vm.maxItemsQuery = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxItemsQuery) return vm.componentConstruction.maxItemsQuery;

                //Default value
                return 10;
            }
        };

        vm.keyProperty = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.keyProperty) return vm.componentConstruction.keyProperty;

                //Default value
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.getKeyProperty.get();

                return 'id';
            }
        };

        vm.nullValueLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.nullValueLabel) return vm.componentConstruction.nullValueLabel;

                return 'SIN REGISTROS';
            }
        };

        vm.getConstantFilters = function () {
            var constantFilters = [];
            if (vm.queryDetails && vm.queryDetails.constantFilters) {
                if (vm.queryDetails.constantFilters.getter) constantFilters = vm.queryDetails.constantFilters.getter();else constantFilters = vm.queryDetails.constantFilters;
            }

            return constantFilters;
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            if (vm.loadAllItems.get()) loadCollection();
            checkoutputs();
            _defaultTitle = vm.title.get();
            setValues();
        };

        var loadCollection = function loadCollection() {
            vm.queryDetails.resource.getCollection(function (results) {
                vm.items = results;
            });
        };

        var checkoutputs = function checkoutputs() {
            vm.componentBindingOut = {
                selectedEntity: {
                    get: function get() {
                        if (vm.entityList && vm.entityList.length > 0) return vm.entityList.filter(function (D_entity) {
                            return vm.selectedItem == vm.mappingMethod.get()(D_entity);
                        })[0];
                    },
                    set: function set(value) {
                        if (value) getEntity(value);else {
                            vm.showList = [];vm.selectedItem = undefined;vm.entityList = [];
                        }
                    }
                }
            };

            if (vm.componentConstruction.init) vm.componentConstruction.init();

            vm.loadingFirstRequest = false;
        };

        vm.getDisplayValue = function () {
            if (vm.valueModel && vm.selectedItem) return vm.selectedItem;

            if (vm.valueModel && !vm.selectedItem && !vm.loadingFirstRequest) getEntity(vm.valueModel);

            return vm.nullValueLabel.get();
        };

        vm.getValue = function () {
            if (vm.valueModel) return vm.valueModel;

            return undefined;
        };

        var constructFilters = function constructFilters(searchText) {
            //Construct Filters
            var allFilters = [];

            if (vm.queryDetails && vm.componentConstruction.searchProperties && vm.componentConstruction.searchProperties.length > 0) allFilters = allFilters.concat(vm.componentConstruction.searchProperties.map(function (D_searchProperty) {
                return { property: D_searchProperty, value: searchText, operator: 'lk' };
            }));

            if (vm.queryDetails && vm.queryDetails.filters) allFilters = allFilters.concat(vm.queryDetails.filters);

            if (vm.getConstantFilters()) allFilters = allFilters.concat(vm.getConstantFilters());

            return allFilters;
        };

        var setValueModel = function setValueModel(value, entity) {
            if (vm.valueModel != value) vm.valueModel = value;
            if (vm.onChange) vm.onChange({ oldValue: vm.valueModel, newValue: value, entity: entity });
        };

        vm.updateData = function (data) {
            var typedText = data.search;

            vm.queryDetails.resource.getCollection(function (results) {
                if (results.length > 0) {
                    vm.entityList = results;
                    vm.showList = results.map(vm.mappingMethod.get());
                    vm.title.set(_defaultTitle);
                } else {
                    vm.showList = [];
                    if (vm.canCreateNewEntity.get()) {
                        vm.showList = [typedText];
                        vm.title.set(_defaultTitle + ': ' + vm.createNewEntityMessage.get() + typedText);
                    }
                }
                data.resolve(vm.showList);
            }, function (error) {
                if (data.reject) data.reject();
            }, constructFilters(typedText));
        };

        var getInitialData = function getInitialData(data) {
            var maxItems = vm.maxItemsQuery.get();
            vm.queryDetails.resource.getCollection(function (results) {
                vm.entityList = results;
                vm.showList = results.map(vm.mappingMethod.get());
                data.resolve(vm.showList);
                vm.title.set(_defaultTitle);
            }, function (error) {
                if (data.reject) data.reject();
            }, vm.getConstantFilters().concat([{ property: 'skip', value: 0, type: 'fixed_filter' }, { property: 'take', value: maxItems, type: 'fixed_filter' }])
            //,{ skip: 0, take: maxItems }
            );
        };

        var getEntity = function getEntity(id) {
            vm.loadingFirstRequest = true;
            vm.queryDetails.resource.getCollection(function (results) {
                if (results.length > 0) {
                    vm.entityList = results;
                    vm.showList = results.map(vm.mappingMethod.get());
                    vm.selectedItem = vm.showList[0];
                    vm.loadingFirstRequest = true;
                }
            }, function (error) {}, [{ property: vm.keyProperty.get(), value: id, type: 'fixed_filter' }]);
        };

        // Autosearch control
        var planedUpdate;

        function cleanPlannedUpdate() {
            if (planedUpdate) {
                $timeout.cancel(planedUpdate);
                planedUpdate = null;
            }
        }

        function createPlannedUpdate(resolve, reject, searchText) {
            planedUpdate = $timeout(vm.updateData, 500, true, { search: searchText, resolve: resolve, reject: reject });
        }

        function createPlannedInsert(resolve, reject, searchText) {
            planedUpdate = $timeout(getInitialData, 500, true, { search: searchText, resolve: resolve, reject: reject });
        }

        vm.searchItems = function (searchText) {
            if (searchText && vm.loadAllItems.get()) {
                var items = vm.items.filter(function (e) {
                    return e[vm.componentConstruction.searchProperties[0]].indexOf(searchText) >= 0;
                });
                return items;
            } else if (searchText) {
                return new Promise(function (resolve, reject) {
                    setValueModel(undefined);
                    cleanPlannedUpdate();
                    createPlannedUpdate(resolve, reject, searchText);
                });
            }
            return new Promise(function (resolve, reject) {
                setValueModel(undefined);
                cleanPlannedUpdate();
                createPlannedInsert(resolve, reject, searchText);
            });
        };

        vm.changeSelectedItem = function () {
            var entity = vm.entityList.filter(function (D_entity) {
                return vm.selectedItem == vm.mappingMethod.get()(D_entity);
            })[0];
            if (!vm.canCreateNewEntity.get()) {
                if (vm.selectedItem) setValueModel(vm.queryDetails.resource.getId(entity), entity);else setValueModel(undefined);
            } else {
                if (vm.onChange) vm.onChange({ oldValue: undefined, newValue: vm.selectedItem, entity: entity });

                if (entity && vm.selectedItem) setValueModel(vm.queryDetails.resource.getId(entity), entity);
            }
            cleanPlannedRecharge();
            plannedRecharge = $timeout(setValues, 1500);
        };

        vm.onFocus = function ($event) {
            if ($event.target && $event.target.value && $event.target.value.length > 0 && $event.type == 'click') $event.target.select();
        };

        function cleanPlannedRecharge() {
            if (plannedRecharge) {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function setValues() {
            vm.isForm.value = vm.isForm.get();
            vm.tooltip.value = vm.tooltip.get();
            vm.title.value = vm.title.get();
            vm.name.value = vm.name.get();
            vm.isRequired.value = vm.isRequired.get();
            vm.requiredMessage.value = vm.requiredMessage.get();
            vm.requiredMatch.value = vm.requiredMatch.get();
            vm.requiredMatchMessage.value = vm.requiredMatchMessage.get();
            vm.maxLength.value = vm.maxLength.get();
            vm.maxLengthMessage.value = vm.maxLengthMessage.get();
            vm.minLength.value = vm.minLength.get();
            vm.minLengthMessage.value = vm.minLengthMessage.get();
            vm.minLengthRequest.value = vm.minLengthRequest.get();
            vm.createNewEntityMessage.value = vm.createNewEntityMessage.get();
            vm.nullValueLabel.value = vm.nullValueLabel.get();
            vm.placeholder.value = vm.placeholder.get();
            vm.disabled.value = vm.disabled.get();
            vm.noCache.value = vm.noCache.get();
            vm.notFoundText.value = vm.notFoundText.get();
            vm.getDisplayValue();
        }

        $scope.$watch(function () {
            return vm.valueModel;
        }, function (newValue, oldValue) {
            if (newValue != oldValue) {
                setValues();
            }
        });

        //=======================================================================================================================================================================

    };

    componentcontroller.$inject = ['$timeout', 'EntifixStringUtils', '$scope'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            queryDetails: '<',
            componentConstruction: '<',
            componentBindingOut: '=',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixAutocomplete/entifixAutocomplete.html',
        template: '<div ng-class="{\'whirl double-up whirlback\': vm.isLoading.get()}"> \
                        <md-tooltip ng-if="vm.tooltip.value" md-direction="left">{{vm.tooltip.value}}</md-tooltip> \
                        <div ng-if="vm.isForm.value"> \
                            <div ng-if="vm.canShowEditableFields.get()" ng-click="vm.onFocus($event)"> \
                                <md-autocomplete \
                                    md-floating-label={{vm.title.value}} \
                                    md-input-name={{vm.name.value}} \
                                    md-min-length="vm.minLengthRequest.value" \
                                    md-input-minlength="{{vm.minLength.value}}" \
                                    md-input-maxlength="{{vm.maxLength.value}}" \
                                    md-no-cache="vm.noCache.value" \
                                    md-selected-item="vm.selectedItem" \
                                    md-search-text="vm.searchText" \
                                    md-items="item in vm.searchItems(vm.searchText)" \
                                    md-item-text="item" \
                                    md-selected-item-change="vm.changeSelectedItem()" \
                                    ng-required="vm.isRequired.value" \
                                    md-require-match="vm.requiredMatch.value" \
                                    placeholder="{{vm.placeholder.value}}" \
                                    ng-disabled="vm.disabled.value" \
                                    md-clear-button="true"> \
                                    <md-item-template> \
                                        <span md-highlight-text="vm.searchText" md-highlight-flags="^i">{{item}}</span> \
                                    </md-item-template> \
                                    <md-not-found> \
                                        <div> \
                                            {{vm.notFoundText.value}} \
                                        </div> \
                                    </md-not-found> \
                                    <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                        <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                        <div ng-message="md-require-match">{{vm.requiredMatchMessage.value}}</div> \
                                        <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                        <div ng-message="maxlength">{{vm.maxLengthMessage.value}}</div> \
                                    </div> \
                                </md-autocomplete> \
                            </div> \
                            <div ng-if="!vm.canShowEditableFields.get()"> \
                                <label>{{vm.title.value}}</label><br/> \
                                <strong>{{vm.selectedItem}}</strong> \
                            </div> \
                        </div> \
                        <div ng-if="!vm.isForm.value" ng-click="vm.onFocus($event)"> \
                            <md-autocomplete \
                                md-floating-label={{vm.title.value}} \
                                md-input-name={{vm.name.value}} \
                                md-min-length="vm.minLengthRequest.value" \
                                md-input-minlength="{{vm.minLength.value}}" \
                                md-input-maxlength="{{vm.maxLength.value}}" \
                                md-no-cache="vm.noCache.value" \
                                md-selected-item="vm.selectedItem" \
                                md-search-text="vm.searchText" \
                                md-items="item in vm.searchItems(vm.searchText)" \
                                md-item-text="item" \
                                md-selected-item-change="vm.changeSelectedItem()" \
                                ng-required="vm.isRequired.value" \
                                md-require-match="vm.requiredMatch.value" \
                                placeholder="{{vm.placeholder.value}}" \
                                ng-disabled="vm.disabled.value" \
                                md-clear-button="true"> \
                                <md-item-template> \
                                    <span md-highlight-text="vm.searchText" md-highlight-flags="^i">{{item}}</span> \
                                </md-item-template> \
                                <md-not-found> \
                                    {{vm.notFoundText.value}} \
                                </md-not-found> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="md-require-match">{{vm.requiredMatchMessage.value}}</div> \
                                    <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                    <div ng-message="maxlength">{{vm.maxLengthMessage.value}}</div> \
                                </div> \
                            </md-autocomplete> \
                        </div> \
                    </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixAutocomplete', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller(EntifixStringUtils, $scope) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //Label - Input Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        vm.isSwitch = {
            get: function get() {
                if (vm.componentConstruction.isSwitch) return vm.componentConstruction.isSwitch;

                //Default value
                return false;
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixcheckboxswitch' + randomNumber;
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.valueTitle = {
            get: function get() {
                if (vm.title.get() && vm.title.get() != '') {
                    if (vm.includeValue.get()) {
                        var bool = 'No';
                        if (vm.valueModel && vm.title.get() && vm.title.get() != '') bool = 'Si';
                        return vm.title.get() + ': ' + bool;
                    } else return vm.title.get();
                }
                return '';
            }
        };

        vm.includeValue = {
            get: function get() {
                if (vm.componentConstruction.includeValue != null) return vm.componentConstruction.includeValue;

                //Default value
                return true;
            }
        };

        vm.getValue = function () {
            if (vm.valueModel) return 'Si';
            return 'No';
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            if (vm.init) vm.init();
            if (vm.valueModel == undefined) vm.valueModel = false;
        };

        vm.runOnChangeTrigger = function () {
            if (vm.onChange) vm.onChange({ value: vm.valueModel });
        };

        function cleanPlannedRecharge() {
            if (plannedRecharge) {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function setValues() {
            vm.isForm.value = vm.isForm.get();
            vm.tooltip.value = vm.tooltip.get();
            vm.title.value = vm.title.get();
            vm.name.value = vm.name.get();
            vm.isSwitch.value = vm.isSwitch.get();
            vm.requiredMessage.value = vm.requiredMessage.get();
            vm.requiredMatch.value = vm.requiredMatch.get();
        }

        //$scope.$watch(() => { return vm.valueModel; }, (newValue, oldValue) => { vm.display = vm.getDisplayValue(); });

        //=======================================================================================================================================================================
    };

    componentcontroller.$inject = ['EntifixStringUtils', '$scope'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixCheckboxSwitch/entifixCheckboxSwitch.html',
        template: '<div ng-if="!vm.isSwitch.get()"> \
                    <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                    <div ng-if="vm.isForm.get()"> \
                        <div ng-show="vm.canShowEditableFields.get()" class="md-checkbox-padding"> \
                            <md-checkbox  \
                                ng-model="vm.valueModel" \
                                name="{{vm.name.get()}}" \
                                ng-checked="vm.valueModel" \
                                aria-label="{{vm.name.get()}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                class="checkbox-default"> \
                                {{vm.valueTitle.get()}} \
                            </md-checkbox> \
                        </div> \
                        <div ng-hide="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label>&nbsp;<br/> \
                            <strong>{{vm.getValue()}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.get()" class="md-checkbox-padding"> \
                        <md-checkbox  \
                            ng-model="vm.valueModel" \
                            name="{{vm.name.get()}}" \
                            ng-checked="vm.valueModel" \
                            aria-label="{{vm.name.get()}}" \
                            ng-change="vm.runOnChangeTrigger()" \
                            class="checkbox-default"> \
                            {{vm.valueTitle.get()}} \
                        </md-checkbox> \
                    </div> \
                </div> \
                <div ng-if="vm.isSwitch.get()"> \
                    <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                    <div ng-if="vm.isForm.get()"> \
                        <div ng-show="vm.canShowEditableFields.get()"> \
                            <md-switch \
                                ng-model="vm.valueModel" \
                                name="{{vm.name.get()}}" \
                                ng-checked="vm.valueModel" \
                                aria-label="{{vm.name.get()}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                class="switch-default"> \
                                {{vm.valueTitle.get()}} \
                            </md-switch> \
                        </div> \
                        <div ng-hide="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label>&nbsp;<br/> \
                            <strong>{{vm.getValue()}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.get()"> \
                        <md-switch \
                            ng-model="vm.valueModel" \
                            name="{{vm.name.get()}}" \
                            ng-checked="vm.valueModel" \
                            aria-label="{{vm.name.get()}}" \
                            ng-change="vm.runOnChangeTrigger()" \
                            class="switch-default"> \
                            {{vm.valueTitle.get()}} \
                        </md-switch> \
                    </div> \
                </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixCheckboxSwitch', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller($mdConstant) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);
        vm.separatorsDefault = [$mdConstant.KEY_CODE.COMMA, $mdConstant.KEY_CODE.ENTER];

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //Label - Input Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.maxChips = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxChips) return vm.componentConstruction.maxChips;

                //Default value
                return null;
            }
        };

        vm.maxChipsMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxChipsMessage) {
                    if (vm.componentConstruction.maxChipsMessage.getter) return vm.componentConstruction.maxChipsMessage.getter();

                    if (vm.componentConstruction.maxChipsMessage.text) return vm.componentConstruction.maxChipsMessage.text;
                }

                //Default value
                return 'Ha alcanzado el número máximo de elementos';
            }
        };

        vm.name = {
            get: function get() {
                return 'entifixchip' + randomNumber;
            }
        };

        vm.transformChip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.transformChip) return vm.componentConstruction.transformChip;

                //Default value
                return null;
            },

            invoke: function invoke(chip, index) {
                if (vm.componentConstruction && vm.componentConstruction.transformChip) vm.componentConstruction.transformChip(chip, index);
            }
        };

        vm.onAdd = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.onAdd) return vm.componentConstruction.onAdd;

                //Default value
                return null;
            },

            invoke: function invoke(chip, index) {
                if (vm.componentConstruction && vm.componentConstruction.onAdd) vm.componentConstruction.onAdd(chip, index);
            }
        };

        vm.onRemove = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.onRemove) return vm.componentConstruction.onRemove;

                //Default value
                return null;
            },

            invoke: function invoke(chip, index) {
                if (vm.componentConstruction && vm.componentConstruction.onRemove) vm.componentConstruction.onRemove(chip, index);
            }
        };

        vm.onSelect = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.onSelect) return vm.componentConstruction.onSelect;

                //Default value
                return null;
            },

            invoke: function invoke(chip, index) {
                if (vm.componentConstruction && vm.componentConstruction.onSelect) vm.componentConstruction.onSelect(chip, index);
            }
        };

        vm.placeholder = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.placeholder) return vm.componentConstruction.placeholder;

                //Default value
                return '';
            }
        };

        vm.secondaryPlaceholder = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.secondaryPlaceholder) return vm.componentConstruction.secondaryPlaceholder;

                //Default value
                return vm.placeholder.get();
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.removable = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.removable != null) return vm.componentConstruction.removable;

                //Default value
                return true;
            }
        };

        vm.readOnly = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.readOnly) return vm.componentConstruction.readOnly;

                //Default value
                return false;
            }
        };

        vm.enableChipEdit = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.enableChipEdit != null) return vm.componentConstruction.enableChipEdit;

                //Default value
                return 'true';
            }
        };

        vm.addOnBlur = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.addOnBlur != null) return vm.componentConstruction.addOnBlur;

                //Default value
                return true;
            }
        };

        vm.separators = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.separators) return vm.componentConstruction.separators;

                //Default value
                return vm.separatorsDefault;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            if (vm.init) vm.init();
        };

        vm.getStringValue = function () {
            if (Array.isArray(vm.valueModel) && vm.valueModel.length > 0) {
                var value = '';
                vm.valueModel.forEach(function (element) {
                    value += element + ' ';
                });
                return value;
            }
            return '';
        };

        vm.tC = function (chip, index) {
            if (vm.transformChip.get()) vm.transformChip.invoke(chip, index);
        };

        vm.oAdd = function (chip, index) {
            if (vm.onAdd.get()) vm.onAdd.invoke(chip, index);
        };

        vm.oRemove = function (chip, index) {
            if (vm.onRemove.get()) vm.onRemove.invoke(chip, index);
        };

        vm.oSelect = function (chip, index) {
            if (vm.onSelect.get()) vm.onSelect.invoke(chip, index);
        };

        //=======================================================================================================================================================================

    };

    componentcontroller.$inject = ['$mdConstant'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixChip/entifixChip.html',
        template: '<md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                    <div ng-if="vm.isForm.get()"> \
                        <md-chips \
                            ng-if="vm.canShowEditableFields.get()" \
                            name="{{vm.name.get()}}" \
                            ng-model="vm.valueModel" \
                            md-transform-chip="vm.tC($chip, $index)" \
                            placeholder="{{vm.placeholder.get()}}" \
                            secondary-placeholder="{{vm.secondaryPlaceholder.get()}}" \
                            md-removable="vm.removable.get()" \
                            readonly="vm.readOnly.get()" \
                            md-enable-chip-edit="{{vm.enableChipEdit.get()}}" \
                            md-max-chips="{{vm.maxChips.get()}}" \
                            md-add-on-blur="{{vm.addOnBlur.get()}}" \
                            md-on-add="vm.oAdd$chip()" \
                            md-on-remove="vm.oRemove($chip, $index)" \
                            md-on-select="vm.oSelect($chip, $index)" \
                            md-separator-keys="vm.separators.get()"> \
                            <md-chip-template> \
                                {{$chip}} \
                                &nbsp&nbsp \
                                </md-chip-template> \
                        </md-chips> \
                        <div ng-messages="vm.canEvaluateErrors.get()" class="ngMessage-error" multiple> \
                            <div ng-message="md-max-chips">{{vm.maxChipsMessage.get()}}</div> \
                        </div> \
                        <div ng-if="!vm.canShowEditableFields.get()"> \
                            <label>{{vm.placeholder.get()}}</label><br/> \
                            <strong>{{vm.getStringValue()}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.get()"> \
                        <md-chips \
                            name="{{vm.name.get()}}" \
                            ng-model="vm.valueModel" \
                            md-transform-chip="vm.tC($chip, $index)" \
                            placeholder="{{vm.placeholder.get()}}" \
                            secondary-placeholder="{{vm.secondaryPlaceholder.get()}}" \
                            md-removable="vm.removable.get()" \
                            readonly="vm.readOnly.get()" \
                            md-enable-chip-edit="{{vm.enableChipEdit.get()}}" \
                            md-max-chips="{{vm.maxChips.get()}}" \
                            md-add-on-blur="{{vm.addOnBlur.get()}}" \
                            md-on-add="vm.oAdd($chip, $index)" \
                            md-on-remove="vm.oRemove($chip, $index)" \
                            md-on-select="vm.oSelect($chip, $index)" \
                            md-separator-keys="vm.separators.get()"> \
                            <md-chip-template> \
                                {{$chip}} \
                                &nbsp&nbsp \
                                </md-chip-template> \
                        </md-chips> \
                        <div ng-messages="vm.canEvaluateErrors.get()" class="ngMessage-error" multiple> \
                            <div ng-message="md-max-chips">{{vm.maxChipsMessage.get()}}</div> \
                        </div> \
                    </div> \
                    <br/>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixChip', component);
})();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
    'use strict';

    function componentcontroller(mdcDateTimeDialog, $scope, EntifixDateGenerator, EntifixStringUtils, $timeout) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);
        var plannedRecharge;

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.parseMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.parseMessage) {
                    if (vm.componentConstruction.parseMessage.getter) return vm.componentConstruction.parseMessage.getter();

                    if (vm.componentConstruction.parseMessage.text) return vm.componentConstruction.parseMessage.text;
                }

                //Default value
                if (vm.hasDate.get() && vm.hasTime.get()) return 'Este campo debe ser una fecha y hora válidas';else if (vm.hasDate.get() && !vm.hasTime.get()) return 'Este campo debe ser una fecha válida';else if (vm.hasTime.get() && !vm.hasDate.get()) return 'Este campo debe ser una hora válida';
            }
        };

        vm.isDisabled = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isDisabled) return vm.componentConstruction.isDisabled;

                //Default value
                return false;
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixdatetimepicker' + randomNumber;
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.disableParentScroll = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.disableParentScroll != null) return vm.componentConstruction.disableParentScroll;

                //Default value
                return true;
            }
        };

        vm.autoOk = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.autoOk != null) return vm.componentConstruction.autoOk;

                //Default value
                return true;
            }
        };

        vm.editInput = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.editInput) return vm.componentConstruction.editInput;

                //Default value
                return true;
            }
        };

        vm.clickOutsideToClose = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.clickOutsideToClose) return vm.componentConstruction.clickOutsideToClose;

                //Default value
                return false;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.nullValueLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.nullValueLabel) return vm.componentConstruction.nullValueLabel;

                return 'SIN REGISTROS';
            }
        };

        vm.defaultValue = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.defaultValue != null) return vm.componentConstruction.defaultValue;

                //Default value
                return false;
            }
        };

        // Date Picker Configuration -------------------------------------------------------------------------------------------------------------------------------------------------
        vm.hasDate = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.hasDate != null) return vm.componentConstruction.hasDate;

                //Default value
                return true;
            }
        };

        vm.placeholder = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.placeholder) {
                    if (vm.componentConstruction.placeholder.getter) return vm.componentConstruction.placeholder.getter();

                    if (vm.componentConstruction.placeholder.text) return vm.componentConstruction.placeholder.text;
                }

                //Default value
                var placeholder = '';
                if (vm.hasDate.get()) placeholder += 'dd/mm/aaaa';
                if (vm.hasTime.get() && vm.hasDate.get()) placeholder += ' hh:mm';else if (vm.hasTime.get()) placeholder += 'hh:mm';
                return placeholder;
            }
        };

        vm.minDate = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minDate) {
                    if (vm.componentConstruction.minDate.getter) return moment(vm.componentConstruction.minDate.getter(), vm.format.value);

                    if (vm.componentConstruction.minDate.text) return moment(vm.componentConstruction.minDate.text, vm.format.value);
                }

                //Default value
                return undefined;
            }
        };

        vm.maxDate = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxDate) {
                    if (vm.componentConstruction.maxDate.getter) return moment(vm.componentConstruction.maxDate.getter(), vm.format.value);

                    if (vm.componentConstruction.maxDate.text) return moment(vm.componentConstruction.maxDate.text, vm.format.value);
                }

                //Default value
                return undefined;
            }
        };

        vm.format = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.format) {
                    if (vm.componentConstruction.format.getter) return vm.componentConstruction.format.getter();

                    if (vm.componentConstruction.format.text) return vm.componentConstruction.format.text;
                }

                //Default value
                var format = '';
                if (vm.hasDate.get()) format += 'DD-MM-YYYY';
                if (vm.hasTime.get() && vm.hasDate.get()) format += ' HH';else if (vm.hasTime.get()) format += 'HH';
                if (vm.hasTime.get() && vm.shortTime.get()) format += ':mm a';else if (vm.hasTime.get()) format += ':mm';
                return format;
            }
        };

        vm.okText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.okText) {
                    if (vm.componentConstruction.okText.getter) return vm.componentConstruction.okText.getter();

                    if (vm.componentConstruction.okText.text) return vm.componentConstruction.okText.text;
                }

                //Default value
                return 'Aceptar';
            }
        };

        vm.todayText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.todayText) {
                    if (vm.componentConstruction.todayText.getter) return vm.componentConstruction.todayText.getter();

                    if (vm.componentConstruction.todayText.text) return vm.componentConstruction.todayText.text;
                }

                //Default value
                return 'Hoy';
            }
        };

        vm.cancelText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancelText) {
                    if (vm.componentConstruction.cancelText.getter) return vm.componentConstruction.cancelText.getter();

                    if (vm.componentConstruction.cancelText.text) return vm.componentConstruction.cancelText.text;
                }

                //Default value
                return 'Cancelar';
            }
        };

        vm.weekStart = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.weekStart) {
                    if (vm.componentConstruction.weekStart.getter) return vm.componentConstruction.weekStart.getter();

                    if (vm.componentConstruction.weekStart.text) return vm.componentConstruction.weekStart.text;
                }

                //Default value
                return "0";
            }
        };

        vm.weekDays = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.weekDays) return vm.componentConstruction.weekDays;

                //Default value
                return false;
            }
        };

        // Time Picker Configuration -------------------------------------------------------------------------------------------------------------------------------------------------
        vm.hasTime = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.hasTime != null) return vm.componentConstruction.hasTime;

                //Default value
                return true;
            }
        };

        vm.hasMinutes = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.hasMinutes != null) return vm.componentConstruction.hasMinutes;

                //Default value
                return true;
            }
        };

        vm.shortTime = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.shortTime != null) return vm.componentConstruction.shortTime;

                //Default value
                return true;
            }
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            setValues();
            if (!vm.valueModel && vm.defaultValue.get()) vm.valueModel = new Date();
        };

        function updateDateString() {
            if (!(vm.valueModel instanceof Date)) {
                var dateValueModel = transformStringToDate(vm.valueModel);
                vm.valueModel = dateValueModel;
            } else var dateValueModel = vm.valueModel;

            var date = dateValueModel;
            var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            var diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            var hours = "";
            var minutes = "";

            if (vm.hasTime.get()) {
                hours = date.getHours().toString();
                minutes = date.getMinutes().toString();
                if (hours.length < 2) hours = '0' + hours;
                if (minutes.length < 2) minutes = '0' + minutes;

                hours = parseInt(hours);

                if (hours > 12) hours = (hours - 12).toString() + ':' + minutes + ' ' + 'pm';else if (hours == 12) hours = hours.toString() + ':' + minutes + ' ' + 'pm';else hours = hours.toString() + ':' + minutes + ' ' + 'am';
            }
            vm.dateString = date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear() + " " + hours;
        }

        vm.getDateString = function () {
            if (vm.valueModel) {
                updateDateString();
                return vm.dateString;
            } else if (!vm.canShowEditableFields.get()) return vm.nullValueLabel.get();
        };

        vm.displayDialogEdit = function () {
            var _mdcDateTimeDialog$sh;

            mdcDateTimeDialog.show((_mdcDateTimeDialog$sh = {
                date: vm.hasDate.get(),
                time: vm.hasTime.get(),
                minutes: vm.hasMinutes.get(),
                format: vm.format.get(),
                currentDate: vm.valueModel || moment().startOf('day'),
                weekStart: vm.weekStart.get(),
                shortTime: vm.shortTime.get(),
                cancelText: vm.cancelText.get(),
                todayText: vm.todayText.get(),
                okText: vm.okText.get(),
                maxDate: vm.maxDate.get(),
                minDate: vm.minDate.get(),
                amText: 'am',
                pmText: 'pm',
                showTodaysDate: '',
                weekDays: vm.weekDays.get()
            }, _defineProperty(_mdcDateTimeDialog$sh, 'weekStart', vm.weekStart.get()), _defineProperty(_mdcDateTimeDialog$sh, 'disableParentScroll', vm.disableParentScroll.get()), _defineProperty(_mdcDateTimeDialog$sh, 'autoOk', vm.autoOk.get()), _defineProperty(_mdcDateTimeDialog$sh, 'editInput', vm.editInput.get()), _defineProperty(_mdcDateTimeDialog$sh, 'clickOutsideToClose', vm.clickOutsideToClose.get()), _mdcDateTimeDialog$sh)).then(function (date) {
                if (!(date instanceof Date)) vm.valueModel = transformStringToDate(value);else vm.valueModel = date;
            }, function () {});
        };

        vm.runOnChangeTrigger = function () {
            updateDateString();
            if (vm.onChange) vm.onChange({ value: vm.valueModel });

            cleanPlannedRecharge();
            plannedRecharge = $timeout(setValues, 1500);
        };

        function transformStringToDate(value) {
            return EntifixDateGenerator.transformStringToDate(value);
        }

        $scope.$watch(function () {
            return vm.valueModel;
        }, function (newValue, oldValue) {
            if (vm.onChange) vm.onChange({ value: newValue });cleanPlannedRecharge();plannedRecharge = $timeout(setValues, 1500);vm.dateString = vm.getDateString();
        });

        function cleanPlannedRecharge() {
            if (plannedRecharge) {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function setValues() {
            vm.isForm.value = vm.isForm.get();
            vm.tooltip.value = vm.tooltip.get();
            vm.title.value = vm.title.get();
            vm.format.value = vm.format.get();
            vm.name.value = vm.name.get();
            vm.isRequired.value = vm.isRequired.get();
            vm.isDisabled.value = vm.isDisabled.get();
            vm.disableParentScroll.value = vm.disableParentScroll.get();
            vm.autoOk.value = vm.autoOk.get();
            vm.requiredMessage.value = vm.requiredMessage.get();
            vm.editInput.value = vm.editInput.get();
            vm.parseMessage.value = vm.parseMessage.get();
            vm.clickOutsideToClose.value = vm.clickOutsideToClose.get();
            vm.hasDate.value = vm.hasDate.get();
            vm.placeholder.value = vm.placeholder.get();
            vm.minDate.value = vm.minDate.get();
            vm.maxDate.value = vm.maxDate.get();
            vm.okText.value = vm.okText.get();
            vm.todayText.value = vm.todayText.get();
            vm.cancelText.value = vm.cancelText.get();
            vm.weekStart.value = vm.weekStart.get();
            vm.weekDays.value = vm.weekDays.get();
            vm.weekDays.value = vm.weekDays.get();
            vm.nullValueLabel.value = vm.nullValueLabel.get();
            vm.hasTime.value = vm.hasTime.get();
            vm.hasMinutes.value = vm.hasMinutes.get();
            vm.shortTime.value = vm.shortTime.get();
            vm.dateString = vm.getDateString();
        }
        //=======================================================================================================================================================================        
    };

    componentcontroller.$inject = ['mdcDateTimeDialog', '$scope', 'EntifixDateGenerator', 'EntifixStringUtils', '$timeout'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixDateTimePicker/entifixDateTimePicker.html',
        template: '<div ng-if="vm.isForm.value"> \
                    <md-tooltip ng-if="vm.tooltip.value" md-direction="left">{{vm.tooltip.value}}</md-tooltip> \
                    <div ng-if="vm.canShowEditableFields.get()" layout layout-align="center center" class="datetimepicker"> \
                        <md-input-container flex> \
                            <label>{{vm.title.value + ": " + vm.dateString}}</label> \
                            <input mdc-datetime-picker \
                                type="text" \
                                ng-model="vm.valueModel" \
                                id="{{vm.name.value}}" \
                                name="{{vm.name.value}}" \
                                format="{{vm.format.value}}" \
                                short-time="vm.shortTime.value" \
                                min-date="vm.minDate.value" \
                                max-date="vm.maxDate.value" \
                                date="vm.hasDate.value" \
                                time="vm.hasTime.value" \
                                minutes="vm.hasMinutes.value" \
                                cancel-text="{{vm.cancelText.value}}" \
                                today-text="{{vm.todayText.value}}" \
                                ok-text="{{vm.okText.value}}" \
                                week-start="vm.weekStart.value" \
                                weeks-days="vm.weeksDays.value" \
                                show-todays-date \
                                disable-parent-scroll="vm.disableParentScroll.value" \
                                auto-ok="vm.autoOk.value" \
                                edit-input="vm.editInput.value" \
                                click-outside-to-close="vm.clickOutsideToClose.value" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-disabled="vm.isDisabled.value" \
                                ng-required="vm.isRequired.value"/> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="parse">{{vm.parseMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                        <div flex="5"> \
                        <md-button class="md-primary md-icon-button" style="top:-12px;left:-12px;" ng-click="vm.displayDialogEdit()"> \
                            <md-icon class="material-icons">today</md-icon> \
                        </md-button> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.canShowEditableFields.get()"> \
                        <label>{{vm.title.value}}</label><br/> \
                        <strong>{{vm.dateString}}</strong> \
                    </div> \
                </div> \
                <div ng-if="!vm.isForm.value"> \
                    <md-tooltip ng-if="vm.tooltip.value" md-direction="left">{{vm.tooltip.value}}</md-tooltip> \
                    <div layout layout-align="center center" layout- class="datetimepicker"> \
                        <md-input-container flex> \
                            <label>{{vm.title.value + ": " + vm.dateString}}</label> \
                            <input mdc-datetime-picker \
                                type="text" \
                                ng-model="vm.valueModel" \
                                id="{{vm.name.value}}" \
                                name="{{vm.name.value}}" \
                                format="{{vm.format.value}}" \
                                short-time="vm.shortTime.value" \
                                min-date="vm.minDate.value" \
                                max-date="vm.maxDate.value" \
                                date="vm.hasDate.value" \
                                time="vm.hasTime.value" \
                                minutes="vm.hasMinutes.value" \
                                cancel-text="{{vm.cancelText.value}}" \
                                today-text="{{vm.todayText.value}}" \
                                ok-text="{{vm.okText.value}}" \
                                week-start="vm.weekStart.value" \
                                weeks-days="vm.weeksDays.value" \
                                show-todays-date \
                                disable-parent-scroll="vm.disableParentScroll.value" \
                                auto-ok="vm.autoOk.value" \
                                edit-input="vm.editInput.value" \
                                click-outside-to-close="vm.clickOutsideToClose.value" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-disabled="vm.isDisabled.value" \
                                ng-required="vm.isRequired.value"/> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="parse">{{vm.parseMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                        <div flex="5"> \
                        <md-button class="md-primary md-icon-button" style="top:-12px;left:-12px;" ng-click="vm.displayDialogEdit()"> \
                            <md-icon class="material-icons">today</md-icon> \
                        </md-button> \
                        </div> \
                    </div> \
                </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixDateTimePicker', component);
})();
'use strict';

(function () {
    'use strict';

    var module = angular.module('entifix-js');

    componentController.$inject = ['BaseComponentFunctions', 'EntifixNotification', 'EntifixNotifier', '$timeout', '$rootScope', 'EntifixSession'];

    function componentController(BaseComponentFunctions, EntifixNotification, EntifixNotifier, $timeout, $rootScope, EntifixSession) {
        var vm = this;

        // Properties & Fields ===================================================================================================================================================

        //Fields
        var _isloading = false;
        var _notifier = null;

        var _statesForm = {
            edit: true,
            view: false
        };

        vm.connectionComponent = {};
        vm.connectionComponent.state = _statesForm.view;

        // Main

        vm.entity = {
            get: function get() {
                if (vm.connectionComponent) return vm.connectionComponent.entity;
                return null;
            },
            set: function set(value) {
                if (vm.connectionComponent) {
                    var oldValue = vm.connectionComponent.entity;
                    vm.connectionComponent.entity = value;

                    if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onChangeEntity) vm.componentBehavior.events.onChangeEntity(oldValue, value);
                }
            }
        };

        vm.isLoading = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isLoading.get();
                return false;
            }
        };

        vm.isSaving = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isSaving.get();
                return false;
            }
        };

        vm.isDeleting = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isDeleting.get();
                return false;
            }
        };

        vm.onTask = {
            get: function get() {
                var response = vm.isLoading.get() || vm.isSaving.get() || vm.isDeleting.get();

                return response;
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter(vm.entity.get());

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return 'Detalle';
            }
        };

        vm.icon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.icon) return vm.componentConstruction.title.icon;
                }

                //Default value
                return 'menu';
            }
        };

        // cancel button
        vm.canCancel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.cancelIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.componentConstruction.cancel.icon) return vm.componentConstruction.cancel.icon;

                //Default value
                return 'clear';
            }
        };

        vm.cancelText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.componentConstruction.cancel.text) return '' + vm.componentConstruction.cancel.text;

                //Default value
                return 'Cancelar';
            }
        };

        // ok button
        vm.canOk = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.connectionComponent.state == _statesForm.view) return true;

                //Default value
                return false;
            }
        };

        vm.okIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.componentConstruction.ok.icon) return vm.componentConstruction.ok.icon;

                //Default value
                return 'done';
            }
        };

        vm.okText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.componentConstruction.ok.text) return '' + vm.componentConstruction.ok.text;

                //Default value
                return 'Aceptar';
            }
        };

        // edit button
        vm.canEdit = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && vm.connectionComponent.state == _statesForm.view) return true;

                //Default value
                return false;
            }
        };

        vm.editIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.icon) return vm.componentConstruction.edit.icon;

                //Default value
                return 'create';
            }
        };

        vm.editText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit) {
                    if (vm.componentConstruction.edit.text instanceof Object && vm.componentConstruction.edit.text.getter) return vm.componentConstruction.edit.text.getter();else if (vm.componentConstruction.edit.text instanceof String) return vm.componentConstruction.edit.text;
                };

                //Default value
                return 'Editar';
            }
        };

        // save button
        vm.canSave = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.saveIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.componentConstruction.save.icon) return '' + vm.componentConstruction.save.icon;

                //Default value
                return 'save';
            }
        };

        vm.saveText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.componentConstruction.save.text) return '' + vm.componentConstruction.save.text;

                //Default value
                return 'Guardar';
            }
        };

        // remove button
        vm.canRemove = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.removeIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.icon) return vm.componentConstruction.remove.icon;

                //Default value
                return 'delete';
            }
        };

        vm.removeText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.text) return '' + vm.componentConstruction.remove.text;

                //Default value
                return 'Eliminar';
            }
        };

        //process icon
        vm.canProcess = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.connectionComponent.state == _statesForm.view && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && !vm.queryDetails.resource.isProcessedEntity(vm.entity.get())) return true;

                //Default value
                return false;
            }
        };

        vm.processIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.componentConstruction.process.icon) return vm.componentConstruction.process.icon;

                //Default value
                return 'done_all';
            }
        };

        vm.processText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.componentConstruction.process.text) return '' + vm.componentConstruction.process.text;

                //Default value
                return 'Procesar';
            }
        };

        vm.allowActions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.allowActions != null) return vm.componentConstruction.allowActions;

                //Default value
                return true;
            }
        };

        vm.saveTooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.saveTooltip) return vm.componentConstruction.saveTooltip;

                //Default value
                return 'Todos los campos obligatorios deben estar correctos';
            }
        };

        vm.canViewHistory = {
            get: function get() {
                return vm.componentConstruction.canViewHistory.get();
            },

            set: function set(value) {
                vm.componentConstruction.canViewHistory.set(value);
            }
        };

        vm.history = {
            get: function get() {
                return $rootScope.showHistory;
            }
        };

        vm.hasPermissions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.permissions != null) return true;

                //Default value
                return false;
            }
        };

        vm.hasAllPermission = {
            get: function get() {
                if (vm.componentConstruction.permissions.all != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.all)) return true;

                //Default value
                return false;
            }
        };

        vm.hasSavePermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.save || vm.componentConstruction.permissions.save != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.save)) return true;

                //Default value
                return false;
            }
        };

        vm.hasEditPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.edit || vm.componentConstruction.permissions.edit != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.edit)) return true;

                //Default value
                return false;
            }
        };

        vm.hasRemovePermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.remove || vm.componentConstruction.permissions.remove != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.remove)) return true;

                //Default value
                return false;
            }
        };

        vm.hasProcessPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.process || vm.componentConstruction.permissions.process != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.process)) return true;

                //Default value
                return false;
            }

            // =======================================================================================================================================================================

            // Methods ===============================================================================================================================================================

        };vm.$onInit = function () {
            setdefaults();
            createconnectioncomponent();
            activate();
            checkoutputs();
            checkPermissions();
        };

        function setdefaults() {
            _notifier = new EntifixNotifier(vm.queryDetails.resource);
        };

        function createconnectioncomponent() {
            // Connection Component Properties __________________________________________________________________________________________
            // ==========================================================================================================================

            vm.connectionComponent.showEditableFields = {
                get: function get() {
                    if (vm.entity.get()) return vm.connectionComponent.state == _statesForm.edit;else return true;
                },
                set: function set(value) {
                    if (value == true) vm.connectionComponent.state = _statesForm.edit;
                    if (value == false) vm.connectionComponent.state = _statesForm.view;
                }
            };

            vm.connectionComponent.state = vm.connectionComponent.showEditableFields.get();
            vm.connectionComponent.isSaving = vm.isSaving;
            vm.connectionComponent.history = vm.history;
            vm.connectionComponent.canViewHistory = vm.canViewHistory;

            vm.connectionComponent.canCancel = { get: function get() {
                    return vm.canCancel.get();
                } };
            vm.connectionComponent.canRemove = { get: function get() {
                    return vm.canRemove.get();
                } };
            vm.connectionComponent.canSave = { get: function get() {
                    return vm.canSave.get();
                } };
            vm.connectionComponent.canEdit = { get: function get() {
                    return vm.canEdit.get();
                } };
            vm.connectionComponent.canOk = { get: function get() {
                    return vm.canOk.get();
                } };
            vm.connectionComponent.canProcess = { get: function get() {
                    return vm.canProcess.get();
                } };

            vm.connectionComponent.cancelText = { get: function get() {
                    return vm.cancelText.get();
                } };
            vm.connectionComponent.removeText = { get: function get() {
                    return vm.removeText.get();
                } };
            vm.connectionComponent.saveText = { get: function get() {
                    return vm.saveText.get();
                } };
            vm.connectionComponent.editText = { get: function get() {
                    return vm.editText.get();
                } };
            vm.connectionComponent.okText = { get: function get() {
                    return vm.okText.get();
                } };
            vm.connectionComponent.processText = { get: function get() {
                    return vm.processText.get();
                } };

            vm.connectionComponent.cancelIcon = { get: function get() {
                    return vm.cancelIcon.get();
                } };
            vm.connectionComponent.removeIcon = { get: function get() {
                    return vm.removeIcon.get();
                } };
            vm.connectionComponent.saveIcon = { get: function get() {
                    return vm.saveIcon.get();
                } };
            vm.connectionComponent.editIcon = { get: function get() {
                    return vm.editIcon.get();
                } };
            vm.connectionComponent.okIcon = { get: function get() {
                    return vm.okIcon.get();
                } };
            vm.connectionComponent.processIcon = { get: function get() {
                    return vm.processIcon.get();
                } };

            vm.connectionComponent.cancel = { invoke: function invoke() {
                    vm.cancel();
                } };
            vm.connectionComponent.remove = { invoke: function invoke() {
                    vm.remove();
                } };
            vm.connectionComponent.edit = { invoke: function invoke() {
                    vm.edit();
                } };
            vm.connectionComponent.ok = { invoke: function invoke() {
                    vm.ok();
                } };
            vm.connectionComponent.save = { invoke: function invoke() {
                    vm.save();
                } };
            vm.connectionComponent.process = { invoke: function invoke() {
                    vm.process();
                } };

            vm.connectionComponent.onTask = { get: function get() {
                    return vm.onTask.get();
                } };
            vm.connectionComponent.saveTooltip = { get: function get() {
                    return vm.saveTooltip.get();
                } };
            vm.connectionComponent.entityForm = { valid: function valid() {
                    return vm.entityForm.$valid;
                } };
            vm.connectionComponent.queryDetails = vm.queryDetails;

            vm.connectionComponent.evaluateErrors = {
                get: function get(name) {
                    return evaluateErrors(name);
                }
            };

            function evaluateErrors(property) {
                var errors = {};
                for (var error in vm.entityForm.$error) {
                    var propertyValue = vm.entityForm.$error[error];

                    if (propertyValue instanceof Array) {
                        propertyValue.forEach(function (element) {
                            if (element.$name == property) errors[error] = true;
                        });

                        //((element) => { 
                        //    if (element.$name == property)
                        //        errors[error] = true;
                        //})(...propertyValue);
                    }
                }

                return errors;
            }

            // ==========================================================================================================================


            // Connection Component Methods _____________________________________________________________________________________________
            // ==========================================================================================================================

            var searchForm = function searchForm() {
                if (vm.entityForm) vm.connectionComponent.entityForm = vm.entityForm;else $timeout(searchForm, 200);
            };

            searchForm();
        };

        function createDynamicComponent() {
            var res = BaseComponentFunctions.CreateStringHtmlComponentAndBindings(vm.componentConstruction, 'bindCtrl.connectionComponent.objectBindings');
            vm.stringhtmlcomponent = res.stringhtml;
            vm.connectionComponent.objectBindings = res.objectbindings;
        };

        function activate() {
            if (vm.componentConstruction) createDynamicComponent();
        };

        function checkoutputs() {
            vm.componentBindingOut = {
                showEditableFields: vm.connectionComponent.showEditableFields,
                entity: vm.entity,
                recreateDynamicComponent: createDynamicComponent
            };

            if (vm.componentBehavior && vm.componentBehavior.afterConstruction) vm.componentBehavior.afterConstruction();
        };

        vm.ok = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onOk) vm.componentBehavior.events.onOk();

            if (vm.componentConstruction.ok.customAction) vm.componentConstruction.ok.customAction();else defaultOk();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onAfterOk) vm.componentBehavior.events.onAfterOk();
        };

        vm.cancel = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onCancel) vm.componentBehavior.events.onCancel();

            if (vm.componentConstruction.cancel.customAction) vm.componentConstruction.cancel.customAction();else defaultCancel();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onCanceled) vm.componentBehavior.events.onCanceled();
        };

        vm.edit = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdit) vm.componentBehavior.events.onEdit();

            if (vm.componentConstruction.edit.customAction) vm.componentConstruction.edit.customAction();else defaultEdit();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdited) vm.componentBehavior.events.onEdited();
        };

        vm.save = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSave) vm.componentBehavior.events.onSave(vm.entity.get());

            if (vm.componentConstruction.save.customAction) vm.componentConstruction.save.customAction(vm.entity.get(), setViewState);else defaultSave();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSaved) vm.componentBehavior.events.onSaved();
        };

        vm.remove = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemove) vm.componentBehavior.events.onRemove();

            if (vm.componentConstruction.remove.customAction) vm.componentConstruction.remove.customAction(vm.entity.get());else defaultRemove();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemoved) vm.componentBehavior.events.onRemoved();
        };

        vm.process = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcess) vm.componentBehavior.events.onProcess();

            if (vm.componentConstruction.process.customAction) vm.componentConstruction.process.customAction(vm.entity.get(), setViewState);else defaultProcess();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcessed) vm.componentBehavior.events.onProcessed();
        };

        function defaultOk() {};

        function defaultCancel() {
            if (vm.connectionComponent.state == _statesForm.edit) {
                vm.connectionComponent.state = _statesForm.view;
                reloadEntity();
            }
        };

        function defaultEdit() {
            vm.connectionComponent.state = _statesForm.edit;
        };

        function defaultSave() {
            vm.queryDetails.resource.saveEntity(vm.connectionComponent.entity, function (response, saveSuccess) {
                if (saveSuccess) vm.connectionComponent.state = _statesForm.view;
                if (response && response.data.data) vm.entity.set(response.data.data);
            });
        };

        function defaultProcess() {
            vm.connectionComponent.entity[vm.queryDetails.resource.getOpProperty.get()] = 'PROCESAR';
            defaultSave();
        };

        function defaultRemove() {
            EntifixNotification.confirm({
                "body": "Está seguro de eliminar el registro",
                "header": "Confirmación requerida",
                "actionConfirm": function actionConfirm() {
                    vm.queryDetails.resource.deleteEntity(vm.connectionComponent.entity, function () {
                        vm.connectionComponent.state = _statesForm.view;
                    });
                },
                "actionCancel": function actionCancel() {} });
        };

        vm.submit = function () {
            vm.save();
        };

        function reloadEntity() {
            if (vm.entity.get()) vm.queryDetails.resource.loadAsResource(vm.entity.get(), function (entityReloaded) {
                vm.entity.set(entityReloaded);
            });
        };

        function setViewState(view, entity) {
            if (view) vm.connectionComponent.state = _statesForm.view;else vm.connectionComponent.state = _statesForm.edit;

            vm.entity.set(entity);
        }

        function checkPermissions() {
            if (vm.hasPermissions.get()) {
                if (!vm.hasAllPermission.get()) {
                    if (!vm.hasSavePermission.get()) delete vm.componentConstruction.save;
                    if (!vm.hasEditPermission.get()) delete vm.componentConstruction.edit;
                    if (!vm.hasRemovePermission.get()) delete vm.componentConstruction.remove;
                    if (!vm.hasProcessPermission.get()) delete vm.componentConstruction.process;
                }
            }
        }

        // =======================================================================================================================================================================
    };

    var component = {
        //templateUrl: 'dist/shared/components/entifixEntityForm/entifixEntityForm.html',
        template: '<br/> \
                    <md-card md-whiteframe="4" ng-class="{\'whirl double-up whirlback\': bindCtrl.onTask.get() }"> \
                        <md-card-title> \
                            <md-card-title-text> \
                                <span class="md-headline"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon>&nbsp;{{bindCtrl.title.get()}}</span> \
                            </md-card-title-text> \
                        </md-card-title> \
                        <form name="bindCtrl.entityForm" novalidate ng-submit="bindCtrl.entityForm.$valid && bindCtrl.submit()" autocomplete="off"> \
                            <md-card-content> \
                                <div compile="bindCtrl.stringhtmlcomponent" flex="100"></div> \
                            </md-card-content> \
                            <section layout-xs="column" layout="row" layout-align="end center" ng-if="bindCtrl.allowActions.get()"> \
                                <div> \
                                    <md-button ng-if="bindCtrl.canCancel.get()" ng-click="bindCtrl.cancel()" ng-disabled="bindCtrl.onTask.get()"> \
                                        <md-icon class="material-icons">{{bindCtrl.cancelIcon.get()}}</md-icon> &nbsp;{{bindCtrl.cancelText.get()}} \
                                    </md-button> \
                                    <md-button class="md-warn" ng-if="bindCtrl.canRemove.get()" ng-click="bindCtrl.remove()" ng-disabled="bindCtrl.onTask.get()"> \
                                        <md-icon class="material-icons">{{bindCtrl.removeIcon.get()}}</md-icon> &nbsp;{{bindCtrl.removeText.get()}} \
                                    </md-button> \
                                    <md-button type="submit" class="md-primary" ng-if="bindCtrl.canSave.get()" ng-disabled="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid"> \
                                        <md-tooltip ng-if="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid">{{bindCtrl.saveTooltip.get()}}</md-tooltip> \
                                        <md-icon class="material-icons">{{bindCtrl.saveIcon.get()}}</md-icon> &nbsp;{{bindCtrl.saveText.get()}} \
                                    </md-button> \
                                    <md-button class="md-accent" ng-if="bindCtrl.canEdit.get()" ng-click="bindCtrl.edit()" ng-disabled="bindCtrl.onTask.get()"> \
                                        <md-icon class="material-icons">{{bindCtrl.editIcon.get()}}</md-icon> &nbsp;{{bindCtrl.editText.get()}} \
                                    </md-button> \
                                    <md-button ng-if="bindCtrl.canOk.get()" ng-click="bindCtrl.ok()" ng-disabled="bindCtrl.onTask.get()"> \
                                        <md-icon class="material-icons">{{bindCtrl.okIcon.get()}}</md-icon> &nbsp;{{bindCtrl.okText.get()}} \
                                    </md-button> \
                                    <md-button class="md-primary" ng-if="bindCtrl.canProcess.get()" ng-click="bindCtrl.process()" ng-disabled="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid || !bindCtrl.isValidEntity.get()"> \
                                        <md-tooltip ng-if="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid">{{bindCtrl.saveTooltip.get()}}</md-tooltip> \
                                        <md-icon class="material-icons">{{bindCtrl.processIcon.get()}}</md-icon> &nbsp;{{bindCtrl.processText.get()}} \
                                    </md-button> \
                                </div> \
                            </section> \
                        </form> \
                    </md-card>',
        controller: componentController,
        controllerAs: 'bindCtrl',
        bindings: {
            componentConstruction: '<',
            componentBehavior: '<',
            componentBindingOut: '=',
            queryDetails: '='
        }

        //Register component
    };module.component('entifixEntityForm', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller(EntifixStringUtils) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //Label - Input Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixinput' + randomNumber;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.isMultiple = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isMultiple != null) return vm.componentConstruction.isMultiple;

                //Default value
                return false;
            }
        };

        vm.selectFileText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.selectFileText) {
                    if (vm.componentConstruction.selectFileText.getter) return vm.componentConstruction.selectFileText.getter();

                    if (vm.componentConstruction.selectFileText.text) return vm.componentConstruction.selectFileText.text;
                }

                //Default value
                if (vm.isMultiple.get()) return 'Seleccionar Archivos...';
                return 'Seleccionar Archivo';
            }
        };

        vm.deleteFileLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.deleteFileLabel) {
                    if (vm.componentConstruction.deleteFileLabel.getter) return vm.componentConstruction.deleteFileLabel.getter();

                    if (vm.componentConstruction.deleteFileLabel.text) return vm.componentConstruction.deleteFileLabel.text;
                }

                //Default value
                if (vm.isMultiple.get()) return 'Eliminar archivos...';
                return 'Eliminar archivo...';
            }
        };

        vm.fileNameLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.fileNameLabel) {
                    if (vm.componentConstruction.fileNameLabel.getter) return vm.componentConstruction.fileNameLabel.getter();

                    if (vm.componentConstruction.fileNameLabel.text) return vm.componentConstruction.fileNameLabel.text;
                }

                //Default value
                if (vm.isMultiple.get()) return 'Nombre de los archivos: ';
                return 'Nombre del archivo: ';
            }
        };

        vm.showSelectedMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.showSelectedMessage != null) return vm.componentConstruction.showSelectedMessage;

                //Default value
                return true;
            }
        };

        vm.accept = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.accept != null) return vm.componentConstruction.accept;

                //Default value
                return "";
            }
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            if (vm.init) vm.init();
        };

        vm.runOnChangeTrigger = function () {
            if (vm.onChange) vm.onChange({ value: vm.valueModel });
        };

        vm.getDisplay = function () {
            if (vm.valueModel) {
                if (vm.format.get()) return $filter(vm.format.get())(vm.valueModel, vm.currency.get());
                return vm.valueModel;
            } else return vm.nullValueLabel.get();
        };

        vm.cleanFile = function () {
            delete vm.valueModel;
        };

        //=======================================================================================================================================================================
    };

    componentcontroller.$inject = ['EntifixStringUtils'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixFile/entifixFile.html',
        template: '<div ng-show="vm.canShowEditableFields.get()"> \
                    <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                    <div ng-if="!vm.isMultiple.get()"> \
                        <label class="btn-file md-raised md-primary">{{vm.selectFileText.get()}} \
                            <input type="file" \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.get()" \
                                entifix-file-read \
                                ng-change="vm.runOnChangeTrigger()" \
                                accept="{{vm.accept.get()}}" /> \
                        </label> \
                        <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                            <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                        </div> \
                        <md-button class="text-danger btn-delete-file" ng-click="vm.cleanFile()" ng-show="vm.valueModel">{{vm.deleteFileLabel.get()}}</md-button> \
                        <h4 ng-show="vm.valueModel && vm.showSelectedMessage.get()"> \
                            <strong>{{vm.fileNameLabel.get()}}</strong> \
                            {{vm.valueModel.name + " "}} \
                        </h4> \
                    </div> \
                    <div ng-if="vm.isMultiple.get()"> \
                        <label class="btn-file md-raised md-primary">{{vm.selectFileText.get()}} \
                            <input type="file" \
                                ng-model="vm.valueModel" \
                                multiple \
                                ng-required="vm.isRequired.get()" \
                                entifix-file-read \
                                ng-change="vm.runOnChangeTrigger()" \
                                accept="{{vm.accept.get()}}" /> \
                        </label> \
                        <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                            <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                        </div> \
                        <md-button class="text-danger btn-delete-file" ng-click="vm.cleanFile()" ng-show="vm.valueModel">{{vm.deleteFileLabel.get()}}</md-button> \
                        <h4 ng-show="vm.valueModel && vm.showSelectedMessage.get()"> \
                            <strong>{{vm.fileNameLabel.get()}}</strong> \
                            <p ng-repeat="file in vm.valueModel">{{file.name + " "}}</p> \
                        </h4> \
                    </div> \
                    <br hide-gt-sm><br hide-gt-sm> \
                   </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixFile', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller($filter, EntifixStringUtils, $timeout, $scope) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);
        var plannedRecharge;

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //Label - Input Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.maxLength = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxLength) return vm.componentConstruction.maxLength;

                //Default value
                return null;
            }
        };

        vm.maxLengthMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxLengthMessage) {
                    if (vm.componentConstruction.maxLengthMessage.getter) return vm.componentConstruction.maxLengthMessage.getter();

                    if (vm.componentConstruction.maxLengthMessage.text) return vm.componentConstruction.maxLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado largo';
            }
        };

        vm.minLength = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minLength) return vm.componentConstruction.minLength;

                //Default value
                return null;
            }
        };

        vm.minLengthMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minLengthMessage) {
                    if (vm.componentConstruction.minLengthMessage.getter) return vm.componentConstruction.minLengthMessage.getter();

                    if (vm.componentConstruction.minLengthMessage.text) return vm.componentConstruction.minLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado corto';
            }
        };

        vm.max = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.max) return vm.componentConstruction.max;

                //Default value
                return null;
            }
        };

        vm.maxMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.maxMessage) {
                    if (vm.componentConstruction.maxMessage.getter) return vm.componentConstruction.maxMessage.getter();

                    if (vm.componentConstruction.maxMessage.text) return vm.componentConstruction.maxMessage.text;
                }

                //Default value
                return 'El número es demasiado largo';
            }
        };

        vm.min = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.min) return vm.componentConstruction.min;

                //Default value
                return null;
            }
        };

        vm.minMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.minMessage) {
                    if (vm.componentConstruction.minMessage.getter) return vm.componentConstruction.minMessage.getter();

                    if (vm.componentConstruction.minMessage.text) return vm.componentConstruction.minMessage.text;
                }

                //Default value
                return 'El número es demasiado corto';
            }
        };

        vm.emailMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.emailMessage) {
                    if (vm.componentConstruction.emailMessage.getter) return vm.componentConstruction.emailMessage.getter();

                    if (vm.componentConstruction.emailMessage.text) return vm.componentConstruction.emailMessage.text;
                }

                //Default value
                return 'Ingrese una dirección de correo válida';
            }
        };

        vm.urlMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.urlMessage) {
                    if (vm.componentConstruction.urlMessage.getter) return vm.componentConstruction.urlMessage.getter();

                    if (vm.componentConstruction.urlMessage.text) return vm.componentConstruction.urlMessage.text;
                }

                //Default value
                return 'Ingrese una dirección URL válida';
            }
        };

        vm.numberMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.numberMessage) {
                    if (vm.componentConstruction.numberMessage.getter) return vm.componentConstruction.numberMessage.getter();

                    if (vm.componentConstruction.numberMessage.text) return vm.componentConstruction.numberMessage.text;
                }

                //Default value
                return 'Ingrese un número válido';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixinput' + randomNumber;
            }
        };

        vm.isTextArea = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isTextArea) return true;

                //Default value
                return false;
            }
        };

        vm.type = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.type) return vm.componentConstruction.type;

                //Default value
                return 'text';
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.rows = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.rows) return vm.componentConstruction.rows;

                //Default value
                return 1;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.modelOptions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.modelOptions) return vm.componentConstruction.modelOptions;

                return {};
            }
        };

        vm.numberValidation = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.numberValidation) return vm.componentConstruction.numberValidation;

                return false;
            }
        };

        vm.format = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.format) return vm.componentConstruction.format;

                return null;
            }
        };

        vm.currency = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.currency) return vm.componentConstruction.currency;

                return '';
            }
        };

        vm.nullValueLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.nullValueLabel) return vm.componentConstruction.nullValueLabel;

                return 'SIN REGISTROS';
            }
        };

        vm.isDisabled = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isDisabled) return vm.componentConstruction.isDisabled;

                //Default value
                return false;
            }
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            setValues();
        };

        vm.runOnChangeTrigger = function () {
            if (vm.onChange) vm.onChange({ value: vm.valueModel });

            cleanPlannedRecharge();
            plannedRecharge = $timeout(setValues, 1500);
        };

        vm.getDisplay = function () {
            if (vm.valueModel) {
                if (vm.format.get()) return $filter(vm.format.get())(vm.valueModel, vm.currency.get());
                return vm.valueModel;
            } else return vm.nullValueLabel.get();
        };

        function cleanPlannedRecharge() {
            if (plannedRecharge) {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function setValues() {
            vm.isForm.value = vm.isForm.get();
            vm.tooltip.value = vm.tooltip.get();
            vm.isTextArea.value = vm.isTextArea.get();
            vm.title.value = vm.title.get();
            vm.display = vm.getDisplay();
            vm.type.value = vm.type.get();
            vm.name.value = vm.name.get();
            vm.isRequired.value = vm.isRequired.get();
            vm.emailMessage.value = vm.emailMessage.get();
            vm.urlMessage.value = vm.urlMessage.get();
            vm.requiredMessage.value = vm.requiredMessage.get();
            vm.maxLength.value = vm.maxLength.get();
            vm.maxLengthMessage.value = vm.maxLengthMessage.get();
            vm.minLength.value = vm.minLength.get();
            vm.minLengthMessage.value = vm.minLengthMessage.get();
            vm.max.value = vm.max.get();
            vm.maxMessage.value = vm.maxMessage.get();
            vm.min.value = vm.min.get();
            vm.minMessage.value = vm.minMessage.get();
            vm.modelOptions.value = vm.modelOptions.get();
            vm.numberMessage.value = vm.numberMessage.get();
            vm.numberValidation.value = vm.numberValidation.get();
            vm.nullValueLabel.value = vm.nullValueLabel.get();
            vm.rows.value = vm.rows.get();
            vm.format.value = vm.format.get();
            vm.currency.value = vm.currency.get();
            vm.isDisabled.value = vm.isDisabled.get();
        }

        $scope.$watch(function () {
            return vm.valueModel;
        }, function (newValue, oldValue) {
            vm.display = vm.getDisplay();
        });

        //=======================================================================================================================================================================

    };

    componentcontroller.$inject = ['$filter', 'EntifixStringUtils', '$timeout', '$scope'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixInput/entifixInput.html',
        template: '<div ng-if="!vm.isTextArea.value"> \
                    <md-tooltip ng-if="vm.tooltip.value" md-direction="left">{{vm.tooltip.value}}</md-tooltip> \
                    <div ng-if="vm.isForm.value"> \
                        <md-input-container class="md-block" ng-show="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.value}}</label> \
                            <input \
                                type="{{vm.type.value}}" \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.value" \
                                ng-disabled="vm.isDisabled.value" \
                                md-maxlength="{{vm.maxLength.value}}" \
                                minlength="{{vm.minLength.value}}" \
                                name="{{vm.name.value}}" \
                                aria-label="{{vm.name.value}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-model-options="vm.modelOptions.value" \
                                step="any" \
                                number-validation="{{vm.numberValidation.value}}" \
                                entifix-number-validation="{{vm.numberValidation.value}}" \
                                entifix-number-block \
                                ng-max="vm.max.value" \
                                ng-min="vm.min.value" \
                                autocomplete="off"/> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="md-maxlength">{{vm.maxLengthMessage.value}}</div> \
                                    <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                    <div ng-message="email">{{vm.emailMessage.value}}</div> \
                                    <div ng-message="url">{{vm.urlMessage.value}}</div> \
                                    <div ng-message="number">{{vm.numberMessage.value}}</div> \
                                    <div ng-message="max">{{vm.maxMessage.value}}</div> \
                                    <div ng-message="min">{{vm.minMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                        <div ng-hide="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.value}}</label><br/> \
                            <strong>{{vm.display}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.value"> \
                        <md-input-container class="md-block"> \
                            <label>{{vm.title.value}}</label> \
                            <input \
                                type="{{vm.type.value}}" \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.value" \
                                ng-disabled="vm.isDisabled.value" \
                                md-maxlength="{{vm.maxLength.value}}" \
                                minlength="{{vm.minLength.value}}" \
                                name="{{vm.name.value}}" \
                                aria-label="{{vm.name.value}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-model-options="vm.modelOptions.value" \
                                step="any" \
                                entifix-number-validation="{{vm.numberValidation.value}}" \
                                entifix-number-block \
                                ng-max="vm.max.value" \
                                ng-min="vm.min.value" \
                                autocomplete="off"/> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="md-maxlength">{{vm.maxLengthMessage.value}}</div> \
                                    <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                    <div ng-message="email">{{vm.emailMessage.value}}</div> \
                                    <div ng-message="url">{{vm.urlMessage.value}}</div> \
                                    <div ng-message="number">{{vm.numberMessage.value}}</div> \
                                    <div ng-message="max">{{vm.maxMessage.value}}</div> \
                                    <div ng-message="min">{{vm.minMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                    </div> \
                </div> \
                <div ng-if="vm.isTextArea.value"> \
                    <md-tooltip ng-if="vm.tooltip.value" md-direction="left">{{vm.tooltip.value}}</md-tooltip> \
                    <div ng-if="vm.isForm.value"> \
                        <md-input-container class="md-block" ng-show="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.value}}</label> \
                            <textarea \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.value" \
                                ng-disabled="vm.isDisabled.value" \
                                md-maxlength="{{vm.maxLength.value}}" \
                                rows="{{vm.rows.value}}" \
                                minlength="{{vm.minLength.value}}" \
                                name="{{vm.name.value}}" \
                                aria-label="{{vm.name.value}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-model-options="vm.modelOptions.value" \
                                step="any" \
                                entifix-number-validation="{{vm.numberValidation.value}}" \
                                entifix-number-block \
                                ng-max="vm.max.value" \
                                ng-min="vm.min.value"></textarea> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="md-maxlength">{{vm.maxLengthMessage.value}}</div> \
                                    <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                    <div ng-message="email">{{vm.emailMessage.value}}</div> \
                                    <div ng-message="url">{{vm.urlMessage.value}}</div> \
                                    <div ng-message="number">{{vm.numberMessage.value}}</div> \
                                    <div ng-message="max">{{vm.maxMessage.value}}</div> \
                                    <div ng-message="min">{{vm.minMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                        <div ng-hide="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.value}}</label><br/> \
                            <strong>{{vm.display}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.value"> \
                        <md-input-container class="md-block"> \
                            <label>{{vm.title.value}}</label> \
                            <textarea \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.value" \
                                ng-disabled="vm.isDisabled.value" \
                                md-maxlength="{{vm.maxLength.value}}" \
                                rows="{{vm.rows.value}}" \
                                minlength="{{vm.minLength.value}}" \
                                name="{{vm.name.value}}" \
                                aria-label="{{vm.name.value}}" \
                                ng-change="vm.runOnChangeTrigger()" \
                                ng-model-options="vm.modelOptions.value" \
                                step="any" \
                                entifix-number-validation="{{vm.numberValidation.value}}" \
                                entifix-number-block \
                                ng-max="vm.max.value" \
                                ng-min="vm.min.value"></textarea> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.value}}</div> \
                                    <div ng-message="md-maxlength">{{vm.maxLengthMessage.value}}</div> \
                                    <div ng-message="minlength">{{vm.minLengthMessage.value}}</div> \
                                    <div ng-message="email">{{vm.emailMessage.value}}</div> \
                                    <div ng-message="url">{{vm.urlMessage.value}}</div> \
                                    <div ng-message="number">{{vm.numberMessage.value}}</div> \
                                    <div ng-message="max">{{vm.maxMessage.value}}</div> \
                                    <div ng-message="min">{{vm.minMessage.value}}</div> \
                                </div> \
                        </md-input-container> \
                    </div> \
                </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixInput', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller(EntifixStringUtils) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.isLoading = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) vm.queryDetails.resource.isLoading.get();

                //Default value
                return false;
            }
        };

        //Label - Editable Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixradiobutton' + randomNumber;
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.isMultipleDisplay = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isMultipleDisplay) return vm.componentConstruction.isMultipleDisplay;

                //Default value
                return false;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            loadCollection();
            checkoutputs();
        };

        function loadCollection() {
            if (!vm.isMultipleDisplay.get()) {
                vm.queryDetails.resource.getEnumerationBind(vm.componentConstruction.displayPropertyName, function (enumResult) {
                    vm.items = enumResult;
                });
            } else {
                prepareMultiDisplayParameters();
                vm.queryDetails.resource.getEnumerationBindMultiDisplay(vm.parameters);
            }
        };

        function prepareMultiDisplayParameters() {
            var actionSuccess = function actionSuccess(enumResult) {
                vm.items = enumResult;
            };
            vm.parameters = {
                displayProperties: vm.componentConstruction.displayProperties,
                actionSuccess: actionSuccess,
                actionError: vm.queryDetails.actionError,
                filters: vm.queryDetails.filters
            };
        }

        function checkoutputs() {
            vm.componentBindingOut = {
                selectedEntity: {
                    get: function get() {
                        return vm.getValue();
                    }
                }
            };

            if (vm.init) vm.init();
        };

        vm.getDisplayValue = function () {
            if (vm.valueModel && vm.items && vm.items.length > 0) {
                var item = vm.items.filter(function (e) {
                    return e.Value == vm.valueModel;
                })[0];
                if (item) return item.Display;
            }

            return null;
        };

        vm.getValue = function () {
            if (vm.valueModel && vm.items && vm.items.length > 0) {
                var item = vm.items.filter(function (e) {
                    return e.Value == vm.valueModel;
                })[0];
                if (item) return item;
            }

            return null;
        };

        vm.runOnChangeTrigger = function () {
            var entity = vm.items.filter(function (e) {
                return e.Value == vm.valueModel;
            })[0];
            if (vm.onChange) vm.onChange({ oldValue: vm.valueModel, newValue: vm.valueModel, entity: entity });
        };

        //=======================================================================================================================================================================
    };

    componentcontroller.$inject = ['EntifixStringUtils'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            queryDetails: '<',
            componentConstruction: '<',
            componentBindingOut: '=',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixRadioButton/entifixRadioButton.html',
        template: '<div ng-class="{\'whirl double-up whirlback\': vm.isLoading.get()}"> \
                    <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                    <div ng-if="vm.isForm.get()"> \
                        <div ng-if="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label> \
                            <md-radio-group \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.get()" \
                                ng-change="vm.runOnChangeTrigger()" \
                                name="{{vm.name.get()}}"> \
                                <md-radio-button \
                                    ng-repeat="item in vm.items" \
                                    ng-value="item.Value" \
                                    aria-label="item.Display"> \
                                    {{item.Display}} \
                                </md-radio-button> \
                                <div ng-messages="vm.canEvaluateErrors.get()" class="ngMessage-error" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                </div>  \
                            </md-radio-group> \
                        </div> \
                        <div ng-if="!vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label><br/> \
                            <strong>{{vm.getDisplayValue()}}</strong> \
                        </div> \
                    </div> \
                    <div ng-if="!vm.isForm.get()"> \
                        <div ng-if="vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label> \
                            <md-radio-group \
                                ng-model="vm.valueModel" \
                                ng-required="vm.isRequired.get()" \
                                ng-change="vm.runOnChangeTrigger()" \
                                name="{{vm.name.get()}}"> \
                                <md-radio-button \
                                    ng-repeat="item in vm.items" \
                                    ng-value="item.Value" \
                                    aria-label="item.Display"> \
                                    {{item.Display}} \
                                </md-radio-button> \
                                <div ng-messages="vm.canEvaluateErrors.get()" class="ngMessage-error" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                </div>  \
                            </md-radio-group> \
                        </div> \
                        <div ng-if="!vm.canShowEditableFields.get()"> \
                            <label>{{vm.title.get()}}</label><br/> \
                            <strong>{{vm.getDisplayValue()}}</strong> \
                        </div> \
                    </div> \
                </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixRadioButton', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller(EntifixStringUtils) {
        var vm = this;
        var randomNumber = Math.floor(Math.random() * 100 + 1);

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.isLoading = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) vm.queryDetails.resource.isLoading.get();

                //Default value
                return false;
            }
        };

        //Label - Input Behavior
        vm.canShowEditableFields = {
            get: function get() {
                if (vm.showEditableFields) return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors = {
            get: function get() {
                if (vm.evaluateErrors) return vm.evaluateErrors({ name: vm.name.get() });

                return false;
            }
        };

        //Error validations
        vm.isRequired = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isRequired) return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };

        vm.requiredMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage) {
                    if (vm.componentConstruction.requiredMessage.getter) return vm.componentConstruction.requiredMessage.getter();

                    if (vm.componentConstruction.requiredMessage.text) return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };

        vm.multipleMessage = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.multipleMessage) {
                    if (vm.componentConstruction.multipleMessage.getter) return vm.componentConstruction.multipleMessage.getter();

                    if (vm.componentConstruction.multipleMessage.text) return vm.componentConstruction.multipleMessage.text;
                }

                //Default value
                return 'Error en la elección del elemento, vuelva a seleccionarlo';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };

        vm.name = {
            get: function get() {
                if (vm.title.get() != '') return EntifixStringUtils.getCleanedString(vm.title.get());
                return 'entifixselect' + randomNumber;
            }
        };

        vm.isForm = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null) return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.isMultipleDisplay = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isMultipleDisplay) return vm.componentConstruction.isMultipleDisplay;

                //Default value
                return false;
            }
        };

        vm.isMultiple = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isMultiple) return vm.componentConstruction.isMultiple;

                //Default value
                return false;
            }
        };

        vm.tooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.tooltip) {
                    if (vm.componentConstruction.tooltip.getter) return vm.componentConstruction.tooltip.getter();

                    if (vm.componentConstruction.tooltip.text) return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };

        vm.collection = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.collection) {
                    if (vm.componentConstruction.collection.getter) return vm.componentConstruction.collection.getter();
                    if (vm.componentConstruction.collection.elements) return vm.componentConstruction.collection.elements;
                }

                //Default value
                return null;
            }
        };

        vm.nullValueLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.nullValueLabel) return vm.componentConstruction.nullValueLabel;

                return 'SIN REGISTROS';
            }
        };

        vm.canShowNoneOption = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.canShowNoneOption) return vm.componentConstruction.canShowNoneOption;

                //Default value
                return false;
            }
        };

        vm.noneLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.noneLabel) return vm.componentConstruction.noneLabel;

                //Default value
                return 'Ninguno';
            }
        };

        vm.allLabel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.allLabel) return vm.componentConstruction.allLabel;

                //Default value
                return 'Seleccionar todos';
            }
        };

        vm.getConstantFilters = function () {
            var constantFilters = null;
            if (vm.queryDetails && vm.queryDetails.constantFilters) {
                if (vm.queryDetails.constantFilters.getter) constantFilters = vm.queryDetails.constantFilters.getter();else constantFilters = vm.queryDetails.constantFilters;
            }

            return constantFilters;
        };
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            loadCollection();
            checkoutputs();
            vm.selectedAll = false;
        };

        function loadCollection() {
            if (vm.collection.get()) vm.items = vm.collection.get();else {
                if (!vm.isMultipleDisplay.get()) {
                    vm.queryDetails.resource.getEnumerationBind(vm.componentConstruction.displayPropertyName, function (enumResult) {
                        vm.items = enumResult;
                    }, undefined, vm.getConstantFilters());
                } else {
                    prepareMultiDisplayParameters();
                    vm.queryDetails.resource.getEnumerationBindMultiDisplay(vm.parameters);
                }
            }
        };

        function prepareMultiDisplayParameters() {
            var actionSuccess = function actionSuccess(enumResult) {
                vm.items = enumResult;
            };
            vm.parameters = {
                displayProperties: vm.componentConstruction.displayProperties,
                actionSuccess: actionSuccess,
                actionError: vm.queryDetails.actionError,
                filters: vm.getConstantFilters()
            };
        }

        function checkoutputs() {
            vm.componentBindingOut = {
                selectedEntity: {
                    get: function get() {
                        return vm.currentEntity || vm.getValue();
                    }
                }
            };

            if (vm.init) vm.init();
        };

        vm.getDisplayValue = function () {
            if (!vm.isMultiple.get()) {
                if (vm.valueModel && vm.items && vm.items.length > 0) {
                    var item = vm.items.filter(function (e) {
                        return e.Value == vm.valueModel;
                    })[0];
                    if (item) return item.Display;
                }
            } else {
                if (vm.valueModel && vm.items && vm.items.length > 0) {
                    var item = '';
                    vm.valueModel.forEach(function (valueModel, index) {
                        item += vm.items.filter(function (e) {
                            return e.Value == valueModel;
                        })[0].Display + (index < vm.valueModel.length - 1 ? ', ' : '');
                    });
                    if (item) return item;
                }
            }
            return vm.nullValueLabel.get();
        };

        vm.getValue = function () {
            if (vm.valueModel && vm.items && vm.items.length > 0) {
                var item = vm.items.filter(function (e) {
                    return e.Value == vm.valueModel;
                })[0];
                if (item) return item;
            }

            return null;
        };

        vm.runOnChangeTrigger = function () {
            vm.currentEntity = vm.items.filter(function (e) {
                return e.Value == vm.valueModel;
            })[0];
            if (vm.onChange) vm.onChange({ oldValue: vm.valueModel, newValue: vm.valueModel, entity: vm.currentEntity });
        };

        vm.cleanSearch = function () {
            vm.searchText = '';
        };

        vm.selectAll = function () {
            vm.selectedAll = !vm.selectedAll;
            delete vm.all;
            vm.valueModel = [];
            if (vm.selectedAll) {
                if (vm.items && vm.items.length > 0) {
                    vm.items.forEach(function (e) {
                        return vm.valueModel.push(e.Value);
                    });
                }
                vm.all = true;
            }
        };

        //=======================================================================================================================================================================

    };

    componentcontroller.$inject = ['EntifixStringUtils'];

    var component = {
        bindings: {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            queryDetails: '<',
            componentConstruction: '<',
            componentBindingOut: '=',
            onChange: '&'
        },
        //templateUrl: 'dist/shared/components/entifixSelect/entifixSelect.html',
        template: '<div ng-class="{\'whirl double-up whirlback\': vm.isLoading.get()}" ng-if="!vm.isMultiple.get()"> \
                        <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                        <div ng-if="vm.isForm.get()"> \
                            <md-input-container ng-if="vm.canShowEditableFields.get()" class="entifix-select-width"> \
                                <label>{{vm.title.get()}}</label> \
                                <md-select \
                                    ng-model="vm.valueModel" \
                                    ng-required="vm.isRequired.get()" \
                                    ng-change="vm.runOnChangeTrigger()" \
                                    name="{{vm.name.get()}}" \
                                    aria-label="{{vm.name.get()}}" \
                                    md-on-close="vm.cleanSearch()" \
                                    data-md-container-class="selectSelectHeader"> \
                                    <md-select-header class="select-header"> \
                                        <input type="search" ng-model="vm.searchText" placeholder="Buscar {{vm.title.get()}} ..." class="header-searchbox md-text" ng-keydown="$event.stopPropagation()"/> \
                                    </md-select-header> \
                                    <md-optgroup label={{vm.title.get()}}> \
                                        <md-option ng-if="vm.canShowNoneOption.get()" ng-value="undefined"><em>{{vm.noneLabel.get()}}</em></md-option> \
                                        <md-option ng-repeat="item in vm.items | filter:vm.searchText" ng-value="item.Value">{{item.Display}}</md-option> \
                                    </md-optgroup> \
                                </md-select> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                </div>  \
                            </md-input-container> \
                            <div ng-if="!vm.canShowEditableFields.get()"> \
                                <label>{{vm.title.get()}}</label><br/> \
                                <strong>{{vm.getDisplayValue()}}</strong> \
                            </div> \
                        </div> \
                        <div ng-if="!vm.isForm.get()"> \
                            <md-input-container class="entifix-select-width"> \
                                <label>{{vm.title.get()}}</label> \
                                <md-select \
                                    ng-model="vm.valueModel" \
                                    ng-required="vm.isRequired.get()" \
                                    ng-change="vm.runOnChangeTrigger()" \
                                    name="{{vm.name.get()}}" \
                                    aria-label="{{vm.name.get()}}" \
                                    md-on-close="vm.cleanSearch()" \
                                    data-md-container-class="selectSelectHeader"> \
                                    <md-select-header class="select-header"> \
                                        <input type="search" ng-model="vm.searchText" placeholder="Buscar {{vm.title.get()}} ..." class="header-searchbox md-text" ng-keydown="$event.stopPropagation()"/> \
                                    </md-select-header> \
                                    <md-optgroup label={{vm.title.get()}}> \
                                        <md-option ng-if="vm.canShowNoneOption.get()" ng-value="undefined"><em>{{vm.noneLabel.get()}}</em></md-option> \
                                        <md-option ng-repeat="item in vm.items | filter:vm.searchText" ng-value="item.Value">{{item.Display}}</md-option> \
                                    </md-optgroup> \
                                </md-select> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                </div> \
                            </md-input-container> \
                        </div> \
                    </div> \
                    <div ng-class="{\'whirl double-up whirlback\': vm.isLoading.get()}" ng-if="vm.isMultiple.get()"> \
                        <md-tooltip ng-if="vm.tooltip.get()" md-direction="left">{{vm.tooltip.get()}}</md-tooltip> \
                        <div ng-if="vm.isForm.get()"> \
                            <md-input-container ng-if="vm.canShowEditableFields.get()" class="entifix-select-width"> \
                                <label>{{vm.title.get()}}</label> \
                                <md-select \
                                    ng-model="vm.valueModel" \
                                    ng-required="vm.isRequired.get()" \
                                    ng-change="vm.runOnChangeTrigger()" \
                                    name="{{vm.name.get()}}" \
                                    aria-label="{{vm.name.get()}}" \
                                    md-on-close="vm.cleanSearch()" \
                                    data-md-container-class="selectSelectHeader" \
                                    multiple=""> \
                                    <md-select-header class="select-header"> \
                                        <input type="search" ng-model="vm.searchText" placeholder="Buscar {{vm.title.get()}} ..." class="header-searchbox md-text" ng-keydown="$event.stopPropagation()"/><br/> \
                                    </md-select-header> \
                                    <md-select-header class="select-header"> \
                                        <md-button layout-fill value="all" ng-click="vm.selectAll($event)" style="text-align: left;">{{vm.allLabel.get()}}</md-button> \
                                    </md-select-header> \
                                    <md-optgroup label={{vm.title.get()}}> \
                                        <md-option ng-if="vm.canShowNoneOption.get()" ng-value="undefined"><em>{{vm.noneLabel.get()}}</em></md-option> \
                                        <md-option ng-repeat="item in vm.items | filter:vm.searchText" ng-value="item.Value">{{item.Display}}</md-option> \
                                    </md-optgroup> \
                                </md-select> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                    <div ng-message="md-multiple">{{vm.multipleMessage.get()}}</div> \
                                </div>  \
                            </md-input-container> \
                            <div ng-if="!vm.canShowEditableFields.get()"> \
                                <label>{{vm.title.get()}}</label><br/> \
                                <strong>{{vm.getDisplayValue()}}</strong> \
                            </div> \
                        </div> \
                        <div ng-if="!vm.isForm.get()"> \
                            <md-input-container class="entifix-select-width"> \
                                <label>{{vm.title.get()}}</label> \
                                <md-select \
                                    ng-model="vm.valueModel" \
                                    ng-required="vm.isRequired.get()" \
                                    ng-change="vm.runOnChangeTrigger()" \
                                    name="{{vm.name.get()}}" \
                                    aria-label="{{vm.name.get()}}" \
                                    md-on-close="vm.cleanSearch()" \
                                    data-md-container-class="selectSelectHeader" \
                                    multiple=""> \
                                    <md-select-header class="select-header"> \
                                        <input type="search" ng-model="vm.searchText" placeholder="Buscar {{vm.title.get()}} ..." class="header-searchbox md-text" ng-keydown="$event.stopPropagation()"/><br/> \
                                    </md-select-header> \
                                    <md-select-header class="select-header"> \
                                        <md-button layout-fill value="all" ng-click="vm.selectAll($event)" style="text-align: left;">{{vm.allLabel.get()}}</md-button> \
                                    </md-select-header> \
                                    <md-optgroup label={{vm.title.get()}}> \
                                        <md-option ng-if="vm.canShowNoneOption.get()" ng-value="undefined"><em>{{vm.noneLabel.get()}}</em></md-option> \
                                        <md-option ng-repeat="item in vm.items | filter:vm.searchText" ng-value="item.Value">{{item.Display}}</md-option> \
                                    </md-optgroup> \
                                </md-select> \
                                <div ng-messages="vm.canEvaluateErrors.get()" multiple> \
                                    <div ng-message="required">{{vm.requiredMessage.get()}}</div> \
                                    <div ng-message="md-multiple">{{vm.multipleMessage.get()}}</div> \
                                </div> \
                            </md-input-container> \
                        </div> \
                    </div>',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixSelect', component);
})();
'use strict';

(function () {
    'use strict';

    function componentcontroller(EntifixConfig, $mdMedia, $mdSidenav) {
        var vm = this;

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //=======================================================================================================================================================================


        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function () {
            $mdMedia('gt-md') ? vm.fixedSideBar = true : vm.fixedSideBar = false;
        };

        vm.closeSideNavPanel = function () {
            $mdSidenav('left').close();
            vm.fixedSideBar = !vm.fixedSideBar;
        };

        vm.clickElement = function (element) {
            if (element && element.click) {
                element.click();
            }

            if (element && (element.click || element.state)) {
                if (!$mdMedia('gt-md')) {
                    $mdSidenav("left").close();
                }
            }
        };

        vm.evalPermissions = function (element) {
            if (EntifixConfig.devMode.get()) {
                return true;
            }

            if (element.securityContext) {
                return EntifixSession.checkPermissions(element.securityContext);
            } else {
                return true;
            }
        };

        //=======================================================================================================================================================================
    };

    componentcontroller.$inject = ['EntifixConfig', '$mdMedia', '$mdSidenav'];

    var component = {
        bindings: {
            navbarElements: '<',
            sideMenuImage: '<'

        },
        //templateUrl: 'dist/shared/components/entifixSideMenu/entifixSideMenu.html',
        template: ' \
            <md-sidenav class="md-sidenav-left mp-sidenav" md-component-id="left" md-is-locked-open="vm.fixedSideBar" md-whiteframe="4" flex> \
                <md-content md-scroll-y flex layout="column"> \
                    <md-sidemenu locked="true"> \
                        <md-sidemenu-group> \
                            <md-toolbar layout="row" class="md-tall" md-colors="::{background: \'default-primary-50\'}"> \
                                <div class="md-toolbar-tools"> \
                                    <div layout="column" flex> \
                                        <img src="{{vm.sidemenuImage}}" class="side-menu-logo"> \
                                    </div> \
                                    <span flex></span> \
                                    <md-button class="md-icon-button" aria-label="Cerrar Menú" ng-click="vm.closeSideNavPanel()"> \
                                        <md-tooltip>Cerrar Menú</md-tooltip> \
                                        <md-icon class="material-icons" style="color:#000;">clear</md-icon> \
                                    </md-button> \
                                </div> \
                            </md-toolbar> \
                            <md-sidemenu-content ng-repeat="element in vm.navbarElements" md-icon="{{element.icon}}" md-heading="{{element.name}}" md-arrow="{{element.submenuItems}}" ng-click="vm.clickElement(element)" ng-if="vm.evalPermissions(element)" collapse-other="true" > \
                                <md-sidemenu-button ng-show="element.submenuItems" ng-repeat="subelement in element.submenuItems" ui-sref="{{subelement.state}}" ng-click="vm.clickElement(subelement)" ng-if="vm.evalPermissions(subelement)">{{subelement.name}}</md-sidemenu-button> \
                            </md-sidemenu-content> \
                        </md-sidemenu-group> \
                    </md-sidemenu> \
                </md-content> \
            </md-sidenav> \
        ',
        controller: componentcontroller,
        controllerAs: 'vm'
    };

    angular.module('entifix-js').component('entifixSideMenu', component);
})();
'use strict';

(function () {
    'use strict';

    var module = angular.module('entifix-js');

    componentController.$inject = ['BaseComponentFunctions', 'EntifixNotification', '$timeout', 'EntifixPager', '$stateParams', '$state', 'EntifixResource', '$mdMenu', 'EntifixDateGenerator', 'EntifixSession', 'EntifixConfig', 'EntifixDownloadReportSettings'];

    function componentController(BaseComponentFunctions, EntifixNotification, $timeout, EntifixPager, $stateParams, $state, EntifixResource, $mdMenu, EntifixDateGenerator, EntifixSession, EntifixConfig, EntifixDownloadReportSettings) {
        var vm = this;
        var cont = 0;
        var onLoading = true;
        var isFirstLoad = true;
        var filters;

        // Properties & Fields ===================================================================================================================================================

        //Fields
        var _isloading = false;
        var _total = 0;
        var _canShowSearchText = true;
        var _transformValues;
        var _xlsSheetResource = EntifixConfig.xlsSheetResourceName.get() ? new EntifixResource(EntifixConfig.xlsSheetResourceName.get()) : "";
        var _pdfResource = EntifixConfig.xlsSheetResourceName.get() ? new EntifixResource(EntifixConfig.pdfResourceName.get()) : "";

        // Main
        vm.isLoading = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isLoading) {
                    if (vm.componentConstruction.isLoading.value) {
                        return vm.componentConstruction.isLoading.value;
                    } else if (vm.componentConstruction.isLoading.getter) {
                        return vm.componentConstruction.isLoading.getter();
                    } else {
                        return vm.componentConstruction.isLoading;
                    }
                } else {
                    if (vm.queryDetails && vm.queryDetails.resource) {
                        return vm.queryDetails.resource.isLoading.get();
                    }
                    return _isloading;
                }
            }
        };

        vm.isDeleting = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isDeleting.get();
                return false;
            }
        };

        vm.total = {
            get: function get() {
                return _total;
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                return 'Listado';
            }
        };

        vm.icon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.icon) return vm.componentConstruction.title.icon;
                }

                //Default value
                return 'menu';
            }

            // search button 
        };vm.canSearch = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.search) return true;

                //Default value
                return false;
            }
        };

        vm.searchIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.search && vm.componentConstruction.search.icon) return vm.componentConstruction.search.icon;

                //Default value
                return 'search';
            }
        };

        vm.searchText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.search && vm.componentConstruction.search.text) return '' + vm.componentConstruction.search.text;

                //Default value
                return 'Buscar';
            }
        };

        vm.canShowSearchText = {
            get: function get() {
                return _canShowSearchText;
            },
            set: function set(value) {
                _canShowSearchText = value;
            }
        };

        // add button
        vm.canAdd = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.add) return true;

                //Default value
                return false;
            }
        };

        vm.multipleAddOptions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.add && vm.componentConstruction.add.options) return true;

                //Default value
                return false;
            }
        };

        vm.addIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.add && vm.componentConstruction.add.icon) return vm.componentConstruction.add.icon;

                //Default value
                return 'add';
            }
        };

        vm.addText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.add && vm.componentConstruction.add.text) return vm.componentConstruction.add.text;

                //Default value
                return 'Nuevo';
            }
        };

        // edit button
        vm.canEdit = {
            get: function get() {
                if (vm.componentConstruction && vm.connectionComponent.elementsSelection() == 1) {
                    if (vm.componentConstruction.edit && vm.componentConstruction.edit.enable != null) {
                        if (vm.componentConstruction.edit.enable instanceof Object && vm.componentConstruction.edit.enable.getter) return vm.componentConstruction.edit.enable.getter();else if (vm.componentConstruction.edit.enable != null) return vm.componentConstruction.edit.enable;
                    } else if (vm.componentConstruction.edit) return true;
                }

                //Default value
                return false;
            }
        };

        vm.multipleEditOptions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.options) return true;

                //Default value
                return false;
            }
        };

        vm.editIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.icon) return vm.componentConstruction.edit.icon;

                //Default value
                return 'visibility';
            }
        };

        vm.editText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.text) return vm.componentConstruction.edit.text;

                //Default value
                return 'Detalle';
            }
        };

        // remove button
        vm.canRemove = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.connectionComponent.elementsSelection() >= 1) return true;

                //Default value
                return false;
            }
        };

        vm.multipleRemoveOptions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.options) return true;

                //Default value
                return false;
            }
        };

        vm.removeIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.icon) return vm.componentConstruction.remove.icon;

                //Default value
                return 'delete';
            }
        };

        vm.removeText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.text) return vm.componentConstruction.remove.text;

                //Default value
                return 'Eliminar';
            }
        };

        vm.xlsSheetIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.xlsSheetIcon && vm.componentConstruction.xlsSheetIcon.icon) return vm.componentConstruction.xlsSheetIcon.icon;

                //Default value
                return 'poll';
            }
        };

        vm.xlsSheetText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.xlsSheetText && vm.componentConstruction.xlsSheetText.text) return vm.componentConstruction.xlsSheetText.text;

                //Default value
                return 'Descargar Excel';
            }
        };

        vm.canDownloadXlsSheet = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.canDownloadXlsSheet != null) return vm.componentConstruction.canDownloadXlsSheet;

                //Default value
                return true;
            }
        };

        vm.pdfIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.pdfIcon && vm.componentConstruction.pdfIcon.icon) return vm.componentConstruction.pdfIcon.icon;

                //Default value
                return 'picture_as_pdf';
            }
        };

        vm.pdfText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.pdfText && vm.componentConstruction.pdfText.text) return vm.componentConstruction.pdfText.text;

                //Default value
                return 'Descargar Pdf';
            }
        };

        vm.canDownloadPdf = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.canDownloadPdf != null) return vm.componentConstruction.canDownloadPdf;

                //Default value
                return true;
            }
        };

        vm.allPagesText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.allPagesText && vm.componentConstruction.allPagesText.text) return vm.componentConstruction.allPagesText.text;

                //Default value
                return 'Descargar todas las páginas';
            }
        };

        vm.currentPageText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.currentPageText && vm.componentConstruction.currentPageText.text) return vm.componentConstruction.currentPageText.text;

                //Default value
                return 'Descargar página actual';
            }
        };

        vm.columnsText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.columnsText) return vm.componentConstruction.columnsText;

                //Default value
                return 'Columnas';
            }
        };

        vm.customSearchText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.customSearchText) return vm.componentConstruction.customSearchText;

                //Default value
                return 'Búsqueda Avanzada';
            }
        };

        vm.propertiesOperators = {
            defaults: function defaults() {
                if (vm.componentConstruction && vm.componentConstruction.defaultOperators) return vm.componentConstruction.defaultOperators;

                //Default value
                return [{ display: 'Igual', operator: '=' }, { display: 'Mayor que', operator: '>' }, { display: 'Menor que', operator: '<' }, { display: 'Mayor o igual que', operator: '>=' }, { display: 'Menor o igual que', operator: '<=' }, { display: 'Diferente', operator: '<>' }, { display: 'Incluya', operator: 'lk' }];
            },

            strings: function strings() {
                if (vm.componentConstruction && vm.componentConstruction.stringOperators) return vm.componentConstruction.stringOperators;

                //Default value
                return [{ display: 'Igual', operator: '=' }, { display: 'Diferente', operator: '<>' }, { display: 'Incluya', operator: 'lk' }];
            },

            numbers: function numbers() {
                if (vm.componentConstruction && vm.componentConstruction.numberOperators) return vm.componentConstruction.numberOperators;

                //Default value
                return [{ display: 'Igual', operator: '=' }, { display: 'Mayor que', operator: '>' }, { display: 'Menor que', operator: '<' }, { display: 'Mayor o igual que', operator: '>=' }, { display: 'Menor o igual que', operator: '<=' }, { display: 'Diferente', operator: '<>' }];
            },

            booleans: function booleans() {
                if (vm.componentConstruction && vm.componentConstruction.booleanOperators) return vm.componentConstruction.booleanOperators;

                //Default value
                return [{ display: 'Igual', operator: '=' }, { display: 'Diferente', operator: '<>' }];
            },

            enums: function enums() {
                if (vm.componentConstruction && vm.componentConstruction.enumOperators) return vm.componentConstruction.enumOperators;

                //Default value
                return [{ display: 'Igual', operator: '=' }, { display: 'Diferente', operator: '<>' }];
            }
        };

        vm.operatorsText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.operatorsText) return vm.componentConstruction.operatorsText;

                //Default value
                return 'Operadores';
            }
        };

        vm.valueToSearchText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.valueToSearchText) return vm.componentConstruction.valueToSearchText;

                //Default value
                return 'Valor';
            }
        };

        vm.addFilterText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.addFilterText) return vm.componentConstruction.addFilterText;

                //Default value
                return 'Agregar';
            }
        };

        vm.selectColumns = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.selectColumns != null) return vm.componentConstruction.selectColumns;

                //Default value
                return true;
            }
        };

        vm.queryParams = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.queryParams != null) return vm.componentConstruction.queryParams;

                //Default value
                return true;
            }
        };

        vm.isMovement = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.isMovement != null) return vm.componentConstruction.isMovement;

                //Default value
                return false;
            }
        };

        vm.startDateText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.startDateText) return vm.componentConstruction.startDateText;

                //Default value
                return 'Fecha Documento Del';
            }
        };

        vm.startDateProperty = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource && vm.queryDetails.resource.getStartDateProperty()) return vm.queryDetails.resource.getStartDateProperty();

                //Default value
                return 'fechaDocumento';
            }
        };

        vm.endDateText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.endDateText) return vm.componentConstruction.endDateText;

                //Default value
                return 'Fecha Documento Al';
            }
        };

        vm.endDateProperty = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource && vm.queryDetails.resource.getEndDateProperty()) return vm.queryDetails.resource.getEndDateProperty();

                //Default value
                return 'fechaDocumento';
            }
        };

        vm.notAppliedText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.notAppliedText) return vm.componentConstruction.notAppliedText;

                //Default value
                return { basic: 'Pendientes', extended: 'Mostrar únicamente registros pendientes' };
            }
        };

        vm.notApplyProperty = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource && vm.queryDetails.resource.getNotApplyProperty()) return vm.queryDetails.resource.getNotApplyProperty();

                //Default value
                return 'estado';
            }
        };

        vm.notApplyValue = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.notApplyValue) return vm.componentConstruction.notApplyValue;

                //Default value
                return 'REGISTRADO';
            }
        };

        vm.selectAllText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.selectAllText) return vm.componentConstruction.selectAllText;

                //Default value
                return 'Seleccionar todos';
            }
        };

        vm.pagerConfiguration = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.pagerConfiguration) return vm.componentConstruction.pagerConfiguration;

                //Default value
                return null;
            }
        };

        vm.blockTableOnChangeView = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.blockTableOnChangeView) return vm.componentConstruction.blockTableOnChangeView;

                //Default value
                return false;
            }
        };

        vm.allowCustomSearch = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.allowCustomSearch != null) return vm.componentConstruction.allowCustomSearch;

                //Default value
                return true;
            }
        };

        vm.hasPermissions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.permissions != null) return true;

                //Default value
                return false;
            }
        };

        vm.hasAllPermission = {
            get: function get() {
                if (vm.componentConstruction.permissions.all != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.all)) return true;

                //Default value
                return false;
            }
        };

        vm.hasAddPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.add || vm.componentConstruction.permissions.add != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.add)) return true;

                //Default value
                return false;
            }
        };

        vm.hasEditPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.edit || vm.componentConstruction.permissions.edit != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.edit)) return true;

                //Default value
                return false;
            }
        };

        vm.hasRemovePermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.remove || vm.componentConstruction.permissions.remove != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.remove)) return true;

                //Default value
                return false;
            }
        };

        vm.hasXlsSheetPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.xlsSheet || vm.componentConstruction.permissions.xlsSheet != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.xlsSheet)) return true;

                //Default value
                return false;
            }
        };

        vm.hasPdfPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.pdf || vm.componentConstruction.permissions.pdf != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.pdf)) return true;

                //Default value
                return false;
            }
            // =======================================================================================================================================================================

            // Methods ===============================================================================================================================================================

        };vm.$onInit = function () {
            setdefaults();
            createconnectioncomponent();
            setDefaultsTable();
            checkPermissions();
            activate();
            checkoutputs();
        };

        function setdefaults() {
            setProperties();
            createComponents();
            setDateProperties();
        };

        function createconnectioncomponent() {
            //object to connect to sub-component
            vm.connectionComponent = {};

            //Pager instance creation
            vm.pager = new EntifixPager(vm.queryDetails, vm.pagerConfiguration.get(), vm.componentConstruction.transformData ? vm.componentConstruction.transformData.columns : []);
            vm.pager.searchTextGetter.set(function () {
                if (vm.canShowSearchText.get() && vm.textBoxSearchValue && vm.textBoxSearchValue.length > 0) return vm.textBoxSearchValue;
                return null;
            });

            vm.pager.searchArrayGetter.set(function () {
                if (vm.canShowSearchText.get() && vm.searchArray && vm.searchArray.length > 0) return vm.searchArray;
                return null;
            });

            vm.pager.columnsSelectedGetter.set(function () {
                if (vm.columnsSelected && vm.columnsSelected.length > 0) return vm.columnsSelected;
                return null;
            });

            vm.connectionComponent.pager = vm.pager;
            vm.connectionComponent.resourceMembers = { get: function get() {
                    return vm.resourceMembers;
                } };
            vm.connectionComponent.onChangePageSize = vm.onChangePageSize;

            //Connection Component Properties __________________________________________________________________________________________


            //Connection Component Methods _____________________________________________________________________________________________

            vm.connectionComponent.elementsSelection = function () {
                if (vm.connectionComponent.pager != null && vm.connectionComponent.pager.currentData != null && vm.connectionComponent.pager.currentData.length > 0) return vm.connectionComponent.pager.currentData.filter(function (value) {
                    return value.$selected == true;
                }).length;
                return 0;
            };

            vm.connectionComponent.getSelectedElements = function () {
                if (vm.connectionComponent.pager != null && vm.connectionComponent.pager.currentData != null) return vm.connectionComponent.pager.currentData.filter(function (value) {
                    return value.$selected == true;
                });
                return [];
            };

            vm.connectionComponent.sortTable = function (column) {
                if (!column.$selected) column.$selected = true;else column.$selected = false;

                vm.resourceMembers.filter(function (p) {
                    return p.display != column.display;
                }).forEach(function (p) {
                    p.$selected = null;
                });
                setClassColumn();
                vm.connectionComponent.pager.sortTableColumns.set([{ sort: column.pageProperty || column.name, value: column.$selected ? 'asc' : 'desc' }]);
                vm.connectionComponent.pager.reload();
            };

            vm.connectionComponent.singleElementSelection = function (element, forceSelection) {
                if (vm.connectionComponent.allowSelection()) {
                    if (vm.connectionComponent.elementsSelection() > 1 || forceSelection) element.$selected = true;else element.$selected = !element.$selected;

                    vm.connectionComponent.pager.currentData.filter(function (value) {
                        return value != element;
                    }).forEach(function (value) {
                        value.$selected = false;
                    });

                    if (element.$selected) vm.connectionComponent.selectedElement = element;else vm.connectionComponent.selectedElement = null;

                    vm.connectionComponent.onChangeElementsSelection();
                }
            };

            vm.connectionComponent.multipleElementsSelection = function (element) {
                if (vm.connectionComponent.allowSelection()) {
                    element.$selected = !element.$selected;

                    if (element.$selected) vm.connectionComponent.selectedElement = element;else {
                        var selection = vm.connectionComponent.pager.currentData.filter(function (value) {
                            return value.$selected === true;
                        });

                        if (selection.length > 0) vm.connectionComponent.selectedElement = selection[0];else vm.connectionComponent.selectedElement = null;
                    }

                    vm.connectionComponent.onChangeElementsSelection();
                }
            };

            vm.connectionComponent.directEditionElement = function (element) {
                if (vm.componentConstruction.edit) {
                    if (vm.blockTableOnChangeView.get()) vm.isChangingView = true;
                    vm.connectionComponent.singleElementSelection(element, true);
                    vm.editElement();
                }
            };

            vm.connectionComponent.checkAll = function (allSelected) {
                if (allSelected && vm.connectionComponent.pager.currentData) vm.connectionComponent.pager.currentData.forEach(function (element) {
                    element.$selected = true;
                });else if (vm.connectionComponent.pager.currentData) vm.connectionComponent.pager.currentData.forEach(function (element) {
                    element.$selected = false;
                });
            };

            vm.connectionComponent.showColumn = function (column) {
                var columnsFilter = vm.columnsSelected.filter(function (c) {
                    return c == column;
                });
                if (columnsFilter && columnsFilter.length > 0) return true;
                return false;
            };

            vm.connectionComponent.onChangeElementsSelection = function () {};
            vm.connectionComponent.allowSelection = function () {
                return true;
            };

            //Transform values to show in columns
            vm.connectionComponent.transformValue = function (value, name) {
                if (value != null && vm.componentConstruction && vm.componentConstruction.transformData) {
                    var transformColumn = vm.componentConstruction.transformData.columns.filter(function (tc) {
                        return tc.property == name;
                    })[0];

                    //Transform dates
                    if (transformColumn.type === 'date' || transformColumn.type === 'datetime' || transformColumn.type === 'time') return transformDate(value, transformColumn.type, true);

                    //Transform navigation
                    if (transformColumn.type === 'entity') {
                        if (_transformValues && _transformValues.length > 0) {
                            var tempCollectionConf = _transformValues.filter(function (tv) {
                                return tv.propertyName == name;
                            });
                            if (tempCollectionConf.length > 0) {
                                var tempCollectionValues = tempCollectionConf[0].enumResult;
                                if (tempCollectionValues && tempCollectionValues.length > 0) {
                                    var idValue = value;
                                    if (value instanceof Object) idValue = transformColumn.resource.getId(value);

                                    var tempValues = tempCollectionValues.filter(function (enumValue) {
                                        return enumValue.Value == idValue;
                                    });
                                    if (tempValues.length > 0) return tempValues[0].Display;
                                }
                            }
                        }
                    }

                    if (transformColumn.type == 'boolean') return transformBoolean(value);
                }
            };
        };

        function createDynamicComponent() {
            var res = BaseComponentFunctions.CreateStringHtmlComponentAndBindings(vm.componentConstruction, 'bindCtrl.connectionComponent.objectBindings');
            vm.stringhtmlcomponent = res.stringhtml;
            vm.connectionComponent.objectBindings = res.objectbindings;
        };

        function activate() {
            if (vm.componentConstruction) createDynamicComponent();

            if (vm.componentBehavior) {
                vm.connectionComponent.showMultiselectColumn = vm.componentBehavior.showMultiselectColumn || false;
                vm.collapsed = vm.componentBehavior.initCollapsed || false;
            }

            vm.connectionComponent.pager.reload();
        };

        function checkoutputs() {
            vm.componentBindingOut = {
                pager: vm.pager,
                recreateDynamicComponent: createDynamicComponent,
                reloadPagination: function reloadPagination() {
                    if (!vm.pager.isLoading.get()) vm.pager.reload();
                },
                allowedActions: { canEdit: vm.canEdit, canRemove: vm.canRemove, canAdd: vm.canAdd },
                cleanFilters: function cleanFilters() {
                    vm.cleanFilters();
                },
                reloadComponent: vm.$onInit
            };
        };

        function transformDate(value, type, isForDisplay) {
            if ((type == 'date' || type == 'datetime' || type == 'time') && value) {
                if (!(value instanceof Date)) var value = transformStringToDate(value);
                var year = value.getFullYear().toString();
                var month = (value.getMonth() + 1).toString();
                var day = value.getDate().toString();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;

                if (type == 'datetime' || type == 'time') {
                    var hours = value.getHours().toString();
                    var minutes = value.getMinutes().toString();
                    var seconds = value.getSeconds().toString();
                    if (hours.length < 2) hours = '0' + hours;
                    if (minutes.length < 2) minutes = '0' + minutes;
                    if (seconds.length < 2) seconds = '0' + seconds;

                    if (isForDisplay) return day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds;
                    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
                } else if (isForDisplay) return day + '-' + month + '-' + year;
                return year + '-' + month + '-' + day;
            }
            return value;
        }

        function transformStringToDate(value) {
            return EntifixDateGenerator.transformStringToDate(value);
        }

        function transformBoolean(value) {
            if (value) return 'Si';
            return 'No';
        }

        //Defatult behavior for tool box
        vm.searchElement = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSearch) vm.componentBehavior.events.onSearch();

            if (vm.componentConstruction.search.customAction) vm.componentConstruction.search.customAction();else defaultSearch();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSearched) vm.componentBehavior.events.onSearched();
        };

        vm.addElement = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onAdd) vm.componentBehavior.events.onAdd();

            if (vm.componentConstruction.add.customAction) vm.componentConstruction.add.customAction();else defaultAdd();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onAdded) vm.componentBehavior.events.onAdded();
        };

        vm.editElement = function () {
            var elementToEdit = vm.connectionComponent.selectedElement;

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdit) vm.componentBehavior.events.onEdit();

            if (vm.componentConstruction.edit.customAction) vm.componentConstruction.edit.customAction(elementToEdit);else defaultEdit();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdited) vm.componentBehavior.events.onEdited();
        };

        vm.removeElement = function () {
            var elementsToDelete = vm.connectionComponent.getSelectedElements();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemove) vm.componentBehavior.events.onRemove();

            if (vm.componentConstruction.remove.customAction) vm.componentConstruction.remove.customAction(elementsToDelete);else defaultRemove();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemoved) vm.componentBehavior.events.onRemoved();
        };

        vm.processElement = function () {
            var elementToProcess = vm.connectionComponent.selectedElement;
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcess) vm.componentBehavior.events.onProcess();

            if (vm.componentConstruction.process.customAction) vm.componentConstruction.process.customAction(elementToProcess);else defaultProcess();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcessed) vm.componentBehavior.events.onProcessed();
        };

        function defaultAdd() {};

        function defaultEdit() {};

        function defaultRemove() {
            var message = '¿Está seguro de elminar el registro seleccionado?';

            if (vm.connectionComponent.elementsSelection() > 1) message = '¿Está seguro de eliminar todos los registros seleccionados?';

            EntifixNotification.confirm({
                "body": message,
                "header": 'Confirmación requerida',
                "actionConfirm": function actionConfirm() {
                    var elementsToDelete = vm.connectionComponent.getSelectedElements();

                    var requests = vm.connectionComponent.elementsSelection();
                    var ok = 0;
                    var e = 0;

                    var checkCompleted = function checkCompleted(response, isError) {
                        if (isError) e++;else ok++;

                        if (e + ok >= requests) {
                            if (e == 0) {
                                if (requests == 1) {
                                    EntifixNotification.success({ "body": 'Registro eliminado exitosamente.' });
                                } else {
                                    EntifixNotification.success({ "body": 'Todos los registros fueron eliminados exitosamente.' });
                                }
                            } else {
                                if (requests == 1) {
                                    EntifixNotification.error({ "body": 'El registro no pudo ser eliminado. ' + response.data.message });
                                } else {
                                    EntifixNotification.error({ "body": 'Algunos registros no pudieron ser eliminados.' });
                                }
                            }

                            vm.connectionComponent.pager.reload();
                            vm.queryDetails.resource.onMultipleDeletion.set(false);
                        }
                    };

                    if (elementsToDelete.length > 1) vm.queryDetails.resource.onMultipleDeletion.set(true);

                    vm.connectionComponent.getSelectedElements().forEach(function (element) {
                        vm.queryDetails.resource.deleteEntity(element, function (response, isError) {
                            checkCompleted(response, isError);
                        }, function () {
                            checkCompleted(response, isError);
                        });
                    });
                } });
        };

        function defaultProcess() {};

        function defaultSearch() {
            _canShowSearchText = !_canShowSearchText;

            if (!_canShowSearchText) {
                vm.textBoxSearchValue = null;
                cleanSearch();
            }
        };

        // Autosearch control
        var plannedRecharge;

        function rechargeTable() {
            vm.connectionComponent.pager.reload();
            return null;
        };

        function cleanPlannedRecharge() {
            if (plannedRecharge) {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function cleanSearch() {
            cleanPlannedRecharge();
            rechargeTable();
        };

        vm.keypressTextBoxSearch = function (keyEvent) {
            cleanPlannedRecharge();
            if (keyEvent.which === 13) rechargeTable();
        };

        vm.onChangeSearch = function () {
            cleanPlannedRecharge();
            plannedRecharge = $timeout(rechargeTable, 1500);
            vm.pager.page = 1;
            filters = null;
            if (vm.queryParams.get()) $state.go('.', { searchText: vm.textBoxSearchValue, page: 1 }, { notify: false });
        };

        // Filters control
        function setProperties() {
            vm.searchArray = [], vm.resourceMembers = [], vm.columnsSelected = [];
            vm.resourceMembers = vm.queryDetails.resource.getMembersResource.get().filter(function (rm) {
                return !rm.hidden;
            });
            vm.resourceMembers.forEach(function (property) {
                property.type ? property.type : property.type = 'text';property.display ? property.display : property.display = getDisplay(property);if (property.default && property.default != "false") vm.columnsSelected.push(getDisplay(property));
            });
            vm.operators = vm.propertiesOperators.defaults();
            setClassColumn();
        }

        function setClassColumn() {
            vm.resourceMembers.forEach(function (property) {
                if (property.$selected) property.class = 'md-column sortable sort-descent';else if (property.$selected == false) property.class = 'md-column sortable sort-ascent';else property.class = 'md-column sortable';
            });
        }

        function setDateProperties() {
            if (vm.isMovement.get() && !vm.queryDetails.constantFilters) {
                vm.queryDetails.constantFilters = {};
                vm.queryDetails.constantFilters.getter = function () {
                    return [];
                };
            }
        }

        function setDefaultsTable() {
            //Page sets default value
            if ($stateParams.page && vm.queryParams.get()) vm.pager.page = $stateParams.page;

            //Items per page sets default value
            if ($stateParams.itemsPerPage && vm.queryParams.get()) vm.pager.size = $stateParams.itemsPerPage;

            //Search text sets default value
            if ($stateParams.searchText && vm.queryParams.get()) {
                vm.textBoxSearchValue = $stateParams.searchText;
                vm.onChangeSearch();
            }

            //Custom search array sets default value
            if ($stateParams.customSearch && vm.queryParams.get()) {
                vm.customSearch = true;
                vm.searchArray = JSON.parse($stateParams.customSearch);
                vm.textBoxSearchValueChips = JSON.parse($stateParams.chips);
            } else vm.customSearch = false;

            //Date filters
            if ($stateParams.startDate && vm.queryParams.get()) vm.startDate = transformStringToDate($stateParams.startDate);

            if ($stateParams.endDate && vm.queryParams.get()) vm.endDate = transformStringToDate($stateParams.endDate);

            if (vm.startDate || vm.endDate) vm.searchItemsDate(true);
        }

        function createComponents() {
            vm.customSearchCC = {
                title: { text: vm.customSearchText.get() },
                tooltip: { text: vm.customSearchText.get() },
                isSwitch: true,
                isForm: false,
                includeValue: false
            };

            vm.valueToSearchCC = {
                title: { text: vm.valueToSearchText.get() },
                hasTime: false,
                hasMinutes: false,
                isForm: false,
                mapping: { method: function method(entity) {
                        return entity.label;
                    } },
                collection: { elements: [{ Display: 'Si', Value: "true" }, { Display: 'No', Value: "false" }] }
            };

            vm.valueToSearchDTCC = {
                title: { text: vm.valueToSearchText.get() },
                isForm: false
            };

            vm.valueToSearchTCC = {
                title: { text: vm.valueToSearchText.get() },
                isForm: false,
                hasDate: false
            };

            vm.valueToSearchQD = {
                title: { text: vm.valueToSearchText.get() },
                isForm: false
            };

            vm.chipsCC = {
                isForm: false,
                transformChip: vm.transformchip,
                readOnly: true,
                onRemove: removeChip
            };

            vm.startDateCC = {
                title: { text: vm.startDateText.get() },
                isForm: false,
                hasMinutes: false,
                hasTime: false
            };

            vm.endDateCC = {
                title: { text: vm.endDateText.get() },
                isForm: false,
                hasMinutes: false,
                hasTime: false
            };

            vm.notAppliedCC = {
                title: { text: vm.notAppliedText.get().basic },
                tooltip: { text: vm.notAppliedText.get().extended },
                isSwitch: true,
                isForm: false,
                includeValue: false
            };
        }

        vm.onChangeColumn = function () {
            vm.valueToSearch = null;

            if (vm.columnToSearch) {
                if (vm.columnToSearch.property && vm.columnToSearch.property.resource) vm.valueToSearchQD = { resource: new EntifixResource(vm.columnToSearch.property.resource) };

                if (vm.columnToSearch.type == 'text') vm.operators = vm.propertiesOperators.strings();else if (vm.columnToSearch.type == 'number') vm.operators = vm.propertiesOperators.numbers();else if (vm.columnToSearch.type == 'enum') vm.operators = vm.propertiesOperators.enums();else if (vm.columnToSearch.type == 'boolean') vm.operators = vm.propertiesOperators.booleans();else vm.operators = vm.propertiesOperators.defaults();
            }
        };

        vm.onChangeSwitch = function (value) {
            cleanCustomSearchValues(true, value);
            vm.connectionComponent.pager.reload();
        };

        vm.onChangePageSize = function (size) {
            if (vm.pager.totalData < vm.pager.size) {
                vm.pager.page = 1;
                if (vm.queryParams.get()) $state.go('.', { itemsPerPage: vm.pager.size, page: 1 }, { notify: false });
            } else if (vm.queryParams.get()) $state.go('.', { itemsPerPage: vm.pager.size }, { notify: false });

            if (!size) {
                if (!isFirstLoad) vm.pager.reload();else isFirstLoad = false;
            } else {
                vm.pager.size = size;
                vm.pager.reload();
            }
        };

        vm.onChangePage = function () {
            vm.pager.reload();
            if (vm.queryParams.get()) $state.go('.', { page: vm.pager.page }, { notify: false });
        };

        vm.addChip = function () {
            if (vm.columnToSearch.display && vm.operator.operator && vm.valueToSearch) {
                vm.valueToSearch = transformDate(vm.valueToSearch, vm.columnToSearch.type);
                vm.textBoxSearchValueChips.push(vm.columnToSearch.display + ' ' + vm.operator.operator + ' ' + vm.valueToSearch);
                vm.searchArray.push({ property: vm.columnToSearch.pageProperty || vm.columnToSearch.name, operator: vm.operator.operator, value: vm.valueToSearch });
            }
            cleanCustomSearchValues();
            setParametersAddChip();
        };

        function removeChip(chip, index) {
            vm.searchArray.splice(index, 1);
            if (vm.searchArray.length > 0 && vm.textBoxSearchValueChips.length > 0 && vm.queryParams.get()) $state.go('.', { customSearch: JSON.stringify(vm.searchArray), chips: JSON.stringify(vm.textBoxSearchValueChips) }, { notify: false });else if (vm.queryParams.get()) $state.go('.', { customSearch: null, chips: null }, { notify: false });
            filters = null;
        }

        function setParametersAddChip() {
            vm.pager.page = 1;
            if (vm.queryParams.get()) $state.go('.', { customSearch: JSON.stringify(vm.searchArray), chips: JSON.stringify(vm.textBoxSearchValueChips), page: vm.pager.page }, { notify: false });
        }

        function cleanCustomSearchValues(cleanedParams, switchValue, cleanedDates) {
            vm.columnToSearch = null;
            vm.operator = null;
            vm.valueToSearch = null;
            vm.textBoxSearchValue = null;
            filters = null;

            if (cleanedParams) cleanParams(switchValue);

            if (cleanedDates) cleanDates();
        }

        function cleanParams(switchValue) {
            if (!switchValue) {
                vm.searchArray = [];
                vm.pager.page = 1;
                if (vm.queryParams.get()) $state.go('.', { customSearch: null, chips: null, page: vm.pager.page }, { notify: false });
            } else if (vm.queryParams.get()) $state.go('.', { customSearch: null, chips: null, searchText: null }, { notify: false });
            vm.textBoxSearchValueChips = [];
        }

        function cleanDates() {
            if (vm.queryDetails.constantFilters) vm.queryDetails.constantFilters.getter = function () {
                return [];
            };
            vm.startDate = null;
            vm.endDate = null;
            vm.notApplied = false;
            $state.go('.', { customSearch: null, chips: null, searchText: null, page: vm.pager.page, itemsPerPage: vm.pager.size, startDate: null, endDate: null }, { notify: false });
        }

        vm.cleanFilters = function () {
            cleanCustomSearchValues(true, false, true);
            vm.connectionComponent.pager.reload();
        };

        function getDisplay(property) {
            if (property.display) return property.display;
            if (property.name) return getCleanedString(property.name);
            return null;
        }

        function getCleanedString(stringToClean) {
            return stringToClean.charAt(0).toUpperCase() + stringToClean.substring(1, stringToClean.length).toLowerCase();
        }

        vm.searchItemsDate = function (skipReload) {
            vm.queryDetails.constantFilters.getter = function () {
                return [{ property: vm.startDateProperty.get(), value: transformDate(vm.startDate, 'datetime'), operator: '>=', type: 'fixed_filter' }, { property: vm.endDateProperty.get(), value: transformDate(vm.endDate, 'datetime'), operator: '<=', type: 'fixed_filter' }];
            };
            if (!skipReload) vm.connectionComponent.pager.reload();
        };

        vm.onChangeDateStart = function (value) {
            $state.go('.', { startDate: transformDate(vm.startDate, 'datetime') }, { notify: false });
        };

        vm.onChangeDateEnd = function (value) {
            $state.go('.', { endDate: transformDate(vm.endDate, 'datetime') }, { notify: false });
        };

        vm.onChangeNotApplied = function (value) {
            vm.queryDetails.constantFilters = {};
            var constantFilters = [];
            if (value) constantFilters.push({ property: vm.notApplyProperty.get(), value: vm.notApplyValue.get(), type: 'fixed_filter' });
            if (vm.startDate && vm.endDate) constantFilters.push({ property: vm.startDateProperty.get(), value: transformDate(vm.startDate, 'datetime'), type: 'fixed_filter', operator: '>=' }, { property: vm.endDateProperty.get(), value: transformDate(vm.endDate, 'datetime'), type: 'fixed_filter', operator: '<=' });
            vm.queryDetails.constantFilters.getter = function () {
                return constantFilters;
            };
            vm.connectionComponent.pager.reload();
        };

        vm.selectAllItems = function () {
            onLoading = false;
            if (cont % 2 == 0) {
                vm.columnsSelected = [];
                vm.resourceMembers.forEach(function (property) {
                    vm.columnsSelected.push(getDisplay(property));
                });
            } else {
                vm.columnsSelected = [];
                vm.resourceMembers.forEach(function (property) {
                    if (property.default && property.default != "false") vm.columnsSelected.push(getDisplay(property));
                });
            }
            cont++;
        };

        vm.reloadAllSelected = function () {
            if (!onLoading && cont % 2 != 0) vm.columnsSelected.push(vm.selectAllText.get());else if (!onLoading) {
                var index = vm.columnsSelected.indexOf(vm.selectAllText.get());
                if (index > 0) vm.columnsSelected.splice(index, 1);
            }
        };

        vm.openXlsSheetMenu = function ($mdMenu, ev) {
            $mdMenu.open(ev);
        };

        vm.openPdfMenu = function ($mdMenu, ev) {
            $mdMenu.open(ev);
        };

        vm.downloadFileSimplePage = function (type) {
            new EntifixDownloadReportSettings().chooseDownloadReportSettings(function (defaults) {
                vm.downloadFileSimplePageResource(type, defaults);
            });
        };

        vm.downloadFileSimplePageResource = function (type, defaults) {
            var options = {
                type: type,
                requestType: "simple-page",
                data: vm.connectionComponent.pager.currentData,
                title: vm.queryDetails.resource.resourceName.get(),
                fileName: vm.queryDetails.resource.resourceName.get() + " " + new Date().toLocaleString(),
                pageSize: defaults.pageSize || "Letter",
                tableStriped: defaults.tableStriped != undefined ? defaults.tableStriped : true,
                pageOrientation: defaults.pageOrientation || "Landscape"
            };

            switch (type) {
                case "pdf":
                    options.contentType = "application/pdf";
                    options.columns = getMembersSelected();
                    _pdfResource.getFile(options);
                    break;

                case "xls":
                    options.contentType = "application/vnd.ms-excel";
                    options.columns = vm.resourceMembers;
                    _xlsSheetResource.getFile(options);
                    break;

                // add more types of download
            }
        };

        vm.downloadFileAllPages = function (type) {
            new EntifixDownloadReportSettings().chooseDownloadReportSettings(function (defaults) {
                vm.downloadFileAllPagesResource(type, defaults);
            });
        };

        vm.downloadFileAllPagesResource = function (type, defaults) {
            var options = {
                type: type,
                requestType: "all-pages",
                searchText: vm.textBoxSearchValue,
                searchArray: vm.searchArray,
                columnsSelected: vm.columnsSelected,
                constantFilters: vm.getConstantFilters(),
                title: vm.queryDetails.resource.resourceName.get(),
                fileName: vm.queryDetails.resource.resourceName.get() + " " + new Date().toLocaleString(),
                headers: { "X-Requested-Type": type, "X-Page-Size": defaults.pageSize || "Letter", "X-Table-Striped": defaults.tableStriped != undefined ? defaults.tableStriped : true, "X-Page-Orientation": defaults.pageOrientation || "Landscape" }
            };

            switch (type) {
                case "pdf":
                    options.contentType = "application/pdf";
                    break;

                case "xls":
                    options.contentType = "application/vnd.ms-excel";
                    break;

                // add more types of download
            }

            vm.queryDetails.resource.getFile(options);
        };

        function getMembersSelected() {
            var columns = [];
            vm.columnsSelected.forEach(function (columnSelected) {
                return vm.resourceMembers.forEach(function (resourceMember) {
                    if ((resourceMember.display || getDisplay(resourceMember.name)) == columnSelected) columns.push(resourceMember);
                });
            });
            return columns;
        }

        vm.getConstantFilters = function () {
            var filters = [];
            if (vm.pager.getConstantFilters()) filters = filters.concat(vm.pager.getConstantFilters());
            if (vm.queryDetails.sort) filters = filters.concat(vm.queryDetails.sort);
            return filters;
        };

        function checkPermissions() {
            if (vm.hasPermissions.get()) {
                if (!vm.hasAllPermission.get()) {
                    if (!vm.hasAddPermission.get()) delete vm.componentConstruction.add;
                    if (!vm.hasEditPermission.get()) delete vm.componentConstruction.edit;
                    if (!vm.hasRemovePermission.get()) delete vm.componentConstruction.remove;
                    if (!vm.hasXlsSheetPermission.get()) vm.componentConstruction.canDownloadXlsSheet = false;
                    if (!vm.hasPdfPermission.get()) vm.componentConstruction.canDownloadPdf = false;
                }
            }
        }

        // =======================================================================================================================================================================
    };

    var component = {
        //templateUrl: 'dist/shared/components/entifixTable/entifixTable.html',
        template: '<br/> \
                    <div ng-class="{\'whirl double-up whirlback\': bindCtrl.isLoading.get() || bindCtrl.isChangingView}"> \
                        <md-card md-whiteframe="4" ng-if="bindCtrl.canSearch.get()" layout-padding layout="column"> \
                            <div ng-if="bindCtrl.isMovement.get()"> \
                                <div layout-xs="column" layout-gt-xs="column" layout-gt-sm="row" flex> \
                                    <div layout-xs="column" layout-gt-xs="row" flex> \
                                        <div flex> \
                                            <entifix-date-time-picker value-model="bindCtrl.startDate" component-construction="bindCtrl.startDateCC" on-change="bindCtrl.onChangeDateStart(value)"></entifix-date-time-picker> \
                                        </div> \
                                        <div flex> \
                                            <entifix-date-time-picker value-model="bindCtrl.endDate" component-construction="bindCtrl.endDateCC" on-change="bindCtrl.onChangeDateEnd(value)"></entifix-date-time-picker> \
                                        </div> \
                                    </div> \
                                    <div layout-xs="column" layout-gt-xs="row" flex> \
                                        <div flex layout layout-align="center center"> \
                                            <md-button class="md-primary text-success" ng-click="bindCtrl.searchItemsDate()" ng-disabled="!bindCtrl.startDate || !bindCtrl.endDate"> \
                                                <md-icon class="material-icons">{{bindCtrl.searchIcon.get()}}</md-icon> &nbsp;{{bindCtrl.searchText.get()}} \
                                            </md-button> \
                                        </div> \
                                        <div flex layout layout-align="center center"> \
                                            <entifix-checkbox-switch value-model="bindCtrl.notApplied" component-construction="bindCtrl.notAppliedCC" on-change="bindCtrl.onChangeNotApplied(value)"></entifix-checkbox-switch> \
                                        </div> \
                                    </div> \
                                </div> \
                            </div> \
                            <div layout-xs="column" layout-gt-xs="column" layout-gt-sm="row" flex ng-if="bindCtrl.customSearch"> \
                                <div layout-xs="column" layout-gt-xs="row" flex> \
                                    <div flex> \
                                        <md-input-container class="md-block"> \
                                            <label>{{bindCtrl.columnsText.get()}}</label> \
                                            <md-select \
                                                ng-model="bindCtrl.columnToSearch" \
                                                aria-label="{{bindCtrl.columnsText.get()}}" \
                                                ng-change="bindCtrl.onChangeColumn()"> \
                                                <md-option ng-repeat="item in bindCtrl.resourceMembers" ng-value="item">{{item.display}}</md-option> \
                                            </md-select> \
                                        </md-input-container> \
                                    </div> \
                                    <div flex> \
                                        <md-input-container class="md-block"> \
                                            <label>{{bindCtrl.operatorsText.get()}}</label> \
                                            <md-select \
                                                ng-model="bindCtrl.operator" \
                                                aria-label="{{bindCtrl.operatorsText.get()}}"> \
                                                <md-option ng-repeat="item in bindCtrl.operators" ng-value="item">{{item.display}}</md-option> \
                                            </md-select> \
                                        </md-input-container> \
                                    </div> \
                                </div> \
                                <div layout-sm="column" layout-gt-sm="row" flex> \
                                    <div flex> \
                                        <div ng-if="!bindCtrl.columnToSearch || bindCtrl.columnToSearch.type == \'text\' || bindCtrl.columnToSearch.type == \'entity\' || bindCtrl.columnToSearch.type == \'number\'" flex> \
                                            <entifix-input value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchCC"></entifix-input> \
                                        </div> \
                                        <div ng-if="bindCtrl.columnToSearch.type == \'date\'" flex> \
                                            <entifix-date-time-picker value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchCC"></entifix-date-time-picker> \
                                        </div> \
                                        <div ng-if="bindCtrl.columnToSearch.type == \'datetime\'" flex> \
                                            <entifix-date-time-picker value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchDTCC"></entifix-date-time-picker> \
                                        </div> \
                                        <div ng-if="bindCtrl.columnToSearch.type == \'time\'" flex> \
                                            <entifix-date-time-picker value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchTCC"></entifix-date-time-picker> \
                                        </div> \
                                        <div ng-if="bindCtrl.columnToSearch.type == \'enum\'" flex> \
                                            <entifix-autocomplete value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchCC" query-details="bindCtrl.valueToSearchQD" component-binding-out="bindCtrl.valueToSearchE"></entifix-autocomplete> \
                                        </div> \
                                        <div ng-if="bindCtrl.columnToSearch.type == \'boolean\'" flex> \
                                            <entifix-select value-model="bindCtrl.valueToSearch" component-construction="bindCtrl.valueToSearchCC" component-binding-out="bindCtrl.valueToSearchE"></entifix-select> \
                                        </div> \
                                    </div> \
                                    <div flex layout layout-align="center center"> \
                                        <md-button class="md-primary text-success" ng-click="bindCtrl.addChip()" ng-disabled="!bindCtrl.columnToSearch || !bindCtrl.operator || !bindCtrl.valueToSearch"> \
                                            <md-icon class="material-icons">{{bindCtrl.searchIcon.get()}}</md-icon> &nbsp;{{bindCtrl.addFilterText.get()}} \
                                        </md-button> \
                                    </div> \
                                </div> \
                            </div> \
                            <div layout-xs="column" layout-gt-xs="column" layout-gt-sm="row" flex> \
                                <div layout-xs="column" layout-gt-xs="row" flex-xs="100" flex-gt-sm="75"> \
                                    <div flex ng-if="!bindCtrl.customSearch"> \
                                        <md-input-container class="md-block"> \
                                            <label>{{bindCtrl.searchText.get()}}</label> \
                                            <input type="text" ng-model="bindCtrl.textBoxSearchValue" ng-keypress="bindCtrl.keypressTextBoxSearch($event)" ng-change="bindCtrl.onChangeSearch()"> \
                                        </md-input-container> \
                                    </div> \
                                    <div flex ng-if="bindCtrl.customSearch"> \
                                        <entifix-chip value-model="bindCtrl.textBoxSearchValueChips" component-construction="bindCtrl.chipsCC"></entifix-chip> \
                                    </div> \
                                </div> \
                                <div layout-xs="column" layout-gt-xs="row" flex-xs="100" flex-gt-sm="25" ng-if="bindCtrl.allowCustomSearch.get()"> \
                                    <div flex layout layout-align="center center"> \
                                        <div flex layout layout-align="center center"> \
                                            <entifix-checkbox-switch value-model="bindCtrl.customSearch" component-construction="bindCtrl.customSearchCC" on-change="bindCtrl.onChangeSwitch(v)"></entifix-checkbox-switch> \
                                        </div> \
                                    </div> \
                                </div> \
                            </div> \
                        </md-card> \
                        <div layout="column"> \
                            <md-card md-whiteframe="4"> \
                                <md-content layout-padding> \
                                    <div layout="column"> \
                                        <div flex layout-align="end center"> \
                                            <section layout-xs="column" layout="row" layout-align="end center"> \
                                                <div> \
                                                    <md-button class="md-primary text-success" ng-click="bindCtrl.addElement()" ng-disabled="!(bindCtrl.canAdd.get() && !bindCtrl.multipleAddOptions.get())" ng-if="bindCtrl.componentConstruction.add"> \
                                                        <md-icon class="material-icons">{{bindCtrl.addIcon.get()}}</md-icon> &nbsp;{{bindCtrl.addText.get()}} \
                                                    </md-button> \
                                                    <md-button class="md-warn text-danger" ng-click="bindCtrl.removeElement()" ng-disabled="!(bindCtrl.canRemove.get() && !bindCtrl.multipleRemoveOptions.get())"  ng-if="bindCtrl.componentConstruction.remove"> \
                                                        <md-icon class="material-icons">{{bindCtrl.removeIcon.get()}}</md-icon> &nbsp;{{bindCtrl.removeText.get()}} \
                                                    </md-button> \
                                                    <md-button class="md-accent text-warning" ng-click="bindCtrl.editElement()" ng-disabled="!(bindCtrl.canEdit.get() && !bindCtrl.multipleEditOptions.get())" ng-if="bindCtrl.componentConstruction.edit"> \
                                                        <md-icon class="material-icons">{{bindCtrl.editIcon.get()}}</md-icon> &nbsp;{{bindCtrl.editText.get()}} \
                                                    </md-button> \
                                                    <md-menu md-position-mode="target-right target" ng-click="bindCtrl.openXlsSheetMenu($mdMenu, $event)" ng-if="bindCtrl.canDownloadXlsSheet.get()"> \
                                                        <md-button class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.ds()"> \
                                                            <md-tooltip>{{bindCtrl.xlsSheetText.get()}}</md-tooltip> \
                                                            <md-icon class="material-icons">{{bindCtrl.xlsSheetIcon.get()}}</md-icon> \
                                                        </md-button> \
                                                        <md-menu-content> \
                                                            <md-menu-item> \
                                                                <md-button aria-label="" ng-click="bindCtrl.downloadFileAllPages(\'xls\')"> \
                                                                    <md-tooltip>{{bindCtrl.allPagesText.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">filter_none</md-icon>{{bindCtrl.allPagesText.get()}} \
                                                                </md-button> \
                                                            </md-menu-item> \
                                                            <md-menu-divider></md-menu-divider> \
                                                            <md-menu-item> \
                                                                <md-button aria-label="" ng-click="bindCtrl.downloadFileSimplePage(\'xls\')"> \
                                                                    <md-tooltip>{{bindCtrl.currentPageText.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">filter_1</md-icon>{{bindCtrl.currentPageText.get()}} \
                                                                </md-button> \
                                                            </md-menu-item> \
                                                        </md-menu-content> \
                                                    </md-menu> \
                                                    <md-menu md-position-mode="target-right target" ng-click="bindCtrl.openPdfMenu($mdMenu, $event)" ng-if="bindCtrl.canDownloadPdf.get()"> \
                                                        <md-button class="md-primary md-warn text-danger md-fab md-mini" ng-click="bindCtrl.ds()"> \
                                                            <md-tooltip>{{bindCtrl.pdfText.get()}}</md-tooltip> \
                                                            <md-icon class="material-icons">{{bindCtrl.pdfIcon.get()}}</md-icon> \
                                                        </md-button> \
                                                        <md-menu-content> \
                                                            <md-menu-item> \
                                                                <md-button aria-label="" ng-click="bindCtrl.downloadFileAllPages(\'pdf\')"> \
                                                                    <md-tooltip>{{bindCtrl.allPagesText.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">filter_none</md-icon>{{bindCtrl.allPagesText.get()}} \
                                                                </md-button> \
                                                            </md-menu-item> \
                                                            <md-menu-divider></md-menu-divider> \
                                                            <md-menu-item> \
                                                                <md-button aria-label="" ng-click="bindCtrl.downloadFileSimplePage(\'pdf\')()"> \
                                                                    <md-tooltip>{{bindCtrl.currentPageText.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">filter_1</md-icon>{{bindCtrl.currentPageText.get()}} \
                                                                </md-button> \
                                                            </md-menu-item> \
                                                        </md-menu-content> \
                                                    </md-menu> \
                                                </div> \
                                            </section> \
                                        </div> \
                                        <div class="md-table-head" layout> \
                                            <div flex flex-gt-md="65" layout layout-align="start center" ng-if="bindCtrl.selectColumns.get()"> \
                                                <md-input-container> \
                                                    <label>{{bindCtrl.columnsText.get()}}</label> \
                                                    <md-select \
                                                        ng-model="bindCtrl.columnsSelected" \
                                                        multiple \
                                                        aria-label="{{bindCtrl.columnsText.get()}}" \
                                                        ng-change="bindCtrl.reloadAllSelected()"> \
                                                        <md-option ng-click="bindCtrl.selectAllItems()">{{bindCtrl.selectAllText.get()}}</md-option> \
                                                        <md-option ng-repeat="item in bindCtrl.resourceMembers">{{item.display}}</md-option> \
                                                    </md-select> \
                                                </md-input-container> \
                                            </div> \
                                            <div flex layout layout-align="end center"> \
                                                <md-input-container ng-show="bindCtrl.pager.showPageControls.get()"> \
                                                    <md-select \
                                                        ng-model="bindCtrl.pager.size" \
                                                        ng-change="bindCtrl.onChangePageSize()" \
                                                        aria-label="Page Controls"> \
                                                        <md-option ng-repeat="optionSize in bindCtrl.pager.pageSizes" ng-value="optionSize">{{optionSize}}</md-option> \
                                                    </md-select> \
                                                </md-input-container> \
                                            </div> \
                                        </div> \
                                        <div class="md-table-container"> \
                                            <div compile="bindCtrl.stringhtmlcomponent"></div> \
                                        </div> \
                                        <br/> \
                                        <div layout-xs="column" layout-md="row" layout-lg="row" layout-xl="row"> \
                                            <div flex flex-md="35" flex-md="35" flex-lg="30" flex-xl="35"> \
                                                <h5>{{bindCtrl.pager.getDescriptionText()}}</h5> \
                                            </div> \
                                            <div flex layout layout-align="end center"> \
                                                <grid-pagination \
                                                    max-size="10" \
                                                    boundary-links="true" \
                                                    class="pagination mdl-shadow--2dp" \
                                                    ng-if="bindCtrl.pager.totalData > bindCtrl.pager.size" \
                                                    total-items="bindCtrl.pager.totalData" \
                                                    ng-model="bindCtrl.pager.page" \
                                                    ng-change="bindCtrl.onChangePage()" \
                                                    items-per-page="bindCtrl.pager.size"> \
                                                </grid-pagination> \
                                            </div> \
                                        </div> \
                                    </div> \
                                </md-content> \
                            </md-card> \
                        </div> \
                    </div>',
        controller: componentController,
        controllerAs: 'bindCtrl',
        bindings: {
            componentConstruction: '<',
            componentBehavior: '<',
            componentBindingOut: '=',
            queryDetails: '='
        }

        //Register component 
    };module.component('entifixTable', component);
})();
'use strict';

(function () {
    'use strict';

    angular.module('entifix-js').controller('EntifixDownloadReportSettingsController', controller);

    controller.$inject = ['$mdDialog', 'EntifixNotification'];

    function controller($mdDialog, EntifixNotification) {
        var vm = this;

        // Properties & fields
        // ==============================================================================================================================================================

        // ==============================================================================================================================================================


        // Methods
        // ==============================================================================================================================================================
        function activate() {
            setDefaults();
            createComponents();
        };

        function createComponents() {
            vm.tableStripedComponentConstruction = {
                title: { text: 'Tabla Rayada' },
                isSwitch: true
            };

            vm.pageSizeComponentConstruction = {
                title: { text: 'Tamaño de la hoja' },
                collection: { elements: [{ Display: 'Letter', Value: 'Letter' }, { Display: 'Legal', Value: 'Legal' }, { Display: 'A0', Value: 'A0' }, { Display: 'A1', Value: 'A1' }, { Display: 'A2', Value: 'A2' }, { Display: 'A3', Value: 'A3' }, { Display: 'A4', Value: 'A4' }] }
            };

            vm.pageOrientationComponentConstruction = {
                title: { text: 'Orientación de la hoja' },
                collection: { elements: [{ Display: 'Landscape', Value: 'Landscape' }, { Display: 'Portrait', Value: 'Portrait' }] }
            };
        }

        function setDefaults() {
            vm.header = "Configuración del reporte";
            vm.entity = {};
            vm.entity.tableStriped = true;
            vm.entity.pageSize = "Letter";
            vm.entity.pageOrientation = "Landscape";
        }

        vm.cancel = function () {
            $mdDialog.cancel(vm.entity);
        };

        vm.ok = function () {
            if (vm.entity.tableStriped != undefined && vm.entity.pageSize != undefined && vm.entity.pageOrientation != undefined) {
                $mdDialog.hide(vm.entity);
            } else {
                EntifixNotification.error({ "body": "Por favor, seleccione todas las opciones.", "isToast": true });
            }
        };

        activate();
        // ==============================================================================================================================================================
    };

    // FACTORY ================================================================================================================================================================================
    // ========================================================================================================================================================================================
    // =========================================================================================================================================================================================
    angular.module('entifix-js').factory('EntifixDownloadReportSettings', downloadReportSettingsFactory);

    downloadReportSettingsFactory.$inject = ['$mdDialog'];

    function downloadReportSettingsFactory($mdDialog) {
        var downloadReportSettingsController = function downloadReportSettingsController() {
            var vm = this;

            // Properties and Fields _______________________________________________________________________________________________________________________________________________________            
            //==============================================================================================================================================================================

            //Fields ===>>>>:


            //Properties ===>>>>:


            //==============================================================================================================================================================================

            // Methods _____________________________________________________________________________________________________________________________________________________________________
            //==============================================================================================================================================================================
            vm.chooseDownloadReportSettings = function (callbackSuccess, callbackError) {
                $mdDialog.show({
                    //templateUrl: 'dist/shared/controls/entifixDownloadReportSettings/entifixDownloadReportSettings.html',
                    template: '<md-dialog aria-label="Configuración del reporte" class="md-sm"> \
                                                    <md-toolbar md-colors="{background: \'default-primary-100\'}"> \
                                                        <div class="md-toolbar-tools" layout> \
                                                            <div flex layout layout-align="start center"> \
                                                                <div class="md-icon-button"><md-icon class="material-icons">chrome_reader_mode</md-icon></div> \
                                                                <h2>&nbsp {{vm.header}}</h2> \
                                                            </div> \
                                                        </div> \
                                                    </md-toolbar> \
                                                    <div> \
                                                        <md-dialog-content> \
                                                            <md-content layout-padding> \
                                                                <div flex> \
                                                                    <entifix-select  \
                                                                        value-model="vm.entity.pageSize"  \
                                                                        show-editable-fields="true" \
                                                                        component-construction="vm.pageSizeComponentConstruction"  \
                                                                        component-binding-out="vm.pageSizeInstance"> \
                                                                    </entifix-select> \
                                                                </div> \
                                                                <div flex> \
                                                                    <entifix-checkbox-switch  \
                                                                        value-model="vm.entity.tableStriped"  \
                                                                        show-editable-fields="true" \
                                                                        component-construction="vm.tableStripedComponentConstruction"> \
                                                                    </entifix-checkbox-switch> \
                                                                </div> \
                                                                <div flex> \
                                                                    <entifix-select  \
                                                                        value-model="vm.entity.pageOrientation"  \
                                                                        show-editable-fields="true" \
                                                                        component-construction="vm.pageOrientationComponentConstruction"  \
                                                                        component-binding-out="vm.pageOrientationInstance"> \
                                                                    </entifix-select> \
                                                                </div> \
                                                            </md-content> \
                                                        </md-dialog-content> \
                                                        <md-dialog-actions layout="row"> \
                                                            <md-button ng-click="vm.cancel()"> \
                                                                <md-icon class="material-icons">clear</md-icon> Cancelar \
                                                            </md-button> \
                                                            <md-button  ng-click="vm.ok()"> \
                                                                <md-icon class="material-icons">done</md-icon> Ok \
                                                            </md-button> \
                                                        </md-dialog-actions> \
                                                    </div> \
                                                </md-dialog>',
                    controller: 'EntifixDownloadReportSettingsController',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    fullscreen: true,
                    controllerAs: 'vm'
                }).then(function (result) {
                    if (callbackSuccess) callbackSuccess(result);
                }, function (result) {
                    if (callbackError) callbackError(result);
                });
            };

            //==============================================================================================================================================================================
        };

        return downloadReportSettingsController;
    };
})();
'use strict';

(function () {
    'use strict';

    var entifixEnvironmentModule = angular.module('entifix-js');

    // CONTROLLER ================================================================================================================================================================================
    // ========================================================================================================================================================================================
    // =========================================================================================================================================================================================
    entifixEnvironmentModule.controller('EntifixEntityModalController', controller);

    controller.$inject = ['$mdDialog', 'EntifixNotifier', '$timeout', 'BaseComponentFunctions', 'EntifixNotification', 'EntifixSession', '$rootScope', 'componentConstruction', 'componentBehavior', 'componentBindingOut', 'queryDetails'];

    function controller($mdDialog, EntifixNotifier, $timeout, BaseComponentFunctions, EntifixNotification, EntifixSession, $rootScope, componentConstruction, componentBehavior, componentBindingOut, queryDetails) {
        var vm = this;

        vm.componentConstruction = componentConstruction();
        vm.componentBehavior = componentBehavior();
        vm.componentBindingOut = componentBindingOut();
        vm.queryDetails = queryDetails();

        // Properties & Fields ===================================================================================================================================================

        //Fields
        var _isloading = false;
        var _notifier = null;

        var _statesForm = {
            edit: true,
            view: false
        };

        vm.connectionComponent = {};
        vm.connectionComponent.state = _statesForm.edit;

        // Main

        vm.entity = {
            get: function get() {
                if (vm.connectionComponent) return vm.connectionComponent.entity;
                return null;
            },
            set: function set(value) {
                if (vm.connectionComponent) {
                    var oldValue = vm.connectionComponent.entity;
                    vm.connectionComponent.entity = value;

                    if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onChangeEntity) vm.componentBehavior.events.onChangeEntity(oldValue, value);
                }
            }
        };

        vm.isLoading = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isLoading.get();
                return false;
            }
        };

        vm.isSaving = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isSaving.get();
                return false;
            }
        };

        vm.isDeleting = {
            get: function get() {
                if (vm.queryDetails && vm.queryDetails.resource) return vm.queryDetails.resource.isDeleting.get();
                return false;
            }
        };

        vm.onTask = {
            get: function get() {
                var response = vm.isLoading.get() || vm.isSaving.get() || vm.isDeleting.get();

                return response;
            }
        };

        vm.size = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.size) return vm.componentConstruction.size;

                //Default value
                return 'md-md';
            }
        };

        vm.title = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.title) {
                    if (vm.componentConstruction.title.entityName) {
                        if (!vm.connectionComponent.showEditableFields.get()) return 'Editar ' + vm.componentConstruction.title.entityName;else return 'Agregar ' + vm.componentConstruction.title.entityName;
                    }

                    if (vm.componentConstruction.title.entityProperty && vm.entity.get()) {
                        if (!vm.connectionComponent.showEditableFields.get()) return 'Editar ' + vm.entity.get()[vm.componentConstruction.title.entityProperty];else return 'Agregar ' + vm.entity.get()[vm.componentConstruction.title.entityProperty];
                    }

                    if (vm.componentConstruction.title.getter) return vm.componentConstruction.title.getter();

                    if (vm.componentConstruction.title.text) return vm.componentConstruction.title.text;
                }

                //Default value
                if (!vm.connectionComponent.showEditableFields.get()) return 'Editar Registro';
                return 'Agregar Registro';
            }
        };

        vm.icon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.icon) {
                    if (vm.componentConstruction.icon.text) return vm.componentConstruction.icon.text;
                }

                //Default value
                return 'menu';
            }
        };

        // cancel button
        vm.canCancel = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.cancelIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.componentConstruction.cancel.icon) return vm.componentConstruction.cancel.icon;

                //Default value
                return 'clear';
            }
        };

        vm.cancelText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.componentConstruction.cancel.text) {
                    if (vm.componentConstruction.cancel.text.getter) return vm.componentConstruction.cancel.text.getter();else if (vm.componentConstruction.cancel.text) return vm.componentConstruction.cancel.text;
                };

                //Default value
                return 'Cancelar';
            }
        };

        vm.cancelHref = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.cancel && vm.componentConstruction.cancel.href) {
                    if (vm.componentConstruction.cancel.href instanceof Object && vm.componentConstruction.cancel.href.getter) return vm.componentConstruction.cancel.href.getter(vm.entity.get(), vm.queryDetails.resource);
                    return vm.componentConstruction.cancel.href;
                }

                //Default value
                return null;
            }
        };

        // ok button
        vm.canOk = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.connectionComponent.state == _statesForm.view) return true;

                //Default value
                return false;
            }
        };

        vm.okIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.componentConstruction.ok.icon) return vm.componentConstruction.ok.icon;

                //Default value
                return 'done';
            }
        };

        vm.okText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.ok && vm.componentConstruction.ok.text) return '' + vm.componentConstruction.ok.text;

                //Default value
                return 'Aceptar';
            }
        };

        // edit button
        vm.canEdit = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && vm.connectionComponent.state == _statesForm.view) return true;

                //Default value
                return false;
            }
        };

        vm.editIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.icon) return vm.componentConstruction.edit.icon;

                //Default value
                return 'create';
            }
        };

        vm.editText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit) {
                    if (vm.componentConstruction.edit.text instanceof Object && vm.componentConstruction.edit.text.getter) return vm.componentConstruction.edit.text.getter();else if (vm.componentConstruction.edit.text) return vm.componentConstruction.edit.text;
                };

                //Default value
                return 'Editar';
            }
        };

        vm.editHref = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.edit && vm.componentConstruction.edit.href) {
                    if (vm.componentConstruction.edit.href instanceof Object && vm.componentConstruction.edit.href.getter) return vm.componentConstruction.edit.href.getter(vm.entity.get(), vm.queryDetails.resource);
                    return vm.componentConstruction.edit.href;
                }

                //Default value
                return null;
            }
        };

        // save button
        vm.canSave = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.saveIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.componentConstruction.save.icon) return '' + vm.componentConstruction.save.icon;

                //Default value
                return 'save';
            }
        };

        vm.saveText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save) {
                    if (vm.componentConstruction.save.text instanceof Object && vm.componentConstruction.save.text.getter) return vm.componentConstruction.save.text.getter();else if (vm.componentConstruction.save.text) return vm.componentConstruction.save.text;
                };

                //Default value
                return 'Guardar';
            }
        };

        vm.saveHref = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.save && vm.componentConstruction.save.href) {
                    if (vm.componentConstruction.save.href instanceof Object && vm.componentConstruction.save.href.getter) return vm.componentConstruction.save.href.getter(vm.entity.get(), vm.queryDetails.resource);
                    return vm.componentConstruction.save.href;
                }

                //Default value
                return null;
            }
        };

        // remove button
        vm.canRemove = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && vm.connectionComponent.state == _statesForm.edit) return true;

                //Default value
                return false;
            }
        };

        vm.removeIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.icon) return vm.componentConstruction.remove.icon;

                //Default value
                return 'delete';
            }
        };

        vm.removeText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove) {
                    if (vm.componentConstruction.remove.text instanceof Object && vm.componentConstruction.remove.text.getter) return vm.componentConstruction.remove.text.getter();else if (vm.componentConstruction.remove.text) return vm.componentConstruction.remove.text;
                };

                //Default value
                return 'Eliminar';
            }
        };

        vm.removeHref = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.remove && vm.componentConstruction.remove.href) {
                    if (vm.componentConstruction.remove.href instanceof Object && vm.componentConstruction.remove.href.getter) return vm.componentConstruction.remove.href.getter(vm.entity.get(), vm.queryDetails.resource);
                    return vm.componentConstruction.remove.href;
                }

                //Default value
                return null;
            }
        };

        //process button
        vm.canProcess = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.connectionComponent.state == _statesForm.view && vm.queryDetails && vm.queryDetails.resource && vm.entity.get() && !vm.queryDetails.resource.isNewEntity(vm.entity.get()) && !vm.queryDetails.resource.isProcessedEntity(vm.entity.get())) return true;

                //Default value
                return false;
            }
        };

        vm.processIcon = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.componentConstruction.process.icon) return vm.componentConstruction.process.icon;

                //Default value
                return 'done_all';
            }
        };

        vm.processText = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.process && vm.componentConstruction.process.text) return '' + vm.componentConstruction.process.text;

                //Default value
                return 'Procesar';
            }
        };

        vm.allowActions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.allowActions != null) return vm.componentConstruction.allowActions;

                //Default value
                return true;
            }
        };

        vm.saveTooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.saveTooltip) return vm.componentConstruction.saveTooltip;

                //Default value
                return 'Todos los campos obligatorios deben estar correctos';
            }
        };

        vm.historyTooltip = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.historyTooltip) return vm.componentConstruction.historyTooltip;

                //Default value
                return 'Mostrar Bitácora';
            }
        };

        var _canViewHistory = true;
        vm.canViewHistory = {
            get: function get() {
                if (_canViewHistory) return true;
                return false;
            },

            set: function set(value) {
                _canViewHistory = value;
            }
        };

        vm.history = {
            get: function get() {
                return $rootScope.showHistory;
            },
            set: function set() {
                $rootScope.showHistory = !$rootScope.showHistory;
            }
        };

        vm.hasPermissions = {
            get: function get() {
                if (vm.componentConstruction && vm.componentConstruction.permissions != null) return true;

                //Default value
                return false;
            }
        };

        vm.hasAllPermission = {
            get: function get() {
                if (vm.componentConstruction.permissions.all != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.all)) return true;

                //Default value
                return false;
            }
        };

        vm.hasSavePermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.save || vm.componentConstruction.permissions.save != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.save)) return true;

                //Default value
                return false;
            }
        };

        vm.hasEditPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.edit || vm.componentConstruction.permissions.edit != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.edit)) return true;

                //Default value
                return false;
            }
        };

        vm.hasRemovePermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.remove || vm.componentConstruction.permissions.remove != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.remove)) return true;

                //Default value
                return false;
            }
        };

        vm.hasProcessPermission = {
            get: function get() {
                if (!vm.componentConstruction.permissions.process || vm.componentConstruction.permissions.process != null && EntifixSession.checkPermissions(vm.componentConstruction.permissions.process)) return true;

                //Default value
                return false;
            }

            // =======================================================================================================================================================================

            // Methods ===============================================================================================================================================================

        };function activate() {
            setdefaults();
            createconnectioncomponent();

            if (vm.componentConstruction) createDynamicComponent();

            checkoutputs();
            checkPermissions();
        };

        function setdefaults() {
            _notifier = new EntifixNotifier(vm.queryDetails.resource);
        };

        function createconnectioncomponent() {
            // Connection Component Properties __________________________________________________________________________________________
            // ==========================================================================================================================

            vm.connectionComponent.IsCreating = true;

            if (vm.componentBindingOut.object) {
                vm.connectionComponent.state = _statesForm.view;
                vm.entity.set(vm.componentBindingOut.object);
            } else vm.entity.set({});

            vm.connectionComponent.entity = vm.entity.get();
            if (vm.queryDetails.resource) {
                vm.connectionComponent.resource = vm.queryDetails.resource;
            }

            vm.connectionComponent.showEditableFields = {
                get: function get() {
                    return vm.connectionComponent.state == _statesForm.edit;
                },
                set: function set(value) {
                    if (value == true) vm.connectionComponent.state = _statesForm.edit;
                    if (value == false) vm.connectionComponent.state = _statesForm.view;
                }
            };

            vm.connectionComponent.state = vm.connectionComponent.showEditableFields.get();
            vm.connectionComponent.isSaving = vm.isSaving;
            vm.connectionComponent.history = vm.history;
            vm.connectionComponent.canViewHistory = vm.canViewHistory;

            vm.connectionComponent.canCancel = { get: function get() {
                    return vm.canCancel.get();
                } };
            vm.connectionComponent.canRemove = { get: function get() {
                    return vm.canRemove.get();
                } };
            vm.connectionComponent.canSave = { get: function get() {
                    return vm.canSave.get();
                } };
            vm.connectionComponent.canEdit = { get: function get() {
                    return vm.canEdit.get();
                } };
            vm.connectionComponent.canOk = { get: function get() {
                    return vm.canOk.get();
                } };
            vm.connectionComponent.canProcess = { get: function get() {
                    return vm.canProcess.get();
                } };

            vm.connectionComponent.cancelText = { get: function get() {
                    return vm.cancelText.get();
                } };
            vm.connectionComponent.removeText = { get: function get() {
                    return vm.removeText.get();
                } };
            vm.connectionComponent.saveText = { get: function get() {
                    return vm.saveText.get();
                } };
            vm.connectionComponent.editText = { get: function get() {
                    return vm.editText.get();
                } };
            vm.connectionComponent.okText = { get: function get() {
                    return vm.okText.get();
                } };
            vm.connectionComponent.processText = { get: function get() {
                    return vm.processText.get();
                } };

            vm.connectionComponent.cancelIcon = { get: function get() {
                    return vm.cancelIcon.get();
                } };
            vm.connectionComponent.removeIcon = { get: function get() {
                    return vm.removeIcon.get();
                } };
            vm.connectionComponent.saveIcon = { get: function get() {
                    return vm.saveIcon.get();
                } };
            vm.connectionComponent.editIcon = { get: function get() {
                    return vm.editIcon.get();
                } };
            vm.connectionComponent.okIcon = { get: function get() {
                    return vm.okIcon.get();
                } };
            vm.connectionComponent.processIcon = { get: function get() {
                    return vm.processIcon.get();
                } };

            vm.connectionComponent.cancel = { invoke: function invoke() {
                    vm.cancel();
                } };
            vm.connectionComponent.remove = { invoke: function invoke() {
                    vm.remove();
                } };
            vm.connectionComponent.edit = { invoke: function invoke() {
                    vm.edit();
                } };
            vm.connectionComponent.ok = { invoke: function invoke() {
                    vm.ok();
                } };
            vm.connectionComponent.save = { invoke: function invoke() {
                    vm.save();
                } };
            vm.connectionComponent.process = { invoke: function invoke() {
                    vm.process();
                } };

            vm.connectionComponent.onTask = { get: function get() {
                    return vm.onTask.get();
                } };
            vm.connectionComponent.saveTooltip = { get: function get() {
                    return vm.saveTooltip.get();
                } };
            vm.connectionComponent.entityForm = { valid: function valid() {
                    return vm.entityForm.$valid;
                } };

            vm.connectionComponent.evaluateErrors = {
                get: function get(name) {
                    return evaluateErrors(name);
                }
            };

            function evaluateErrors(property) {
                var errors = {};
                for (var error in vm.entityForm.$error) {
                    var propertyValue = vm.entityForm.$error[error];

                    if (propertyValue instanceof Array) propertyValue.forEach(function (element) {
                        if (element.$name == property) errors[error] = true;
                    });
                }

                return errors;
            }

            // ==========================================================================================================================


            // Connection Component Methods _____________________________________________________________________________________________
            // ==========================================================================================================================

            var searchForm = function searchForm() {
                if (vm.entityForm) vm.connectionComponent.entityForm = vm.entityForm;else $timeout(searchForm, 200);
            };

            searchForm();
        };

        function createDynamicComponent() {
            var res = BaseComponentFunctions.CreateStringHtmlComponentAndBindings(vm.componentConstruction, 'bindCtrl.connectionComponent.objectBindings');
            vm.stringhtmlcomponent = res.stringhtml;
            vm.connectionComponent.objectBindings = res.objectbindings;
        };

        function checkoutputs() {
            vm.componentBindingOut = {
                showEditableFields: vm.connectionComponent.showEditableFields,
                entity: vm.entity,
                recreateDynamicComponent: createDynamicComponent
            };

            if (vm.componentBehavior && vm.componentBehavior.afterConstruction) vm.componentBehavior.afterConstruction();
        };

        vm.cancel = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onCancel) vm.componentBehavior.events.onCancel();

            if (vm.componentConstruction.cancel.customAction) vm.componentConstruction.cancel.customAction(defaultOk, vm.entity.get());else defaultCancel();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onCanceled) vm.componentBehavior.events.onCanceled();
        };

        vm.ok = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onOk) vm.componentBehavior.events.onOk();

            if (vm.componentConstruction.ok.customAction) vm.componentConstruction.ok.customAction(defaultOk, vm.entity.get());else defaultOk();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onAfterOk) vm.componentBehavior.events.onAfterOk();
        };

        vm.edit = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdit) vm.componentBehavior.events.onEdit();

            if (vm.componentConstruction.edit.customAction) vm.componentConstruction.edit.customAction(vm.entity.get(), defaultOk);else defaultEdit();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onEdited) vm.componentBehavior.events.onEdited();
        };

        vm.save = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSave) vm.componentBehavior.events.onSave(vm.entity.get());

            if (vm.componentConstruction.save.customAction) vm.componentConstruction.save.customAction(vm.entity.get(), defaultOk, setViewState);else defaultSave();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onSaved) vm.componentBehavior.events.onSaved();
        };

        vm.remove = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemove) vm.componentBehavior.events.onRemove();

            if (vm.componentConstruction.remove.customAction) vm.componentConstruction.remove.customAction(vm.entity.get(), defaultOk);else defaultRemove();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onRemoved) vm.componentBehavior.events.onRemoved();
        };

        vm.process = function () {
            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcess) vm.componentBehavior.events.onProcess();

            if (vm.componentConstruction.process.customAction) vm.componentConstruction.process.customAction(vm.entity.get(), defaultOk, setViewState);else defaultProcess();

            if (vm.componentBehavior && vm.componentBehavior.events && vm.componentBehavior.events.onProcessed) vm.componentBehavior.events.onProcessed();
        };

        function defaultCancel() {
            if (vm.queryDetails.resource.isNewEntity(vm.connectionComponent.entity)) $mdDialog.cancel();else {
                vm.connectionComponent.state = _statesForm.view;
                reloadEntity();
            }
        };

        function defaultOk() {
            $mdDialog.hide();
        };

        function defaultEdit() {
            vm.connectionComponent.state = _statesForm.edit;
        };

        function defaultSave() {
            vm.queryDetails.resource.saveEntity(vm.connectionComponent.entity, function (response, saveSuccess) {
                if (saveSuccess) {
                    if (response && response.data.data) vm.entity.set(response.data.data);
                    defaultOk();
                }
            });
        };

        function defaultProcess() {
            vm.connectionComponent.entity[vm.queryDetails.resource.getOpProperty.get()] = 'PROCESAR';
            defaultSave();
        };

        function defaultRemove() {
            EntifixNotification.confirm({
                "body": "Está seguro de eliminar el registro",
                "header": "Confirmación requerida",
                "actionConfirm": function actionConfirm() {
                    vm.queryDetails.resource.deleteEntity(vm.connectionComponent.entity, function () {
                        defaultOk();
                    });
                },
                "actionCancel": function actionCancel() {} });
        };

        vm.submit = function () {
            vm.save();
        };

        function reloadEntity() {
            if (vm.entity.get()) vm.queryDetails.resource.loadAsResource(vm.entity.get(), function (entityReloaded) {
                vm.entity.set(entityReloaded);
            });
        };

        function checkPermissions() {
            if (vm.hasPermissions.get()) {
                if (!vm.hasAllPermission.get()) {
                    if (!vm.hasSavePermission.get()) delete vm.componentConstruction.save;
                    if (!vm.hasEditPermission.get()) delete vm.componentConstruction.edit;
                    if (!vm.hasRemovePermission.get()) delete vm.componentConstruction.remove;
                    if (!vm.hasProcessPermission.get()) delete vm.componentConstruction.process;
                }
            }
        }

        // =======================================================================================================================================================================

        function setViewState(view, entity) {
            if (view) vm.connectionComponent.state = _statesForm.view;else vm.connectionComponent.state = _statesForm.edit;

            vm.entity.set(entity);
        }

        activate();
    };

    // FACTORY ================================================================================================================================================================================
    // ========================================================================================================================================================================================
    // =========================================================================================================================================================================================
    entifixEnvironmentModule.factory('EntifixEntityModal', entityModal);
    entityModal.$inject = ['$mdDialog'];

    function entityModal($mdDialog) {
        var entityModal = function entityModal(_componentConstruction, _componentBehavior, _componentBindingOut, _queryDetails) {
            var vm = this;

            // Properties and Fields _______________________________________________________________________________________________________________________________________________________            
            //==============================================================================================================================================================================

            //Fields ===>>>>:


            //Properties ===>>>>:


            //==============================================================================================================================================================================


            // Methods _____________________________________________________________________________________________________________________________________________________________________
            //==============================================================================================================================================================================
            vm.openModal = function (callback) {
                if (_componentConstruction && _componentConstruction.event) var event = _componentConstruction.event;

                if (_componentConstruction && _componentConstruction.clickOutsideToClose != null) var clickOutsideToClose = _componentConstruction.clickOutsideToClose;else var clickOutsideToClose = false;

                if (_componentConstruction && _componentConstruction.escapeToClose != null) var escapeToClose = _componentConstruction.escapeToClose;else var escapeToClose = true;

                if (_componentConstruction && _componentConstruction.fullscreen != null) var fullscreen = _componentConstruction.fullscreen;else var fullscreen = true;

                $mdDialog.show({
                    //templateUrl: 'dist/shared/controls/entifixEntityModal/entifixEntityModal.html',
                    template: '<md-dialog aria-label="{{bindCtrl.title.get()}}" ng-class="{\'whirl double-up whirlback\': bindCtrl.onTask.get() }" class="{{bindCtrl.size.get()}}"> \
                                                    <md-toolbar md-colors="{background:\'default-primary-500\'}"> \
                                                        <div class="md-toolbar-tools" layout> \
                                                            <div flex layout layout-align="start center"> \
                                                                <div class="md-icon-button"><md-icon class="material-icons">{{bindCtrl.icon.get()}}</md-icon></div> \
                                                                <h2>&nbsp{{bindCtrl.title.get()}}</h2> \
                                                            </div> \
                                                            <div flex layout layout-align="end center" ng-if="bindCtrl.canViewHistory.get()"> \
                                                                <md-button layout layout-align="end end" class="md-primary text-success md-fab md-mini" ng-click="bindCtrl.history.set()"> \
                                                                    <md-tooltip>{{bindCtrl.historyTooltip.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">history</md-icon> \
                                                                </md-button> \
                                                            </div> \
                                                        </div> \
                                                    </md-toolbar> \
                                                    <form name="bindCtrl.entityForm" novalidate ng-submit="bindCtrl.entityForm.$valid && bindCtrl.submit()" autocomplete="off"> \
                                                        <md-dialog-content> \
                                                            <md-content layout-padding> \
                                                                <div compile="bindCtrl.stringhtmlcomponent" flex="100"></div> \
                                                            </md-content> \
                                                        </md-dialog-content> \
                                                        <md-dialog-actions layout-xs="column" layout="row" layout-align="end center" ng-if="bindCtrl.allowActions.get()"> \
                                                            <div> \
                                                                <md-button ng-if="bindCtrl.canCancel.get()" ng-click="bindCtrl.cancel()" ng-disabled="bindCtrl.onTask.get()" ng-href="{{bindCtrl.cancelHref.get()}}"> \
                                                                    <md-icon class="material-icons">{{bindCtrl.cancelIcon.get()}}</md-icon>&nbsp;{{bindCtrl.cancelText.get()}} \
                                                                </md-button> \
                                                                <md-button class="md-warn" ng-if="bindCtrl.canRemove.get()" ng-click="bindCtrl.remove()" ng-disabled="bindCtrl.onTask.get()" ng-href="{{bindCtrl.removeHref.get()}}"> \
                                                                    <md-icon class="material-icons">{{bindCtrl.removeIcon.get()}}</md-icon>&nbsp;{{bindCtrl.removeText.get()}} \
                                                                </md-button> \
                                                                <md-button type="submit" class="md-primary" ng-if="bindCtrl.canSave.get()" ng-disabled="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid"> \
                                                                    <md-tooltip ng-if="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid">{{bindCtrl.saveTooltip.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">{{bindCtrl.saveIcon.get()}}</md-icon>&nbsp;{{bindCtrl.saveText.get()}} \
                                                                </md-button> \
                                                                <md-button class="md-accent" ng-if="bindCtrl.canEdit.get()" ng-click="bindCtrl.edit()" ng-disabled="bindCtrl.onTask.get()" ng-href="{{bindCtrl.editHref.get()}}"> \
                                                                    <md-icon class="material-icons">{{bindCtrl.editIcon.get()}}</md-icon>&nbsp;{{bindCtrl.editText.get()}} \
                                                                </md-button> \
                                                                <md-button ng-if="bindCtrl.canOk.get()" ng-click="bindCtrl.ok()" ng-disabled="bindCtrl.onTask.get()" ng-href="{{bindCtrl.okHref.get()}}"> \
                                                                    <md-icon class="material-icons">{{bindCtrl.okIcon.get()}}</md-icon>&nbsp;{{bindCtrl.okText.get()}} \
                                                                </md-button> \
                                                                <md-button class="md-primary" ng-if="bindCtrl.canProcess.get()" ng-click="bindCtrl.process()" ng-disabled="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid"> \
                                                                    <md-tooltip ng-if="bindCtrl.onTask.get() || !bindCtrl.entityForm.$valid">{{bindCtrl.saveTooltip.get()}}</md-tooltip> \
                                                                    <md-icon class="material-icons">{{bindCtrl.processIcon.get()}}</md-icon>&nbsp;{{bindCtrl.processText.get()}} \
                                                                </md-button> \
                                                            </div> \
                                                        </md-dialog-actions> \
                                                    </form> \
                                                </md-dialog>',
                    controller: 'EntifixEntityModalController',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: clickOutsideToClose,
                    escapeToClose: escapeToClose,
                    fullscreen: fullscreen,
                    controllerAs: 'bindCtrl',
                    multiple: true,
                    locals: {
                        componentConstruction: function componentConstruction() {
                            return _componentConstruction;
                        },
                        componentBehavior: function componentBehavior() {
                            return _componentBehavior;
                        },
                        componentBindingOut: function componentBindingOut() {
                            return _componentBindingOut;
                        },
                        queryDetails: function queryDetails() {
                            return _queryDetails;
                        }
                    }
                }).then(function (results) {
                    if (callback) callback(results);
                }, function () {});
            };

            //==============================================================================================================================================================================
        };

        return entityModal;
    };
})();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
    'use strict';

    angular.module('entifix-js').controller('EntifixSystemOwnerController', controller);

    controller.$inject = ['EntifixSession', 'EntifixResource', 'EntifixConfig', '$mdDialog', 'EntifixNotification', '$state'];

    function controller(EntifixSession, EntifixResource, EntifixConfig, $mdDialog, EntifixNotification, $state) {
        var vm = this;

        // Properties & fields
        // ==============================================================================================================================================================

        // ==============================================================================================================================================================


        // Methods
        // ==============================================================================================================================================================
        function activate() {
            setDefaults();
            createComponents();
        };

        function createComponents() {
            vm.systemOwnerQueryDetails = {
                resource: vm.resource
            };

            vm.systemOwnerComponentConstruction = {
                title: { text: EntifixConfig.systemOwnerDisplayName.get() },
                displayPropertyName: 'systemOwner'
            };
        }

        function setDefaults() {
            vm.resource = new EntifixResource(EntifixConfig.systemOwnerEntityName.get());
            vm.header = "Elija un(a) " + EntifixConfig.systemOwnerDisplayName.get();
        }

        vm.cancel = function () {
            $mdDialog.cancel();
        };

        vm.ok = function () {
            if (vm.systemOwner) {
                new EntifixResource(EntifixConfig.systemOwnerEntitySwapName.get()).saveEntity(_defineProperty({}, EntifixConfig.idSystemOwnerPropertyName.get(), vm.systemOwner), function (response, saveSuccess) {
                    if (saveSuccess) {
                        EntifixSession.saveTokens(response.data.data[EntifixConfig.authTokenName.get()], response.data.data[EntifixConfig.refreshTokenName.get()]);
                        EntifixNotification.success({ "body": "La actualización de " + EntifixConfig.systemOwnerDisplayName.get() + " ha sido exitosa.", "isToast": true });
                        $state.reload();
                        $mdDialog.hide(vm.systemOwner);
                    } else {
                        EntifixNotification.error({ "body": "Ocurrió un error durante la actualización de " + EntifixConfig.systemOwnerDisplayName.get() + ". Por favor vuelva a intentarlo.", "isToast": true });
                    }
                }, function (error) {
                    EntifixNotification.error({ "body": "Ocurrió un error durante la actualización de " + EntifixConfig.systemOwnerDisplayName.get() + ". Por favor vuelva a intentarlo. " + error.data.message, "isToast": true });
                });
            } else {
                EntifixNotification.error({ "body": "Por favor, seleccione un " + EntifixConfig.systemOwnerDisplayName.get() + ".", "isToast": true });
            }
        };

        activate();
        // ==============================================================================================================================================================
    };

    // FACTORY ================================================================================================================================================================================
    // ========================================================================================================================================================================================
    // =========================================================================================================================================================================================
    angular.module('entifix-js').factory('EntifixSystemOwner', systemOwnerFactory);

    systemOwnerFactory.$inject = ['$mdDialog'];

    function systemOwnerFactory($mdDialog) {
        var systemOwnerController = function systemOwnerController() {
            var vm = this;

            // Properties and Fields _______________________________________________________________________________________________________________________________________________________            
            //==============================================================================================================================================================================

            //Fields ===>>>>:


            //Properties ===>>>>:


            //==============================================================================================================================================================================

            // Methods _____________________________________________________________________________________________________________________________________________________________________
            //==============================================================================================================================================================================
            vm.chooseSystemOwner = function (callbackSuccess, callbackError) {
                $mdDialog.show({
                    //templateUrl: 'dist/shared/controls/entifixSystemOwner/entifixSystemOwner.html',
                    template: '<md-dialog aria-label="{{vm.header}}" class="md-md"> \
                                                    <md-toolbar md-colors="{background: \'default-primary-100\'}"> \
                                                        <div class="md-toolbar-tools" layout> \
                                                            <div flex layout layout-align="start center"> \
                                                                <div class="md-icon-button"><md-icon class="material-icons">warning</md-icon></div> \
                                                                <h2>&nbsp {{vm.header}}</h2> \
                                                            </div> \
                                                        </div> \
                                                    </md-toolbar> \
                                                    <div> \
                                                        <md-dialog-content> \
                                                            <md-content layout-padding> \
                                                                <div flex> \
                                                                    <entifix-select  \
                                                                        value-model="vm.systemOwner"  \
                                                                        show-editable-fields="true" \
                                                                        query-details="vm.systemOwnerQueryDetails"  \
                                                                        component-construction="vm.systemOwnerComponentConstruction"  \
                                                                        component-binding-out="vm.systemOwnerInstance"> \
                                                                    </entifix-select> \
                                                                </div> \
                                                            </md-content> \
                                                        </md-dialog-content> \
                                                        <md-dialog-actions layout="row"> \
                                                            <md-button ng-click="vm.cancel()"> \
                                                                <md-icon class="material-icons">clear</md-icon> Cancelar \
                                                            </md-button> \
                                                            <md-button  ng-click="vm.ok()"> \
                                                                <md-icon class="material-icons">done</md-icon> Ok \
                                                            </md-button> \
                                                        </md-dialog-actions> \
                                                    </div> \
                                                </md-dialog>',
                    controller: 'EntifixSystemOwnerController',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    fullscreen: true,
                    controllerAs: 'vm'
                }).then(function (result) {
                    if (callbackSuccess) callbackSuccess(result);
                }, function (result) {
                    if (callbackError) callbackError(result);
                });
            };

            //==============================================================================================================================================================================
        };

        return systemOwnerController;
    };
})();