import {ValidatorFn} from '@angular/forms';

export class CustomValidators {

  static minItems(min: number): ValidatorFn {
    return control => {
      if (control.value == null) {
        return null;
      }

      const itemCount = control.value.length;
      if (itemCount > 0 && itemCount < min) {
        return {
          'minOccurs': {
            required: min,
            actual: itemCount,
          }
        };
      }

      return null;
    };
  }

  static maxItems(max: number): ValidatorFn {
    return control => {
      if (control.value == null) {
        return null;
      }

      const itemCount = control.value.length;
      if (itemCount > 0 && itemCount > max) {
        return {
          'maxOccurs': {
            required: max,
            actual: itemCount,
          }
        };
      }

      return null;
    };
  }
}
