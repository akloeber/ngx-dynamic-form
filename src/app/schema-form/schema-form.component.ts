import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SFModel, SFPropComplex, SFSchema} from '../schema-types';
import {SchemaFormBuilderService} from '../schema-form-builder.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {collectErrors, collectModel, FormControlStatus} from '../form-utils';
import {PropComplexViewState} from 'src/app/prop-complex/prop-complex-view-state';

function connectEventEmitter<T>(o: Observable<T>, e: EventEmitter<T>): Subscription {
  return o.subscribe(
    v => e.next(v)
  );
}

@Component({
  selector: 'app-schema-form',
  templateUrl: './schema-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFormComponent implements OnChanges, OnDestroy {

  @Input() id: string;
  @Input() schema: SFSchema;
  @Input() model: SFModel = null;
  @Input() readonlyMode = false;
  @Input() hideEmpty = false;

  @Output() dirtyChanged = new EventEmitter<boolean>(true);
  @Output() statusChanged = new EventEmitter<FormControlStatus>(true);
  @Output() modelChanged = new EventEmitter<SFModel>(true);

  rootControl: FormGroup | null = null;
  viewState: PropComplexViewState | null;
  private dirtySignal = new BehaviorSubject<boolean>(false);
  private statusChangeSignal = new BehaviorSubject<FormControlStatus>(null);
  private modelChangeSignal = new BehaviorSubject<any>(null);

  private valueChangesSubscription: Subscription;
  private statusChangesSubscription: Subscription;
  private subscriptions: Subscription[] = [];

  constructor(
    private schemaFormBuilderService: SchemaFormBuilderService,
  ) {
    this.subscriptions.push(
      connectEventEmitter(this.dirtySignal.pipe(distinctUntilChanged()), this.dirtyChanged),
      connectEventEmitter(this.statusChangeSignal.pipe(distinctUntilChanged()), this.statusChanged),
      connectEventEmitter(this.modelChangeSignal.pipe(distinctUntilChanged()), this.modelChanged),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      if (this.schema) {
        this.viewState = new PropComplexViewState(this.schema as SFPropComplex); // reset view state
      } else {
        this.viewState = null;
      }
    }

    if (changes.model || changes.schema) {
      // schema and model available
      this.reloadModel();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeControlObservers();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Can be used to force reloading of input model.
   */
  reloadModel() {
    if (this.rootControl) {
      // clear old form
      this.unsubscribeControlObservers();
      this.rootControl = null;
    }

    if (this.model && this.schema) {
      // model and schema available
      this.rootControl = this.schemaFormBuilderService.createFormControl(this.schema, this.model) as FormGroup;

      this.rootControl.patchValue(this.model);

      this.valueChangesSubscription = this.rootControl.valueChanges.subscribe(value => {
        this.dirtySignal.next(this.rootControl.dirty);
        this.publishModel();
      });

      this.statusChangesSubscription = this.rootControl.statusChanges.subscribe((status: FormControlStatus) => {
        this.publishStatus(status);
      });

      // publish initial model and status once
      this.publishModel();
      this.publishStatus(this.rootControl.status as FormControlStatus);
    }
  }

  private publishModel(): void {
    this.modelChangeSignal.next(collectModel(this.rootControl, this.schema));
  }

  private publishStatus(status: FormControlStatus): void {
    this.statusChangeSignal.next(status);
  }

  private unsubscribeControlObservers(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
      this.valueChangesSubscription = null;
    }
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
      this.statusChangesSubscription = null;
    }
  }

  collectErrors(): any | null {
    return collectErrors(this.rootControl);
  }
}
