import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SFProp, SFPropComplex} from '../schema-types';
import {FormGroup} from '@angular/forms';
import {collectModel} from '../form-utils';
import {PropComplexViewState} from 'src/app/prop-complex/prop-complex-view-state';
import {getOrCreateViewState} from 'src/app/view-state-accessor';

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
  @Input() viewState: PropComplexViewState;
  @Input() index?: number;
  @Input() readonlyMode?: boolean;
  @Input() hideEmpty?: boolean;
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

    const control = this.formGroup.get(prop.key);
    if (!control) {
      return true; // conditional property is missing
    }

    if (this.hideEmpty && collectModel(control, prop.schema) === null) {
      return true;
    }

    return false;
  }

  trackByKey(index: number, item: PropDescriptor): string {
    return item.key;
  }

  viewStateForProp(propKey: string) {
    return getOrCreateViewState(this.viewState, [propKey]);
  }
}
