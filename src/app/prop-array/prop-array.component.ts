import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {maxOccurs, minOccurs, SFPropArray} from '../schema-types';
import {FormArray, FormGroup} from '@angular/forms';
import {SchemaFormBuilderService} from '../schema-form-builder.service';

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
  @Input() readonly?: boolean;

  maxOccurs: number;
  minOccurs: number;

  constructor(private schemaFormBuilderService: SchemaFormBuilderService) {
  }

  get items(): FormArray {
    return this.formGroup.get(this.key) as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.viewState) {
      if (this.viewState.expanded === undefined) {
        this.viewState.expanded = this.schema.initialView !== 'collapsed';
      }

      if (this.viewState.items === undefined) {
        this.viewState.items = [];
      }

      for (let idx = 0; idx < this.items.length; idx++) {
        if (this.viewState.items[idx] === undefined) {
          this.viewState.items[idx] = {};
        }
      }
    }

    if (changes.schema) {
      this.maxOccurs = maxOccurs(this.schema);
      this.minOccurs = minOccurs(this.schema);

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
    this.items.push(this.schemaFormBuilderService.createFormControl(this.schema.items, undefined));
    this.viewState.items.push({});
  }
}
