import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

const MODEL = {
  name: 'Max Mustermann',
  age: 42,
  birthday: '1990-12-21',
  address: {
    city: 'Bonn',
    street: 'Adenauerallee'
  }
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'ngx-dynamic-form';
  rootForm: FormGroup;
  viewModel = {
    address: {
      expanded: true,
    },
  };

  constructor() {
    this.rootForm = new FormGroup({
      name: new FormControl(undefined),
      age: new FormControl(undefined),
      birthday: new FormControl(undefined),
      address: new FormGroup({
        city: new FormControl(undefined),
        street: new FormControl(undefined),
      })
    });
  }

  ngOnInit(): void {
    this.resetModel();
  }

  resetModel() {
    this.rootForm.reset(MODEL);
  }

  clearModel() {
    this.rootForm.reset();
  }
}
