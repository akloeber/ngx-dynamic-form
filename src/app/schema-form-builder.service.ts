import {Injectable} from '@angular/core';
import {getInputType, getMaxLength, getMaxOccurs, getMinLength, getMinOccurs, isRequired, SFProp, SFPropSimple} from './schema-types';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidators} from 'src/app/custom-validators';

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
}
