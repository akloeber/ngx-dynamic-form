import {Component, OnInit, ViewChild} from '@angular/core';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFModel, SFSchema} from './schema-types';
import {SchemaFormComponent} from './schema-form/schema-form.component';
import {collectErrors, FormControlStatus} from './form-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    SchemaFormBuilderService,
  ]
})
export class AppComponent implements OnInit {

  @ViewChild('editor') schemaFormEditor: SchemaFormComponent;
  @ViewChild('view') schemaFormView: SchemaFormComponent;

  readonlyMode = false;
  hideEmpty = true;
  schema: SFSchema;
  initialModel: SFModel;
  formModel: SFModel;
  readonlyModel: SFModel;
  status: FormControlStatus;

  constructor() {
  }

  ngOnInit(): void {
    this.schema = SCHEMA;
    this.initialModel = MODEL;
    this.readonlyModel = MODEL;

    this.schemaFormEditor.dirtyChanged.subscribe(dirty => {
      console.log('dirtyChanged event', dirty);
    });
    this.schemaFormEditor.statusChanged.subscribe(status => {
      console.log('statusChanged event', status);
      if (status === FormControlStatus.INVALID) {
        console.log('errors', this.schemaFormEditor.collectErrors());
      }
    });
    this.schemaFormEditor.modelChanged.subscribe(model => {
      console.log('modelChanged event', model);
      this.readonlyModel = model;
    });
  }

  reloadModel() {
    if (this.initialModel !== MODEL) {
      this.initialModel = MODEL;
    } else {
      this.schemaFormEditor.reloadModel();
    }
  }

  onModelChanged(model: SFModel): void {
    this.formModel = model;
  }

  onStatusChanged(status: FormControlStatus) {
    this.status = status;
  }

  onShowErrors() {
    const errors = this.schemaFormEditor.collectErrors();
    alert(errors ? JSON.stringify(errors, null, 2) : 'OK');
  }

  test() {
  }
}
