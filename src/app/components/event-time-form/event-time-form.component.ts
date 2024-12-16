import { Component, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

type EventTime = {
  start: Date;
  end: Date;
  duration: number;
};

@Component({
  selector: 'app-event-time-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './event-time-form.component.html',
  styleUrl: './event-time-form.component.scss'
})
export class EventTimeFormComponent {
  timeSelected = output<EventTime>();
  timeForm: FormGroup;

  minTime = '07:00';
  maxTime = '18:00';

  constructor(private fb: FormBuilder) {
    this.timeForm = this.fb.group({
      date: [new Date(), Validators.required],
      startTime: ['09:00', [Validators.required]],
      duration: [30, [Validators.required, Validators.min(5), Validators.max(660)]]
    });
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  onSubmit() {
    if (this.timeForm.valid) {
      const formValue = this.timeForm.value;
      const date = new Date(formValue.date);
      const [hours, minutes] = formValue.startTime.split(':');

      const start = new Date(date);
      start.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + formValue.duration);

      this.timeSelected.emit({
        start,
        end,
        duration: formValue.duration
      });
    }
  }
}
