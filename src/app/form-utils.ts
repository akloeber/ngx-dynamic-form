import {AbstractControl, FormGroup} from '@angular/forms';

// define types for AbstractControl.status asthose are missing in the public API of Angular
// see https://github.com/angular/angular/issues/28047
export enum FormControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
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

export function getRawValue(control: AbstractControl): any {
  // use raw value where possible as value vanishes once control gets disabled
  if (isFormGroup(control)) {
    return control.getRawValue();
  } else {
    return control.value;
  }
}

function isFormGroup(control: AbstractControl): control is FormGroup {
  return !!(<FormGroup>control).controls;
}
