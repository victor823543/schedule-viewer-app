import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { lastValueFrom } from 'rxjs';
import { EntityService } from '../../services/entity.service';

@Component({
  selector: 'app-create-entity-section',
  imports: [
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './create-entity-section.component.html',
  styleUrl: './create-entity-section.component.scss'
})
export class CreateEntitySectionComponent {
  teacherForm: FormGroup;
  groupForm: FormGroup;
  locationForm: FormGroup;
  courseForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private entityService: EntityService,
    private snackBar: MatSnackBar
  ) {
    this.teacherForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.groupForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.locationForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.courseForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      subject: ['', Validators.required]
    });
  }

  async onSubmit(type: 'teacher' | 'group' | 'location' | 'course') {
    let form: FormGroup;
    switch (type) {
      case 'teacher':
        form = this.teacherForm;
        break;
      case 'group':
        form = this.groupForm;
        break;
      case 'location':
        form = this.locationForm;
        break;
      case 'course':
        form = this.courseForm;
        break;
    }

    if (form.invalid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await lastValueFrom(
        this.entityService.createEntity({
          type,
          displayName: form.get('displayName')?.value,
          ...(type === 'course' ? { subject: form.get('subject')?.value } : {})
        })
      );

      form.reset();

      this.snackBar.open(
        `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
        'Close',
        { duration: 3000 }
      );
    } catch (error) {
      this.snackBar.open('Error creating entity', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting = false;
    }
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum length is 2 characters';
    }
    return '';
  }
}
