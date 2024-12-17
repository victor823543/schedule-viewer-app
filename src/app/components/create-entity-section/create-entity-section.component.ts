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

type EntityType = 'teacher' | 'group' | 'location' | 'course';

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
  private readonly FORM_CONFIG = {
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    subject: ['', Validators.required]
  };

  readonly forms: Record<EntityType, FormGroup>;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly entityService: EntityService,
    private readonly snackBar: MatSnackBar
  ) {
    // Move forms initialization to constructor
    this.forms = {
      teacher: this.createBasicForm(),
      group: this.createBasicForm(),
      location: this.createBasicForm(),
      course: this.createCourseForm()
    };
  }

  /**
   * Creates a basic form with displayName field
   */
  private createBasicForm(): FormGroup {
    return this.fb.group({
      displayName: this.FORM_CONFIG.displayName
    });
  }

  /**
   * Creates a course form with additional subject field
   */
  private createCourseForm(): FormGroup {
    return this.fb.group({
      displayName: this.FORM_CONFIG.displayName,
      subject: this.FORM_CONFIG.subject
    });
  }

  /**
   * Handles form submission for any entity type
   */
  async onSubmit(type: EntityType): Promise<void> {
    const form = this.forms[type];

    if (form.invalid) return;

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
      this.showSuccessMessage(type);
    } catch (error) {
      this.showErrorMessage();
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Gets error message for form field
   */
  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength')) return 'Minimum length is 2 characters';
    return '';
  }

  private showSuccessMessage(type: EntityType): void {
    const entityName = type.charAt(0).toUpperCase() + type.slice(1);
    this.snackBar.open(`${entityName} created successfully`, 'Close', { duration: 3000 });
  }

  private showErrorMessage(): void {
    this.snackBar.open('Error creating entity', 'Close', { duration: 3000 });
  }
}
