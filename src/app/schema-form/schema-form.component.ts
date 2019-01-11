import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SFModel, SFSchema} from '../schema-types';
import {SchemaFormBuilderService} from '../schema-form-builder.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {collectErrors, FormControlStatus} from '../form-utils';

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

  @Input() schema: SFSchema;
  @Input() model: SFModel = null;
  @Input() readonlyMode = false;

  @Output() dirtyChanged = new EventEmitter<boolean>(true);
  @Output() statusChanged = new EventEmitter<FormControlStatus>(true);
  @Output() modelChanged = new EventEmitter<SFModel>(true);

  rootControl: FormGroup | null = null;
  viewState: any = {};
  private valueChangesSubscription: Subscription;
  private dirtySignal = new BehaviorSubject<boolean>(false);
  private statusChangeSignal = new BehaviorSubject<FormControlStatus>(null);
  private modelChangeSignal = new BehaviorSubject<any>(null);
  private subscriptions: Subscription[] = [];

  constructor(private schemaFormBuilderService: SchemaFormBuilderService) {
    this.subscriptions.push(
      connectEventEmitter(this.dirtySignal.pipe(distinctUntilChanged()), this.dirtyChanged),
      connectEventEmitter(this.statusChangeSignal.pipe(distinctUntilChanged()), this.statusChanged),
      connectEventEmitter(this.modelChangeSignal.pipe(distinctUntilChanged()), this.modelChanged),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.viewState = {}; // reset view state
    }

    if (changes.model || changes.schema) {
      // schema and model available
      this.reloadModel();
    }
  }

  private unsubscribeValueObserver(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
      this.valueChangesSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeValueObserver();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Can be used to force reloading of input model.
   */
  reloadModel() {
    if (this.rootControl) {
      // clear old form
      this.unsubscribeValueObserver();
      this.rootControl = null;
    }

    if (this.model && this.schema) {
      // model available and schema available
      this.rootControl = this.schemaFormBuilderService.createFormControl(this.schema, this.viewState, this.model) as FormGroup;
      console.log('HERE viewState', this.viewState);

      this.valueChangesSubscription = this.rootControl.valueChanges.subscribe(value => {

        this.dirtySignal.next(this.rootControl.dirty);
        this.modelChangeSignal.next(this.rootControl.getRawValue());
      });
      this.valueChangesSubscription = this.rootControl.statusChanges.subscribe((status: FormControlStatus) => {
        this.statusChangeSignal.next(status);
      });

      this.rootControl.setValue(this.model);
    }
  }
}
