import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-object-monitor',
  templateUrl: './object-monitor.component.html',
})
export class ObjectMonitorComponent {

  @Input() header: string;
  @Input() obj: any;
}
