import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent implements OnInit {

  @Input() config: any;

  @Output() addressPicked = new EventEmitter<any>();

  ngOnInit() {
  }

  pickAddress(): void {
    this.addressPicked.emit({
      city: 'Köln',
      street: 'Hauptstrasse',
    });
  }
}
