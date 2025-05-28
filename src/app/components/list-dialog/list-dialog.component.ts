import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-list-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule,CommonModule],
  templateUrl: './list-dialog.component.html',
  styleUrl: './list-dialog.component.scss'
})
export class ListDialogComponent {
  selectedData:any
 data = inject(MAT_DIALOG_DATA);
 handleItemClick(item:any){
  this.selectedData=item
 }
}
