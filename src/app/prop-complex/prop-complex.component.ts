import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {isReadonly, SFProp, SFPropComplex} from '../schema-types';
import {FormGroup} from '@angular/forms';

enum PropWidget {
  SIMPLE = 'SIMPLE',
  COMPLEX = 'COMPLEX',
  ARRAY = 'ARRAY',
}

interface PropDescriptor {
  key: string;
  schema: SFProp;
}

@Component({
  selector: 'app-prop-complex',
  templateUrl: './prop-complex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropComplexComponent implements OnChanges {

  @Input() formGroup: FormGroup;
  @Input() schema: SFPropComplex;
  @Input() viewState: {
    expanded: boolean;
    readonly: boolean;
    properties: {
      [propKey: string]: any;
    }
  };
  @Input() index?: number;
  @Input() readonly?: boolean;

  properties: Array<PropDescriptor> = [];

  get description(): string {
    let result = this.schema.description;
    if (this.index !== undefined) {
      result += ` #${this.index + 1}`;
    }

    return result;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.properties = Object
        .entries(this.schema.properties)
        .reduce((acc, [key, schema]) => [...acc, {key, schema}], []);
    }

    if (changes.viewState) {
      if (this.viewState.expanded === undefined) {
        this.viewState.expanded = this.schema.initialView !== 'collapsed';
      }

      if (this.viewState.properties === undefined) {
        this.viewState.properties = {};
      }

      this.properties.forEach(prop => {
        if (this.viewState.properties[prop.key] === undefined) {
          this.viewState.properties[prop.key] = {};
        }
      });
    }

    if (changes.readonly) {
      this.viewState.readonly = this.readonly || isReadonly(this.schema);
      if (this.viewState.readonly) {
        this.formGroup.disable();
      } else {
        this.formGroup.enable();
      }
    }
  }

  widgetForProperty(schema: SFProp): PropWidget | null {
    if (schema.widget === 'hidden') {
      return null;
    }

    switch (schema.type) {
      case 'array':
        return PropWidget.ARRAY;
      case 'object':
        return PropWidget.COMPLEX;
      default:
        return PropWidget.SIMPLE;
    }
  }
}
