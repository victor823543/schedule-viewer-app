import { CommonModule } from '@angular/common';
import { Component, OnDestroy, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Subscription } from 'rxjs';

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
    MatButtonModule,
    MatTimepickerModule,
    CommonModule
  ],
  templateUrl: './event-time-form.component.html',
  styleUrl: './event-time-form.component.scss'
})
export class EventTimeFormComponent implements OnDestroy {
  timeSelected = output<EventTime>();
  timeForm: FormGroup;
  private startTimeSubscription = new Subscription();

  minTime = '07:00';
  maxTime = '18:00';

  constructor(private fb: FormBuilder) {
    const initialTime = new Date();
    initialTime.setHours(9, 0, 0, 0);
    const maxTime = new Date();
    maxTime.setHours(17, 30, 0, 0);
    const minTime = new Date();
    minTime.setHours(7, 0, 0, 0);

    const maxEndTime = new Date();
    maxEndTime.setHours(18, 0, 0, 0);

    this.timeForm = this.fb.group({
      date: [new Date(), Validators.required],
      startTime: [
        initialTime,
        [Validators.required, this.minTimeValidator(minTime), this.maxTimeValidator(maxTime)]
      ],
      duration: [60, [Validators.required, Validators.min(15), this.durationMaxEndTimeValidator()]]
    });

    // Subscribe to startTime changes and make sure duration is validated
    this.startTimeSubscription.add(
      this.timeForm.get('startTime')?.valueChanges.subscribe(() => {
        const durationControl = this.timeForm.get('duration');
        if (durationControl) {
          durationControl.markAsTouched();
          durationControl.markAsDirty();
          durationControl.updateValueAndValidity();
        }
      })
    );

    // Add subscription to form value changes
    this.startTimeSubscription.add(
      this.timeForm.valueChanges.subscribe(() => {
        const formValue = this.timeForm.value;
        const date = new Date(formValue.date);
        const startTimeValue = formValue.startTime;

        const start = new Date(date);
        const hours = startTimeValue.getHours();
        const minutes = startTimeValue.getMinutes();
        start.setHours(hours, minutes, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + formValue.duration);

        this.timeSelected.emit({
          start,
          end,
          duration: formValue.duration
        });
      })
    );
  }

  ngOnDestroy() {
    if (this.startTimeSubscription) {
      this.startTimeSubscription.unsubscribe();
    }
  }

  maxTimeValidator(maxTime: Date) {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedTime = new Date(control.value);
      return selectedTime > maxTime ? { maxTime: { value: control.value } } : null;
    };
  }

  minTimeValidator(minTime: Date) {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedTime = new Date(control.value);
      return selectedTime < minTime ? { minTime: { value: control.value } } : null;
    };
  }

  durationMaxEndTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control && control.parent) {
        const startTimeControl = control.parent.get('startTime');
        if (startTimeControl) {
          const startTimeValue = startTimeControl.value;
          const durationValue = control.value;
          const maxEndTime = new Date();
          maxEndTime.setHours(18, 0, 0, 0);

          if (startTimeValue && durationValue !== null) {
            const hours = startTimeValue.getHours();
            const minutes = startTimeValue.getMinutes();
            const startTime = new Date();
            startTime.setHours(hours, minutes, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + durationValue);

            if (endTime > maxEndTime) {
              return { maxEndTime: true };
            }
          }
        }
      }
      return null;
    };
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };
}
