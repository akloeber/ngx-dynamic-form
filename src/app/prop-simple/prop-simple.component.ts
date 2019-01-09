import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {getMaxLength, isReadonly, isRequired, SFPropSimple} from '../schema-types';
import {FormControl, FormGroup} from '@angular/forms';

type InputType = 'text' | 'number' | 'date' | 'radio' | 'select' | 'multi-select' | 'hidden';

@Component({
  selector: 'app-prop-simple',
  templateUrl: './prop-simple.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropSimpleComponent implements OnChanges {

  @Input() formGroup: FormGroup;
  @Input() key: string;
  @Input() schema: SFPropSimple;
  @Input() viewState: {
    readonly: boolean;
  };
  @Input() readonly?: boolean;

  maxLength: number;
  description: string;

  get inputType(): InputType {
    const type = this.schema.widget || this.schema.datatype || this.schema.type;
    switch (type) {
      case 'date':
      case 'number':
      case 'radio':
      case 'select':
      case 'multi-select':
        return type;
      default:
        return 'text';
    }
  }

  get formControl(): FormControl {
    return this.formGroup.get(this.key) as FormControl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      const maxLength = getMaxLength(this.schema);
      this.maxLength = maxLength < Number.POSITIVE_INFINITY ? maxLength : undefined;

      this.description = this.schema.description;
      if (isRequired(this.schema)) {
        this.description += ' *';
      }
    }

    if (changes.viewState) {
      if (this.viewState.readonly === undefined) {
        this.viewState.readonly = this.readonly || isReadonly(this.schema);
      }
    }

    if (changes.readonly) {
      this.viewState.readonly = this.readonly || isReadonly(this.schema);
      if (this.viewState.readonly) {
        this.formControl.disable();
      } else {
        this.formControl.enable();
      }
    }
  }
}
