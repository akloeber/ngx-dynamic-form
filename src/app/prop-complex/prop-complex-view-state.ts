import {isExpanded, SFPropComplex, SFPropViewState} from 'src/app/schema-types';
import {BehaviorSubject, Subject} from 'rxjs';

export class PropComplexViewState {

  readonly expanded: BehaviorSubject<boolean>;

  constructor(
    public readonly schema: SFPropComplex,
    public readonly properties: {
      [propKey: string]: SFPropViewState;
    } = {},
  ) {
    this.expanded = new BehaviorSubject(isExpanded(schema));
  }

  addViewState(propKey: string, viewState: SFPropViewState): SFPropViewState {
    this.properties[propKey] = viewState;
    return viewState;
  }

  getViewState(propKey: string): SFPropViewState {
    return this.properties[propKey];
  }

  toJSON() {
    return {properties: this.properties, expanded: this.expanded.value};
  }
}
