import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {getInputType, getMaxLength, isReadonly, isRequired, SFInputType, SFPropSimple} from '../schema-types';
import {FormControl, FormGroup} from '@angular/forms';
import {FormControlStatus} from '../form-utils';
import {Subscription} from 'rxjs';
import {PropSimpleViewState} from 'src/app/prop-simple/prop-simple-view-state';

@Component({
  selector: 'app-prop-simple',
  templateUrl: './prop-simple.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropSimpleComponent implements OnChanges, OnInit, OnDestroy {

  @Input() formGroup: FormGroup;
  @Input() key: string;
  @Input() schema: SFPropSimple;
  @Input() viewState: PropSimpleViewState;
  @Input() readonlyMode?: boolean;

  maxLength: number;
  description: string;

  private viewStateReadonlySubscription: Subscription;

  get inputType(): SFInputType {
    return getInputType(this.schema);
  }

  get disabledAttr(): boolean | undefined {
    return isReadonly(this.schema) || this.readonlyMode || this.viewState.readonly.value || undefined;
  }

  constructor(private cd: ChangeDetectorRef) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      const maxLength = getMaxLength(this.schema);
      this.maxLength = maxLength < Number.POSITIVE_INFINITY ? maxLength : undefined;

      this.description = this.schema.description;
      if (isRequired(this.schema)) {
        this.description += ' *';
      }
    }
  }

  ngOnInit(): void {
    this.viewStateReadonlySubscription = this.viewState.readonly.subscribe(() =>  this.cd.markForCheck());
  }

  ngOnDestroy(): void {
    if (this.viewStateReadonlySubscription) {
      this.viewStateReadonlySubscription.unsubscribe();
    }
  }
}
