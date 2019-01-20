import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-view-state-monitor',
  templateUrl: './view-state-monitor.component.html',
})
export class ViewStateMonitorComponent {

  @Input() viewState: any;
}
