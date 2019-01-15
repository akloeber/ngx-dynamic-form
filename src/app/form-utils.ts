import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {SFModel, SFSchema} from './schema-types';

// define types for AbstractControl.status asthose are missing in the public API of Angular
// see https://github.com/angular/angular/issues/28047
export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}

export enum FormControlState {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export function collectErrors(control: AbstractControl): any | null {
  if (isFormGroup(control)) {
    return Object.entries(control.controls)
      .reduce(
        (acc, [key, childControl]) => {
          const childErrors = collectErrors(childControl);
          if (childErrors) {
            acc = {[key]: childErrors, ...acc};
          }
          return acc;
        },
        null
      );
  } else {
    return control.errors;
  }
}

export function collectModel(control: AbstractControl, schema: SFSchema): SFModel {
  if (schema.transient) {
    return null;
  }

  switch (schema.type) {
    case 'array':
      return (control as FormArray).controls
        .reduce((acc, childControl) => {
          const propValue = collectModel(childControl, schema.items);
          return propValue !== null ? [...(acc || []), propValue] : acc;
        }, null as Array<any>);
    case 'object':
      return Object.entries(schema.properties)
        .reduce((acc, [propKey, propSchema]) => {
          const propValue = collectModel(control.get(propKey), propSchema);
          return propValue !== null ? {[propKey]: propValue, ...acc} : acc;
        }, null);
    default:
      return collectSimpleValue(control as FormControl, schema);
  }
}

function collectSimpleValue(control: FormControl, schema: SFSchema): SFModel {
  if (control.value == null || control.value === '') {
    return null;
  }
  return control.value;
}

function isFormGroup(control: AbstractControl): control is FormGroup {
  return !!(<FormGroup>control).controls;
}
