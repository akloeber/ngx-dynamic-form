import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {PropSimpleComponent} from './prop-simple/prop-simple.component';
import {PropArrayComponent} from './prop-array/prop-array.component';
import {PropComplexComponent} from './prop-complex/prop-complex.component';
import { AddressPickerComponent } from './control-nationality-picker/address-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    PropSimpleComponent,
    PropArrayComponent,
    PropComplexComponent,
    AddressPickerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
