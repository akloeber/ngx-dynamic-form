import {Injectable} from '@angular/core';
import {getMaxLength, getMinLength, isRequired, SFProp, SFPropSimple} from './schema-types';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SchemaFormBuilderService {

  constructor() {
  }

  createFormControl(schema: SFProp, model?: any): AbstractControl {
    switch (schema.type) {
      case 'array':
        return new FormArray(
          Array.apply(null, {length: model ? model.length : 0})
            .map((_, idx) => this.createFormControl(schema.items, model[idx]))
        );
      case 'object':
        return new FormGroup(
          Object.entries(schema.properties)
            .reduce(
              (acc, [propKey, propSchema]) =>
                ({...acc, [propKey]: this.createFormControl(propSchema, model ? model[propKey] : undefined)}),
              {}
            )
        );
      default:
        const propSimple = schema as SFPropSimple;
        const validators = this.getValidators(propSimple);
        return new FormControl(propSimple.default, validators);
    }
  }

  private getValidators(schema: SFPropSimple): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (isRequired(schema)) {
      validators.push(Validators.required);
    }

    const minLength = getMinLength(schema);
    if (minLength > 0) {
      validators.push(Validators.minLength(minLength));
    }

    const maxLength = getMaxLength(schema);
    if (maxLength < Number.POSITIVE_INFINITY) {
      validators.push(Validators.maxLength(maxLength));
    }
    return validators;
  }
}
