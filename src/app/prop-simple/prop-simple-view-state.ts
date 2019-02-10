import {BehaviorSubject} from 'rxjs';
import {SFPropSimple} from 'src/app/schema-types';

export class PropSimpleViewState {

  readonly readonly: BehaviorSubject<boolean>;

  constructor(
    public readonly schema: SFPropSimple,
    readonly: boolean = false
  ) {
    this.readonly = new BehaviorSubject(readonly);
  }

  toJSON() {
    return {readonly: this.readonly.value};
  }
}
