import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TrackingService } from '../../../core/services/tracking/tracking.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { hideLoading, showLoading } from '../../../store/loader/action';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AddUserComponent } from '../components/addUser/add-user/add-user.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationServiceService } from '../../../core/services/notification/notification-service.service';
import { MatMenuModule } from '@angular/material/menu';
import { UserManagementService } from '../../../core/services/user-management/user-management.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, of, startWith } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = [
    'userName',
    'email',
    'phoneNumber',
    'groupName',
    'action',
    'extra',
  ];
  dataSource: MatTableDataSource<any> | undefined;

  userApprovalDataSource: MatTableDataSource<any> | undefined;
  userRejectedDataSource: MatTableDataSource<any> | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  trackingService = inject(TrackingService);
  userManagementService = inject(UserManagementService);
  authService = inject(AuthService);
  notificationService = inject(NotificationServiceService);
  selectedTabIndex: number = 0;
  store = inject(Store);
  dialog = inject(MatDialog);

  myControl = new FormControl('');
  vendorOptions: any[] = [];
  filteredOptions: Observable<any[]>;

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.vendorOptions.filter((option) =>
      option?.name.toLowerCase().includes(filterValue)
    );
  }

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }
  ngOnInit(): void {
    this.getUsers();
    this.getVendorList();
  }

  getVendorList() {
    this.userManagementService.getVendors().subscribe({
      next: (response) => {
        this.vendorOptions = response;
      },
      error: (error) => {
        console.log('error fetching vendor list', error);
      },
    });
  }

  getUsers() {
    this.store.dispatch(showLoading());
    this.userManagementService.getApprovedUserList().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response);

        console.log(this.dataSource);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }

  ngAfterViewInit() {
    // if(this.dataSource){
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!this.dataSource) return;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  handleChangeTab(value: any) {
    console.log(value, 'tab');
    this.selectedTabIndex = value.index;
    if (value.index === 0) {
      if (!this.dataSource) {
        this.getUsers();
      }
    } else if (value.index === 1) {
      if (!this.userApprovalDataSource) {
        this.getUserApprovalList();
      }
    } else if (value.index === 2) {
      if (!this.userRejectedDataSource) {
        this.getUserRejectedList();
      }
    }
  }

  getUserApprovalList() {
    this.store.dispatch(showLoading());
    this.userManagementService.getUserApprovalList().subscribe({
      next: (response) => {
        this.userApprovalDataSource = new MatTableDataSource(response);

        console.log(this.userApprovalDataSource);
        this.userApprovalDataSource.paginator = this.paginator;
        this.userApprovalDataSource.sort = this.sort;
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }
  getUserRejectedList() {
    this.store.dispatch(showLoading());
    this.userManagementService.getUserRejectedList().subscribe({
      next: (response) => {
        this.userRejectedDataSource = new MatTableDataSource(response);

        console.log(this.userRejectedDataSource);
        this.userRejectedDataSource.paginator = this.paginator;
        this.userRejectedDataSource.sort = this.sort;
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }

  handleUserApproval(value: any) {
    console.log('app', value);
    const payload = {
      email: value.email,
    };
    this.store.dispatch(showLoading());
    this.userManagementService.approveUser(payload).subscribe({
      next: (response) => {
        if (this.selectedTabIndex === 1) {
          this.userApprovalDataSource = undefined;
          this.getUserApprovalList();
        }
        if (this.selectedTabIndex === 2) {
          this.userRejectedDataSource = undefined;
          this.getUserRejectedList();
        }
        this.dataSource = undefined;
        this.getUsers();
        this.notificationService.showNotification('User Approved', 5);
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }

  handleUserReject(value: any) {
    const payload = {
      email: value.email,
    };
    this.store.dispatch(showLoading());
    this.userManagementService.rejectUser(payload).subscribe({
      next: (response) => {
        this.userApprovalDataSource = undefined;
        this.getUserApprovalList();
        this.userRejectedDataSource = undefined;
        this.getUserRejectedList();
        this.store.dispatch(hideLoading());
        this.notificationService.showNotification('User Rejected', 5);
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }

  handleUserDelete(value: any) {}

  handleTrackingStatusChange(value: any) {
    const payload = {
      email: value.email,
      IsTrackingEnabled: !value.isTrackingEnabled,
    };
    this.store.dispatch(showLoading());
    this.userManagementService.enableUserTracking(payload).subscribe({
      next: (response) => {
        this.dataSource = undefined;
        this.getUsers();
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error fecthing entities list', error);
      },
    });
  }

  handleAddUser() {
    const dialog = this.dialog.open(AddUserComponent);

    dialog.afterClosed().subscribe((result) => {
      console.log('allre sult of form', result);
      if (result) {
        this.AddUser(result);
      }
    });
  }

  AddUser(value: any) {
    const payload = { ...value, role: 'user' };
    this.authService.handleRegisterRequest(payload).subscribe({
      next: (response: any) => {
        this.userApprovalDataSource = undefined;
        this.getUserApprovalList();
        this.notificationService.showNotification('User Added', 5);
      },
      error: (error: any) => {
        this.notificationService.showNotification(error?.error, 5);
        console.log('error in register', error);
      },
    });
  }
}
