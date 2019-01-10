import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {getInputType, getMaxLength, isReadonly, isRequired, SFInputType, SFPropSimple} from '../schema-types';
import {FormControl, FormGroup, AbstractControl} from '@angular/forms';
import {FormControlStatus} from '../form-utils';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-prop-simple',
  templateUrl: './prop-simple.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropSimpleComponent implements OnChanges, OnDestroy {

  @Input() formGroup: FormGroup;
  @Input() key: string;
  @Input() schema: SFPropSimple;
  @Input() viewState: {
    readonly?: boolean;
  };
  @Input() readonlyMode?: boolean;

  maxLength: number;
  description: string;

  private statusChangeSubscription: Subscription;

  get inputType(): SFInputType {
    return getInputType(this.schema);
  }

  get formControl(): FormControl {
    return this.formGroup.get(this.key) as FormControl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.statusChangeSubscription) {
      this.statusChangeSubscription = this.formControl.statusChanges.subscribe(
        status => this.onDisabledChange(status === FormControlStatus.DISABLED)
      );
    }

    if (changes.schema) {
      const maxLength = getMaxLength(this.schema);
      this.maxLength = maxLength < Number.POSITIVE_INFINITY ? maxLength : undefined;

      this.description = this.schema.description;
      if (isRequired(this.schema)) {
        this.description += ' *';
      }
    }

    if (changes.schema || changes.readonlyMode || changes.viewState) {
      this.updateReadonly();
    }
  }

  ngOnDestroy(): void {
    this.statusChangeSubscription.unsubscribe();
  }

  private disable(): void {
    if (!this.formControl.disabled) {
      this.formControl.disable();
    }
  }

  private enable(): void {
    if (this.formControl.disabled) {
      this.formControl.enable();
    }
  }

  private updateReadonly(): void {
    if (this.evaluateReadonly()) {
      this.disable();
    } else {
      this.enable();
    }
  }

  private evaluateReadonly(): boolean {
    return isReadonly(this.schema) || this.readonlyMode || this.viewState.readonly;
  }

  private onDisabledChange(isDisabled: boolean) {
    if (isDisabled && !this.readonlyMode) {
      // only persist readonly state if not induced by readonly mode but dedicated disable operations
      this.viewState.readonly = true;
    }
    if (!isDisabled) {
      delete this.viewState.readonly;
    }
  }
}
