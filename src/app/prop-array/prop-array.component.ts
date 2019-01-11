import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {getMaxOccurs, getMinOccurs, isEmpty, SFPropArray} from '../schema-types';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {SchemaFormBuilderService} from '../schema-form-builder.service';
import {getRawValue} from '../form-utils';

@Component({
  selector: 'app-prop-array',
  templateUrl: './prop-array.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropArrayComponent implements OnChanges {

  @Input() formGroup: FormGroup;
  @Input() key: string;
  @Input() schema: SFPropArray;
  @Input() viewState: Partial<{
    expanded: boolean;
    items: Array<any>;
  }>;
  @Input() readonlyMode?: boolean;
  @Input() hideEmpty?: boolean;

  maxOccurs: number;
  minOccurs: number;

  constructor(private schemaFormBuilderService: SchemaFormBuilderService) {
  }

  get items(): FormArray {
    return this.formGroup.get(this.key) as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.maxOccurs = getMaxOccurs(this.schema);
      this.minOccurs = getMinOccurs(this.schema);

      // remove superfluous items
      while (this.items.length > this.maxOccurs) {
        this.removeItem(this.items.length - 1);
      }

      // add missing items
      while (this.items.length < this.minOccurs) {
        this.addItem();
      }
    }
  }

  removeItem(idx: number) {
    this.items.removeAt(idx);
    this.viewState.items.splice(idx, 1);
  }

  addItem() {
    const itemViewState = {};
    this.viewState.items.push(itemViewState);
    this.items.push(this.schemaFormBuilderService.createFormControl(this.schema.items, itemViewState, undefined));
  }

  showItem(item: FormGroup): boolean {
    return !this.hideEmpty || !isEmpty(getRawValue(item));
  }

  clearItems(): void {
    while (this.items.length) {
      this.items.removeAt(0);
    }
    this.viewState.items = [];
  }
}
