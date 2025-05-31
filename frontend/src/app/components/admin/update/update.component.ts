import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminService } from '../admin.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
  providers: [MessageService]
})
export class UpdateComponent implements OnInit {
  adminForm: FormGroup;
  isEditMode = false;
  adminId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.adminForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.adminId = +id;
      this.loadAdmin(this.adminId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      activated: [true]
    });
  }

  private loadAdmin(id: number): void {
    this.loading = true;
    this.adminService.getAdmin(id).subscribe({
      next: (admin) => {
        this.adminForm.patchValue({
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          login: admin.login,
          activated: admin.activated
        });
        // Password field is not populated for security reasons
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admin', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load admin information'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const adminData: User = {
      ...this.adminForm.value
    };

    if (this.isEditMode && this.adminId) {
      adminData.id = this.adminId;
      // If password is empty in edit mode, remove it
      if (!adminData.password) {
        delete adminData.password;
      }

      this.adminService.updateAdmin(adminData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Admin updated successfully'
          });
          this.submitting = false;
          setTimeout(() => this.router.navigate(['/admin/list']), 1500);
        },
        error: (error) => {
          console.error('Error updating admin', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update admin'
          });
          this.submitting = false;
        }
      });
    } else {
      this.adminService.createAdmin(adminData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Admin created successfully'
          });
          this.submitting = false;
          setTimeout(() => this.router.navigate(['/admin/list']), 1500);
        },
        error: (error) => {
          console.error('Error creating admin', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create admin'
          });
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/list']);
  }
}
