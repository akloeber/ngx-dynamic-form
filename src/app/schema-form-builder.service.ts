import {Injectable} from '@angular/core';
import {
  getInputType,
  getMaxLength,
  getMaxOccurs,
  getMinLength,
  getMinOccurs,
  isReadonly,
  isRequired,
  SFConditionIf,
  SFModel,
  SFProp,
  SFPropSimple,
  SFSchema
} from './schema-types';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidators} from 'src/app/custom-validators';
import {get} from 'lodash-es';

class SFCreationContext {
  conditionalProps: Array<{
    parent: FormGroup;
    propKey: string;
    propSchema: SFSchema;
  }> = [];

  addConditionalProps(
    parent: FormGroup,
    props: {[propKey: string]: SFSchema},
  ) {
    Object.entries(props).forEach(([propKey, propSchema]) => {
      this.conditionalProps.push({parent, propKey, propSchema});
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class SchemaFormBuilderService {

  constructor() {
  }

  static checkIfOnControl(condition: SFConditionIf, rootControl: AbstractControl): boolean {
    return SchemaFormBuilderService.checkIf(condition, (propPath) => {
      const control = rootControl.get(propPath);
      return control ? control.value : null;
    });
  }

  private static checkIf(condition: SFConditionIf, valueResolver: (propPath) => any): boolean {
    return Object.entries(condition).reduce((acc, [propPath, values]) => {
      if (!acc) {
        return acc;
      }

      const value = valueResolver(propPath);
      return values.indexOf(value) !== -1;
    }, true);
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

  createFormControl(schema: SFProp, model?: SFModel): AbstractControl {
    const context = new SFCreationContext();

    const rootControl = this.createFormControlInternal(context, schema, model);

    context.conditionalProps.forEach(prop => {
      const condition = prop.propSchema.if;

      Object.keys(condition).forEach((propPath) => {

        rootControl.get(propPath).valueChanges.subscribe(() => {
          if (SchemaFormBuilderService.checkIfOnControl(condition, rootControl)) {
            if (!prop.parent.contains(prop.propKey)) {
              // TODO: unregister observer
              prop.parent.addControl(prop.propKey, this.createFormControlInternal(new SFCreationContext(), prop.propSchema, {}));
            }
          } else {
            if (prop.parent.contains(prop.propKey)) {
              prop.parent.removeControl(prop.propKey);
            }
          }
        });
      });
    });

    return rootControl;
  }

  private createFormControlInternal(context: SFCreationContext, schema: SFProp, model?: SFModel): AbstractControl {
    switch (schema.type) {

      case 'array':
        const itemCount = model ? model.length : 0;

        return new FormArray(
          Array.apply(null, {length: itemCount})
            .map((_, idx) => this.createFormControlInternal(context, schema.items, model[idx]))
        );

      case 'object':
        const conditionalProps: {[propKey: string]: SFSchema} = {};

        const formGroup = new FormGroup(
          Object.entries(schema.properties)
            .reduce(
              (acc, [propKey, propSchema]) => {
                if (propSchema.if) {
                  conditionalProps[propKey] = propSchema;
                  return acc;
                }

                return ({
                  ...acc,
                  [propKey]: this.createFormControlInternal(
                    context,
                    propSchema,
                    model ? model[propKey] : undefined
                  )
                });
              },
              {}
            )
        );

        context.addConditionalProps(formGroup, conditionalProps);

        return formGroup;

      default:
        const propSimple = schema as SFPropSimple;
        const validators = SchemaFormBuilderService.getValidators(propSimple);
        return new FormControl({value: propSimple.default || null, disabled: isReadonly(propSimple)}, validators);
    }
  }
}
