import {AbstractControl, FormGroup} from '@angular/forms';

function isFormGroup(control: AbstractControl): control is FormGroup {
  return !!(<FormGroup>control).controls;
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
