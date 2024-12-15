import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EntitySectionComponent } from '../../components/entity-section/entity-section.component';
import { ScheduleSelectComponent } from '../../components/schedule-select/schedule-select.component';

@Component({
  selector: 'app-create',
  imports: [ScheduleSelectComponent, MatToolbarModule, EntitySectionComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {}
