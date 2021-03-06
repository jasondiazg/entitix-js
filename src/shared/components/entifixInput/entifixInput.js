(function () {
    'use strict';
   
    function componentcontroller($filter, EntifixStringUtils, $timeout, $scope)
    {
        var vm = this;
        var randomNumber = Math.floor((Math.random() * 100) + 1);
        var plannedRecharge;

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
        
        //Error validations
        vm.isRequired =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.isRequired)
                    return vm.componentConstruction.isRequired;

                //Default value
                return false;
            }
        };
        
        vm.requiredMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.requiredMessage)
                {
                    if (vm.componentConstruction.requiredMessage.getter)
                        return vm.componentConstruction.requiredMessage.getter();
                    
                    if (vm.componentConstruction.requiredMessage.text)
                        return vm.componentConstruction.requiredMessage.text;
                }

                //Default value
                return 'Este campo es obligatorio';
            }
        };
        
        vm.maxLength =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.maxLength)
                    return vm.componentConstruction.maxLength;

                //Default value
                return null;
            }
        };
        
        vm.maxLengthMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.maxLengthMessage)
                {
                    if (vm.componentConstruction.maxLengthMessage.getter)
                        return vm.componentConstruction.maxLengthMessage.getter();
                    
                    if (vm.componentConstruction.maxLengthMessage.text)
                        return vm.componentConstruction.maxLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado largo';
            }
        };
        
        vm.minLength =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.minLength)
                    return vm.componentConstruction.minLength;

                //Default value
                return null;
            }
        };
        
        vm.minLengthMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.minLengthMessage)
                {
                    if (vm.componentConstruction.minLengthMessage.getter)
                        return vm.componentConstruction.minLengthMessage.getter();
                    
                    if (vm.componentConstruction.minLengthMessage.text)
                        return vm.componentConstruction.minLengthMessage.text;
                }

                //Default value
                return 'El texto es demasiado corto';
            }
        };
        
        vm.max =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.max)
                    return vm.componentConstruction.max;

                //Default value
                return null;
            }
        };
        
        vm.maxMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.maxMessage)
                {
                    if (vm.componentConstruction.maxMessage.getter)
                        return vm.componentConstruction.maxMessage.getter();
                    
                    if (vm.componentConstruction.maxMessage.text)
                        return vm.componentConstruction.maxMessage.text;
                }

                //Default value
                return 'El número es demasiado largo';
            }
        };
        
        vm.min =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.min)
                    return vm.componentConstruction.min;

                //Default value
                return null;
            }
        };
        
        vm.minMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.minMessage)
                {
                    if (vm.componentConstruction.minMessage.getter)
                        return vm.componentConstruction.minMessage.getter();
                    
                    if (vm.componentConstruction.minMessage.text)
                        return vm.componentConstruction.minMessage.text;
                }

                //Default value
                return 'El número es demasiado corto';
            }
        };
        
        vm.emailMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.emailMessage)
                {
                    if (vm.componentConstruction.emailMessage.getter)
                        return vm.componentConstruction.emailMessage.getter();
                    
                    if (vm.componentConstruction.emailMessage.text)
                        return vm.componentConstruction.emailMessage.text;
                }

                //Default value
                return 'Ingrese una dirección de correo válida';
            }
        };
        
        vm.urlMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.urlMessage)
                {
                    if (vm.componentConstruction.urlMessage.getter)
                        return vm.componentConstruction.urlMessage.getter();
                    
                    if (vm.componentConstruction.urlMessage.text)
                        return vm.componentConstruction.urlMessage.text;
                }

                //Default value
                return 'Ingrese una dirección URL válida';
            }
        };
        
        vm.numberMessage =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.numberMessage)
                {
                    if (vm.componentConstruction.numberMessage.getter)
                        return vm.componentConstruction.numberMessage.getter();
                    
                    if (vm.componentConstruction.numberMessage.text)
                        return vm.componentConstruction.numberMessage.text;
                }

                //Default value
                return 'Ingrese un número válido';
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
                return 'entifixinput' + randomNumber;
            }
        };
         
        vm.isTextArea = 
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.isTextArea)
                    return true;

                //Default value
                return false;
            }
        };
         
        vm.type = 
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.type)
                    return vm.componentConstruction.type;

                //Default value
                return 'text';
            }
        };
        
        vm.isForm =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.isForm != null)
                    return vm.componentConstruction.isForm;

                //Default value
                return true;
            }
        };
        
        vm.rows =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.rows)
                    return vm.componentConstruction.rows;

                //Default value
                return 1;
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

        vm.modelOptions =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.modelOptions)
                    return vm.componentConstruction.modelOptions;

                return {};
            }
        }

        vm.numberValidation =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.numberValidation)
                    return vm.componentConstruction.numberValidation;

                return false;
            }
        }

        vm.format =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.format)
                    return vm.componentConstruction.format;

                return null;
            }
        }

        vm.currency =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.currency)
                    return vm.componentConstruction.currency;

                return '';
            }
        }

        vm.nullValueLabel =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.nullValueLabel)
                    return vm.componentConstruction.nullValueLabel;
                
                return 'SIN REGISTROS';
            }
        }
        
        vm.isDisabled =
        {
            get: () =>
            {
                if (vm.componentConstruction && vm.componentConstruction.isDisabled)
                    return vm.componentConstruction.isDisabled;

                //Default value
                return false;
            }
        };
        //=======================================================================================================================================================================



        //Methods________________________________________________________________________________________________________________________________________________________________ 
        //=======================================================================================================================================================================

        vm.$onInit = () =>
        {
            setValues();
        };

        vm.runOnChangeTrigger = () =>
        {
            if (vm.onChange)
                vm.onChange({ value: vm.valueModel });

            cleanPlannedRecharge();
            plannedRecharge = $timeout(setValues, 1500);
        }

        vm.getDisplay = () =>
        {
            if (vm.valueModel)
            {
                if (vm.format.get())
                    return $filter(vm.format.get())(vm.valueModel, vm.currency.get());
                return vm.valueModel;
            }
            else
                return vm.nullValueLabel.get();
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

        $scope.$watch(() => { return vm.valueModel; }, (newValue, oldValue) => { vm.display = vm.getDisplay(); } );

        //=======================================================================================================================================================================


        
    };

    componentcontroller.$inject = ['$filter', 'EntifixStringUtils', '$timeout', '$scope'];

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
        //templateUrl: 'src/shared/components/entifixInput/entifixInput.html',
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