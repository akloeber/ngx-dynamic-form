import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent implements OnInit {

  @Input() config: {
    mapping: Record<string, string>;
  };
  @Input() formGroup: FormGroup;

  ngOnInit(): void {
    console.log(this.config, this.formGroup);

  }

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
        control.setValue(address[field]);
        control.disable();
      });
  }

  private unlink() {
    this.formGroup.get(this.config.mapping.id).reset(null);

    Object.entries(this.config.mapping)
      .forEach(([field, target]) => {
        const control = this.formGroup.get(target);
        control.enable();
      });

  }
}
