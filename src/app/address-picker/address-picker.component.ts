import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent {

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
      this.link();
    }
  }

  private link(): void {
    const address = {
      id: 123,
      city: 'Köln',
      street: 'Hauptstrasse',
    };

    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        control.setValue(address[field], {emitEvent: false});
        control.disable({emitEvent: false});
      });
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  private unlink() {
    this.formGroup.get(this.config.mapping.id).setValue(null, {emitEvent: false});

    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        control.enable({emitEvent: false});
      });
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }
}