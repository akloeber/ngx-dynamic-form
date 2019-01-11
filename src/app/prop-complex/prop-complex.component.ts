import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {isEmpty, SFProp, SFPropComplex} from '../schema-types';
import {FormGroup} from '@angular/forms';
import {getRawValue} from '../form-utils';

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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PropComplexComponent implements OnChanges {

  get description(): string {
    let result = this.schema.description;
    if (this.index !== undefined) {
      result += ` #${this.index + 1}`;
    }

    return result;
  }

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
  @Input() hideEmpty?: boolean;

  properties: Array<PropDescriptor> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.properties = Object
        .entries(this.schema.properties)
        .reduce((acc, [key, schema]) => [...acc, {key, schema}], []);
    }
  }

  widgetForProperty(prop: PropDescriptor): PropWidget | null {
    if (this.isWidgetHidden(prop)) {
      return null;
    }

    switch (prop.schema.type) {
      case 'array':
        return PropWidget.ARRAY;
      case 'object':
        return PropWidget.COMPLEX;
      default:
        return PropWidget.SIMPLE;
    }
  }

  isWidgetHidden(prop: PropDescriptor): boolean {
    if (prop.schema.widget === 'hidden') {
      return true;
    }

    if (this.hideEmpty && isEmpty(getRawValue(this.formGroup.get(prop.key)))) {
      return true;
    }

    return false;
  }

  trackByKey(index: number, item: PropDescriptor): string {
    return item.key;
  }
}
