import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {isExpanded, isReadonly, SFProp, SFPropComplex} from '../schema-types';
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
    properties: {
      [propKey: string]: any;
    }
  };
  @Input() index?: number;
  @Input() readonlyMode?: boolean;

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
