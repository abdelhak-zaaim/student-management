import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { User } from '../../../models/user.model';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ListComponent implements OnInit {
  admins: User[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admins', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load admin users'
        });
        this.loading = false;
      }
    });
  }

  addAdmin(): void {
    this.router.navigate(['/admin/add']);
  }

  editAdmin(admin: User): void {
    this.router.navigate(['/admin/edit', admin.login]);
  }

  deleteAdmin(admin: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete admin ${admin.firstName} ${admin.lastName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (admin.id) {
          this.adminService.deleteAdmin(admin.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Admin deleted successfully'
              });
              this.loadAdmins();
            },
            error: (error) => {
              console.error('Error deleting admin', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete admin'
              });
            }
          });
        }
      }
    });
  }
}
