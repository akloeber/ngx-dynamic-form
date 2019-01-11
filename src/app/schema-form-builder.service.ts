import {Injectable} from '@angular/core';
import {
  getInputType,
  getMaxLength,
  getMaxOccurs,
  getMinLength,
  getMinOccurs, isExpanded,
  isReadonly,
  isRequired, SFModel,
  SFProp,
  SFPropSimple
} from './schema-types';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidators} from 'src/app/custom-validators';

@Injectable({
  providedIn: 'root'
})
export class SchemaFormBuilderService {

  constructor() {
  }

  private static getValidators(schema: SFPropSimple): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (isRequired(schema)) {
      validators.push(Validators.required);
    }

    switch (getInputType(schema)) {
      case 'text':
        const minLength = getMinLength(schema);
        if (minLength > 0) {
          validators.push(Validators.minLength(minLength));
        }

        const maxLength = getMaxLength(schema);
        if (maxLength < Number.POSITIVE_INFINITY) {
          validators.push(Validators.maxLength(maxLength));
        }
        break;
      case 'multi-select':
        const minOccurs = getMinOccurs(schema);
        if (minOccurs > 0) {
          validators.push(CustomValidators.minItems(minOccurs));
        }

        const maxOccurs = getMaxOccurs(schema);
        if (maxOccurs < Number.POSITIVE_INFINITY) {
          validators.push(CustomValidators.maxItems(maxOccurs));
        }

        break;
    }

    return validators;
  }

  createFormControl(schema: SFProp, viewState: any, model?: SFModel): AbstractControl {
    switch (schema.type) {
      case 'array':
        const itemCount = model ? model.length : 0;

        // initialize viewState
        if (!viewState.hasOwnProperty('items')) {
          viewState.items = [];
        }
        if (!viewState.hasOwnProperty('expanded')) {
          viewState.expanded = isExpanded(schema);
        }

        return new FormArray(
          Array.apply(null, {length: itemCount})
            .map((_, idx) => {
              if (!viewState.items.hasOwnProperty(idx)) {
                viewState.items[idx] = {};
              }
              return this.createFormControl(schema.items, viewState.items[idx], model[idx]);
            })
        );
      case 'object':
        if (!viewState.hasOwnProperty('expanded')) {
          viewState.expanded = isExpanded(schema);
        }
        if (!viewState.hasOwnProperty('properties')) {
          viewState.properties = {};
        }

        return new FormGroup(
          Object.entries(schema.properties)
            .reduce(
              (acc, [propKey, propSchema]) => {
                if (!viewState.properties.hasOwnProperty(propKey)) {
                  viewState.properties[propKey] = {};
                }
                return ({
                  ...acc,
                  [propKey]: this.createFormControl(propSchema, viewState.properties[propKey], model ? model[propKey] : undefined)
                });
              },
              {}
            )
        );
      default:
        const propSimple = schema as SFPropSimple;
        const validators = SchemaFormBuilderService.getValidators(propSimple);
        return new FormControl({value: propSimple.default || null, disabled: isReadonly(propSimple)}, validators);
    }
  }
}
