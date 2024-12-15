import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CreateEntitySectionComponent } from '../../components/create-entity-section/create-entity-section.component';
import { EntitySectionComponent } from '../../components/entity-section/entity-section.component';
import { ScheduleSelectComponent } from '../../components/schedule-select/schedule-select.component';

@Component({
  selector: 'app-create',
  imports: [
    ScheduleSelectComponent,
    MatToolbarModule,
    EntitySectionComponent,
    CreateEntitySectionComponent,
    RouterModule
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {}
