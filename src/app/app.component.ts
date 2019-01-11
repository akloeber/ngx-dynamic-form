import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFModel, SFSchema} from './schema-types';
import {SchemaFormComponent} from './schema-form/schema-form.component';
import {collectErrors} from './form-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    SchemaFormBuilderService,
  ]
})
export class AppComponent implements OnInit {

  @ViewChild(SchemaFormComponent) schemaForm: SchemaFormComponent;

  readonlyMode = false;
  schema: SFSchema;
  initialModel: SFModel;
  formModel: SFModel;
  readonlyModel: SFModel;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.schema = SCHEMA;
    this.initialModel = MODEL;
    this.readonlyModel = MODEL;

    this.schemaForm.dirtyChanged.subscribe(dirty => {
      console.log('dirtyChanged', dirty);
    });
    this.schemaForm.statusChanged.subscribe(dirty => {
      console.log('statusChanged', dirty);
    });
    this.schemaForm.modelChanged.subscribe(model => {
      console.log('modelChanged here', model);
      this.readonlyModel = model;
      this.cd.markForCheck();
    });
  }

  reloadModel() {
    if (this.initialModel !== MODEL) {
      this.initialModel = MODEL;
    } else {
      this.schemaForm.reloadModel();
    }
  }

  onModelChanged(model: SFModel): void {
    this.formModel = model;
  }

  get errors() {
    return collectErrors(this.schemaForm.rootControl);
  }
}
