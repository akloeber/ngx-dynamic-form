import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormControlState} from '../form-utils';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent implements OnInit {

  @Input() config: {
    mapping: Record<string, string>;
  };
  @Input() formGroup: FormGroup;

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
      this.updateFormControlState(FormControlState.DISABLED);
    }
  }

  private updateFormControlState(state: FormControlState) {
    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        // NOTE:
        // - emitEvent = true is necessary so that obj.readonly can be kept in-sync
        // - onlySelf = true is necessary to prevent valueChange events for every single field
        if (state === FormControlState.DISABLED) {
          if (control.enabled) {
            control.disable({emitEvent: true, onlySelf: true});
          }
        } else {
          if (control.disabled) {
            control.enable({emitEvent: true, onlySelf: true});
          }
        }
      });
  }

  private link(address: any): void {
    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        control.setValue(address[field], {emitEvent: false});
      });
    this.updateFormControlState(FormControlState.DISABLED);
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  private unlink() {
    this.updateFormControlState(FormControlState.ENABLED);
    this.formGroup.get(this.config.mapping.id).setValue(null, {emitEvent: false});
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }
}
