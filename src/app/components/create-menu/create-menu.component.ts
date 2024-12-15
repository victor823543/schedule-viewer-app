import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CreateEventDialogComponent } from '../create-event-dialog/create-event-dialog.component';

@Component({
  selector: 'app-create-menu',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './create-menu.component.html',
  styleUrls: ['./create-menu.component.scss']
})
export class CreateMenuComponent {
  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  navigateToCreate() {
    this.router.navigate(['/create']);
  }

  openCreateEventDialog() {
    this.dialog.open(CreateEventDialogComponent);
  }
}
