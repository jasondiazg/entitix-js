// ENTIFIX GLOBAL CONFIGURATION *******************************************************************************
// ============================================================================================================

(function(){
    'use strict';

    var module = angular.module('entifix-js');

    module.provider("EntifixConfig", [function () {
        
        var prov = this;
        var $authUrl, $refreshUrl,
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
    
        prov.setAuthUrl = function(value) {
            $authUrl = value;
        };

        prov.setRefreshUrl = function(value) {
            $refreshUrl = value;
        };

        prov.setUnauthorizedStateName = function(value) {
            $unauthorizedStateName = value;
        };

        prov.setAuthTokenName = function(value) {
             $authTokenName = value;
        };

        prov.setRefreshTokenName = function(value) {
             $refreshTokenName = value;
        };

        prov.setRedirectName = function(value) {
             $redirectName = value;
        };

        prov.setAuthName = function(value) {
             $authAppName = value;
        };

        prov.setThisApplication = function(value) {
             $thisApplication = value;
        };

        prov.setAuthApplication = function(value) {
             $authApplication = value;
        };

        prov.setDevMode = function(value) {
            $devMode = value;
        };
        
        prov.setDevUser = function(value){
            $devUser = value;
        };
        
        prov.setPermissionsTokenName = function(value) {
            $permissionsTokenName = value;
        };
        
        prov.setPermissionsUrl = function(value) {
            $permissionsUrl = value;
        };
        
        prov.setExpiredSessionKeyName = function(value) {
            $expiredSessionKeyName = value;
        };
        
        prov.setSystemOwnerEntityName = function(value) {
            $systemOwnerEntityName = value;
        };
        
        prov.setSystemOwnerEntitySwapName = function(value) {
            $systemOwnerEntitySwapName = value;
        };

        prov.setSystemOwnerDisplayName = function(value) {
            $systemOwnerDisplayName = value;
        }

        prov.setIdSystemOwnerPropertyName = function(value) {
            $idSystemOwnerPropertyName = value;
        }

        prov.setXlsSheetResourceName = function(value) {
            $xlsSheetResourceName = value;
        }

        prov.setpdfResourceName = function(value) {
            $pdfResourceName = value;
        }

        prov.checkAuth = function () {
            let authenticated = localStorage.getItem($authTokenName);
            if (!authenticated) {
                localStorage.setItem($redirectName, $thisApplication);
                localStorage.setItem($authAppName, $authApplication);
                window.location.replace($authApplication);
            }
        }

        // SERVICE INSTANCE __________________________________________________________________________________________________________________________________
        // ===================================================================================================================================================
        prov.$get = [function () {

            var sv = {}

            //Properties and Fields___________________________________________________________________________________________________________________________
            //================================================================================================================================================
            
            //Fields

            sv.redirectName = 
            {
                get: () => { return $redirectName; }
            }

            sv.authAppName = 
            {
                get: () => { return $authAppName; }
            }

            sv.thisApplication = 
            {
                get: () => { return $thisApplication; }
            }

            sv.authApplication = 
            {
                get: () => { return $authApplication; }
            }

            sv.authUrl = 
            {
                get: () => { return $authUrl; }
            }

            sv.refreshUrl = 
            {
                get: () => { return $refreshUrl; }
            }

            sv.devMode = 
            {
                get: () => { return $devMode; }
            }

            sv.authTokenName =
            {
                get: () => { return $authTokenName; }
            }

            sv.refreshTokenName =
            {
                get: () => { return $refreshTokenName; }
            }

            sv.devUser =
            {
                get: () => { return $devUser; }
            }

            sv.unauthorizedStateName =
            {
                get: () => { return $unauthorizedStateName; }
            }

            sv.permissionsTokenName =
            {
                get: () => { return $permissionsTokenName; }
            }

            sv.permissionsUrl =
            {
                get: () => { return $permissionsUrl; }
            }

            sv.expiredSessionKeyName =
            {
                get: () => { return $expiredSessionKeyName; }
            }

            sv.systemOwnerEntityName =
            {
                get: () => { return $systemOwnerEntityName; }
            }

            sv.systemOwnerEntitySwapName =
            {
                get: () => { return $systemOwnerEntitySwapName; }
            }

            sv.systemOwnerDisplayName  =
            {
                get: () => { return $systemOwnerDisplayName; }
            }

            sv.idSystemOwnerPropertyName  =
            {
                get: () => { return $idSystemOwnerPropertyName; }
            }

            sv.xlsSheetResourceName  =
            {
                get: () => { return $xlsSheetResourceName; }
            }

            sv.pdfResourceName  =
            {
                get: () => { return $pdfResourceName; }
            }

            return sv;
        }];
    }]);

})();