import {Component, OnInit, ViewChild} from '@angular/core';
import {SchemaFormBuilderService} from './schema-form-builder.service';
import {MODEL} from './model';
import {SCHEMA} from './schema';
import {SFModel, SFSchema} from './schema-types';
import {SchemaFormComponent} from './schema-form/schema-form.component';

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
  model: SFModel;
  formModel: SFModel;
  errorsSnapshot: any;

  constructor(
  ) {}

  ngOnInit(): void {
    this.schema = SCHEMA;
    this.model = MODEL;

    this.schemaForm.dirtyChanged.subscribe(dirty => {
      console.log('dirtyChanged', dirty);
    });
    this.schemaForm.statusChanged.subscribe(dirty => {
      console.log('statusChanged', dirty);
    });
    this.schemaForm.modelChanged.subscribe(model => {
      console.log('modelChanged', JSON.stringify(model, null, 2));
    });
  }

  reloadModel() {
    if (this.model !== MODEL) {
      this.model = MODEL;
    } else {
      this.schemaForm.loadModel();
    }
  }

  onModelChanged(model: SFModel): void {
    this.formModel = model;
  }

}
