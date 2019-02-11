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
            acc = {...acc, [key]: childErrors};
          }
          return acc;
        },
        null
      );
  } else {
    return control.errors;
  }
}

// Symbol that represents a value that must never be included in model.
// This is necessary to distinguish from <null> and <undefined> which are allowed model values if collapse === <false>.
const NA = Symbol('N/A');
const MODEL_FOR_EMPTY_ARRAY = null;
const MODEL_FOR_EMPTY_OBJECT = null;

export function collectModel(control: AbstractControl, schema: SFSchema, collapse = true): SFModel | null {
  const model = collectModelInternal(control, schema, collapse);
  return model !== NA ? model : null;
}

function collectModelInternal(control: AbstractControl, schema: SFSchema, collapse = true): SFModel {
  if (schema.transient) {
    return NA;
  }

  switch (schema.type) {
    case 'array':
      return (control as FormArray).controls
        .reduce((acc, childControl) => {
          const collapsedItemModel = collectModelInternal(childControl, schema.items, true);

          if (collapsedItemModel === NA) {
            return acc; // item is not filled
          }

          const propValue = collapse ? collapsedItemModel : collectModelInternal(childControl, schema.items, false);
          return Array.isArray(acc) ? [...acc, propValue] : [propValue];
        }, collapse ? NA : MODEL_FOR_EMPTY_ARRAY);
    case 'object':
      return Object.entries((control as FormGroup).controls)
        .reduce((acc, [propKey, propControl]) => {
          const propValue = collectModelInternal(propControl, schema.properties[propKey], collapse);
          if (propValue !== NA) {
            return (acc as Object instanceof Object) ? {...(acc as Object), [propKey]: propValue} : {[propKey]: propValue} ;
          } else {
            return acc;
          }
        }, collapse ? NA : MODEL_FOR_EMPTY_OBJECT);
    default:
      return collectSimpleValue(control as FormControl, schema, collapse);
  }
}

function collectSimpleValue(control: FormControl, schema: SFSchema, collapse: boolean): SFModel {
  if (control.value == null || control.value === '') {
    return collapse ? NA : null;
  }
  return control.value;
}

function isFormGroup(control: AbstractControl): control is FormGroup {
  return !!(<FormGroup>control).controls;
}
