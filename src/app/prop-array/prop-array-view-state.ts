import {isExpanded, SFPropArray, SFPropComplex, SFPropViewState} from 'src/app/schema-types';
import {BehaviorSubject, Subject} from 'rxjs';

export class PropArrayViewState {

  readonly expanded: BehaviorSubject<boolean>;

  constructor(
    public readonly schema: SFPropArray,
    public readonly items: Array<SFPropViewState> = [],
  ) {
    this.expanded = new BehaviorSubject(isExpanded(schema));
  }

  addViewState(propIndex: number, viewState: SFPropViewState): SFPropViewState {
    this.items[propIndex] = viewState;
    return viewState;
  }

  getViewState(propIndex: number): SFPropViewState {
    return this.items[propIndex];
  }

  toJSON() {
    return {items: this.items, expanded: this.expanded.value};
  }
}
