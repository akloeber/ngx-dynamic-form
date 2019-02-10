import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {get, set} from 'lodash-es';
import {getOrCreateViewState} from 'src/app/view-state-accessor';
import {SFProp} from 'src/app/schema-types';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent implements OnInit {

  @Input() config: {
    mapping: Record<string, string>;
  };
  @Input() formGroup: FormGroup;
  @Input() schema: SFProp;
  @Input() viewState: any;

  get linked() {
    return this.formGroup.get(this.config.mapping.id).value !== null;
  }

  onClick() {
    if (this.linked) {
      this.unlink();
    } else {
      this.link({
        id: 123,
        city: 'Köln',
        street: 'Hauptstrasse',
      });
    }
  }

  ngOnInit(): void {
    if (this.linked) {
      this.updateFormControlReadonly(true);
    }
  }

  private updateFormControlReadonly(readonly: boolean) {
    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const viewState = getOrCreateViewState(this.viewState, target.split('.'));
        viewState.readonly.next(readonly);
      });
  }

  private link(address: any): void {
    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        control.setValue(address[field], {emitEvent: false});
      });
    this.updateFormControlReadonly(true);
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  private unlink() {
    this.updateFormControlReadonly(false);
    this.formGroup.get(this.config.mapping.id).setValue(null, {emitEvent: false});
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }
}
