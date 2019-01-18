import {Injectable} from '@angular/core';
import {
  getInputType,
  getMaxLength,
  getMaxOccurs,
  getMinLength,
  getMinOccurs, isExpanded,
  isReadonly,
  isRequired, SFConditionIf, SFModel,
  SFProp,
  SFPropSimple, SFSchema
} from './schema-types';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidators} from 'src/app/custom-validators';
import {get} from 'lodash-es';
import {root} from 'rxjs/internal-compatibility';

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

  static checkIfOnModel(condition: SFConditionIf, model?: SFModel): boolean {
    if (!model) {
      return false;
    }

    return SchemaFormBuilderService.checkIf(condition, (propPath) => {
      return get(model, propPath);
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

  createFormControl(schema: SFProp, viewState: any, model?: SFModel): AbstractControl {
    const context = new SFCreationContext();

    const rootControl = this.createFormControlInternal(context, schema, viewState, model);

    console.log(context.conditionalProps);
    context.conditionalProps.forEach(prop => {
      console.log('HERE', SchemaFormBuilderService.checkIfOnControl(prop.propSchema.if, rootControl));

      Object.keys(prop.propSchema.if).forEach((propPath) => {
        rootControl.get(propPath).valueChanges.subscribe(() => {
          if (SchemaFormBuilderService.checkIfOnControl(prop.propSchema.if, rootControl)) {
            console.log('HERE OK');
            if (!prop.parent.contains(prop.propKey)) {
              // TODO: what about viewState
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

  private createFormControlInternal(context: SFCreationContext, schema: SFProp, viewState: any, model?: SFModel): AbstractControl {
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
              return this.createFormControlInternal(context, schema.items, viewState.items[idx], model[idx]);
            })
        );

      case 'object':
        if (!viewState.hasOwnProperty('expanded')) {
          viewState.expanded = isExpanded(schema);
        }
        if (!viewState.hasOwnProperty('properties')) {
          viewState.properties = {};
        }

        const conditionalProps: {[propKey: string]: SFSchema} = {};

        const formGroup = new FormGroup(
          Object.entries(schema.properties)
            .reduce(
              (acc, [propKey, propSchema]) => {
                if (!viewState.properties.hasOwnProperty(propKey)) {
                  viewState.properties[propKey] = {};
                }

                if (propSchema.if) {
                  conditionalProps[propKey] = propSchema;
                  return acc;
                }

                return ({
                  ...acc,
                  [propKey]: this.createFormControlInternal(
                    context,
                    propSchema,
                    viewState.properties[propKey],
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
