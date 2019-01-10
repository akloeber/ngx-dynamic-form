import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, Form, FormGroup} from '@angular/forms';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFSchema} from './schema-types';
import {collectErrors} from './form-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    SchemaFormBuilderService,
  ]
})
export class AppComponent implements OnInit, AfterViewChecked {

  title = 'ngx-dynamic-form';
  readonly = false;
  rootControl: FormGroup;
  schema: SFSchema;
  viewState: any;
  viewStateSnapshot: any;

  constructor(
    private cd: ChangeDetectorRef,
    private schemaFormBuilderService: SchemaFormBuilderService,
  ) {
  }

  get formModel() {
    return this.rootControl.getRawValue();
  }

  ngOnInit(): void {
    this.viewState = {};
    this.schema = SCHEMA;
    this.rootControl = this.schemaFormBuilderService.createFormControl(this.schema, MODEL) as FormGroup;
    this.rootControl.setValue(MODEL);

    setInterval(() => {
      console.log(this.rootControl.invalid, collectErrors(this.rootControl));
    }, 2000);
  }

  resetModel() {
    this.rootControl.patchValue(MODEL);
  }

  resetViewState() {
    this.viewState = {};
  }

  ngAfterViewChecked(): void {
    this.viewStateSnapshot = JSON.parse(JSON.stringify(this.viewState));
    this.cd.detectChanges();
  }
}
