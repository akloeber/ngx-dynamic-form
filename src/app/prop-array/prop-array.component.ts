import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {getMaxOccurs, getMinOccurs, SFPropArray} from '../schema-types';
import {AbstractControl, FormArray} from '@angular/forms';
import {SchemaFormBuilderService} from '../schema-form-builder.service';
import {collectModel} from '../form-utils';
import {PropArrayViewState} from 'src/app/prop-array/prop-array-view-state';
import {getOrCreateViewState} from 'src/app/view-state-accessor';

@Component({
  selector: 'app-prop-array',
  templateUrl: './prop-array.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropArrayComponent implements OnChanges {

  @Input() formArray: FormArray;
  @Input() schema: SFPropArray;
  @Input() viewState: PropArrayViewState;
  @Input() readonlyMode?: boolean;
  @Input() hideEmpty?: boolean;

  maxOccurs: number;
  minOccurs: number;

  constructor(private schemaFormBuilderService: SchemaFormBuilderService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.maxOccurs = getMaxOccurs(this.schema);
      this.minOccurs = getMinOccurs(this.schema);

      // remove superfluous items
      while (this.formArray.length > this.maxOccurs) {
        this.removeItem(this.formArray.length - 1);
      }

      // add missing items
      while (this.formArray.length < this.minOccurs) {
        this.addItem();
      }
    }
  }

  removeItem(idx: number) {
    this.formArray.removeAt(idx);
  }

  addItem() {
    this.formArray.push(this.schemaFormBuilderService.createFormControl(this.schema.items, undefined));
  }

  showItem(item: AbstractControl): boolean {
    return !(this.hideEmpty && collectModel(item, this.schema.items) === null);
  }

  clearItems(): void {
    while (this.formArray.length) {
      this.formArray.removeAt(0);
    }
  }

  viewStateForItem(idx: number) {
    return getOrCreateViewState(this.viewState, [idx]);
  }
}
