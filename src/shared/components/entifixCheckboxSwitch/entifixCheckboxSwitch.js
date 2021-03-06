(function () {
    'use strict';
   
    function componentcontroller(EntifixStringUtils, $scope)
    {
        var vm = this;
        var randomNumber = Math.floor((Math.random() * 100) + 1);

        //Fields and Properties__________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================
        //Label - Input Behavior
        vm.canShowEditableFields =
        {
            get: () =>
            {
                if (vm.showEditableFields)
                    return vm.showEditableFields;

                return false;
            }
        };

        //Error Behavior with ng-messages
        vm.canEvaluateErrors =
        {
            get: () =>
            {
                if (vm.evaluateErrors)
                    return vm.evaluateErrors( { name: vm.name.get() } );

                return false;
            }
        };
        
        vm.isSwitch =
        {
            get: () =>
            {
                if (vm.componentConstruction.isSwitch)
                    return vm.componentConstruction.isSwitch;

                //Default value
                return false;
            }
        };

        vm.title = 
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.title)
                {
                    if (vm.componentConstruction.title.getter)
                        return vm.componentConstruction.title.getter();
                    
                    if (vm.componentConstruction.title.text)
                        return vm.componentConstruction.title.text;
                }

                //Default value
                return '';
            }
        };
         
        vm.name = 
        {
            get: () =>
            {
                if (vm.title.get() != '')
                    return EntifixStringUtils.getCleanedString(vm.title.get())
                return 'entifixcheckboxswitch' + randomNumber;
            }
        };
        
        vm.isForm =
        {
            get: () =>
            {
                if (vm.componentConstruction.isForm != null)
                    return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };

        vm.tooltip = 
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.tooltip)
                {
                    if (vm.componentConstruction.tooltip.getter)
                        return vm.componentConstruction.tooltip.getter();
                    
                    if (vm.componentConstruction.tooltip.text)
                        return vm.componentConstruction.tooltip.text;
                }

                //Default value
                return null;
            }
        };
        
        vm.valueTitle =
        {
            get: () =>
            {
                if (vm.title.get() && vm.title.get() != '')
                {
                    if (vm.includeValue.get())
                    {
                        var bool = 'No';
                        if (vm.valueModel && vm.title.get() && vm.title.get() != '')
                            bool = 'Si';
                        return vm.title.get() + ': ' + bool;
                    }
                    else
                        return vm.title.get();
                }
                return '';
            }
        };
        
        vm.includeValue =
        {
            get: () =>
            {
                if (vm.componentConstruction.includeValue != null)
                    return vm.componentConstruction.includeValue;

                //Default value
                return true;
            }
        };

        vm.getValue = function()
        {
            if (vm.valueModel)
                return 'Si';
            return 'No';
        }
        //=======================================================================================================================================================================



        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = function()
        {
            if (vm.init)
                vm.init();
            if (vm.valueModel == undefined)
                vm.valueModel = false;
        };

        vm.runOnChangeTrigger = function()
        {
            if (vm.onChange)
                vm.onChange({ value: vm.valueModel });
        }

        function cleanPlannedRecharge()
        {
            if (plannedRecharge)
            {
                $timeout.cancel(plannedRecharge);
                plannedRecharge = null;
            }
        };

        function setValues()
        {
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

    var component = 
    {
        bindings: 
        {
            valueModel: '=',
            showEditableFields: '=',
            evaluateErrors: '&',
            componentConstruction: '<',
            onChange: '&'
        },
        //templateUrl: 'src/shared/components/entifixCheckboxSwitch/entifixCheckboxSwitch.html',
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