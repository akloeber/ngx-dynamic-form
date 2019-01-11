import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFModel, SFSchema} from './schema-types';
import {SchemaFormComponent} from './schema-form/schema-form.component';
import {collectErrors, FormControlStatus} from './form-utils';
import {AbstractControl} from '@angular/forms';

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

  constructor(
  ) {}

  ngOnInit(): void {
    this.schema = SCHEMA;
    this.initialModel = MODEL;
    this.readonlyModel = MODEL;

    this.schemaFormEditor.dirtyChanged.subscribe(dirty => {
      console.log('dirtyChanged', dirty);
    });
    this.schemaFormEditor.statusChanged.subscribe(dirty => {
      console.log('statusChanged', dirty);
    });
    this.schemaFormEditor.modelChanged.subscribe(model => {
      console.log('modelChanged', model);
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
    alert(JSON.stringify(collectErrors(this.schemaFormEditor.rootControl), null, 2));
  }
}
