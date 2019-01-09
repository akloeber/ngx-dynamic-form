import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFSchema} from './schema-types';

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
  rootForm: FormGroup;
  schema: SFSchema;
  viewState: any;
  viewStateSnapshot: any;

  constructor(
    private cd: ChangeDetectorRef,
    private schemaFormBuilderService: SchemaFormBuilderService,
  ) {
  }

  get formModel() {
    return this.rootForm.getRawValue();
  }

  ngOnInit(): void {
    this.viewState = {};
    this.schema = SCHEMA;
    this.rootForm = this.schemaFormBuilderService.createFormControl(this.schema, MODEL) as FormGroup;
    this.rootForm.setValue(MODEL);
  }

  resetModel() {
    this.rootForm.patchValue(MODEL);
  }

  resetViewState() {
    this.viewState = {};
  }

  ngAfterViewChecked(): void {
    this.viewStateSnapshot = JSON.parse(JSON.stringify(this.viewState));
    this.cd.detectChanges();
  }
}
