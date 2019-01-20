import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {getMaxOccurs, getMinOccurs, isExpanded, SFPropArray} from '../schema-types';
import {AbstractControl, FormArray} from '@angular/forms';
import {SchemaFormBuilderService} from '../schema-form-builder.service';
import {collectModel} from '../form-utils';

@Component({
  selector: 'app-prop-array',
  templateUrl: './prop-array.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropArrayComponent implements OnChanges {

  @Input() formArray: FormArray;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.viewState) {
      if (!this.viewState.hasOwnProperty('items')) {
        this.viewState.items = [];
      }
      if (!this.viewState.hasOwnProperty('expanded')) {
        this.viewState.expanded = isExpanded(this.schema);
      }

      for (let idx = 0; idx < this.formArray.length; idx++) {
        if (!this.viewState.items.hasOwnProperty(idx)) {
          this.viewState.items[idx] = {};
        }
      }
    }

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
    this.viewState.items.splice(idx, 1);
  }

  addItem() {
    const itemViewState = {};
    this.viewState.items.push(itemViewState);
    this.formArray.push(this.schemaFormBuilderService.createFormControl(this.schema.items, undefined));
  }

  showItem(item: AbstractControl): boolean {
    return !(this.hideEmpty && collectModel(item, this.schema.items) === null);
  }

  clearItems(): void {
    while (this.formArray.length) {
      this.formArray.removeAt(0);
    }
    this.viewState.items = [];
  }
}
