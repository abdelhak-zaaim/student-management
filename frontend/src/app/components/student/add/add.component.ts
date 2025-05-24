import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Student } from '../../../models/student.model';
import { StudentService } from '../student.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-add-student',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  student: Student = {
    user: {
      firstName: '',
      lastName: '',
      email: ''
    },
    phone: '',
    studentGroup: null
  };

  studentGroups: Group[] = [];
  submitted = false;
  loading = false;

  constructor(
    private studentService: StudentService,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  /**
   * Load all student groups for the dropdown
   */
  loadGroups(): void {
    this.loading = true;

    // Make sure we're using the correct API URL for student groups
    const url = `${environment.apiBaseUrl}/student-groups`;

    this.http.get<Group[]>(url, { observe: 'response' }).subscribe(
      response => {
        this.studentGroups = response.body || [];
        console.log('Loaded student groups for dropdown:', this.studentGroups);
        this.loading = false;
      },
      error => {
        console.error('Error loading student groups:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load student groups: ' + (error.message || error),
          life: 3000
        });
        this.loading = false;
      }
    );
  }

  /**
   * Validate and create a new student
   */
  createStudent(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    // Prepare student data for saving
    const studentToSave: Student = {
      user: {
        firstName: this.student.user?.firstName?.trim(),
        lastName: this.student.user?.lastName?.trim(),
        email: this.student.user?.email?.trim() || '' // Email is optional
      },
      phone: this.student.phone,
      studentGroup: this.student.studentGroup
    };

    // Create new student
    this.studentService.create(studentToSave).subscribe(
      response => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Student Created Successfully',
          life: 3000
        });

        // Navigate to list after short delay
        setTimeout(() => {
          this.router.navigate(['/students/list']);
        }, 1500);
      },
      error => {
        this.loading = false;
        console.error('Error creating student:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create student: ' + (error.message || error),
          life: 3000
        });
      }
    );
  }

  /**
   * Check if the form is valid
   */
  isFormValid(): boolean {
    // Check name fields
    if (!this.student.user?.firstName?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'First name is required',
        life: 3000
      });
      return false;
    }

    if (!this.student.user?.lastName?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Last name is required',
        life: 3000
      });
      return false;
    }

    // Validate phone number
    if (!this.student.phone) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Phone number is required',
        life: 3000
      });
      return false;
    }

    if (!this.isValidPhone(this.student.phone)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Phone must be 10 digits and start with 06 or 07',
        life: 3000
      });
      return false;
    }

    // Validate email if provided (not required)
    if (this.student.user?.email && !this.isEmailValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid email address',
        life: 3000
      });
      return false;
    }

    return true;
  }

  /**
   * Validates that a phone number has exactly 10 digits and starts with 06 or 07
   */
  isValidPhone(phone: string | null | undefined): boolean {
    if (!phone) return false;

    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it's exactly 10 digits
    if (digitsOnly.length !== 10) return false;

    // Check if it starts with 06 or 07
    return digitsOnly.startsWith('06') || digitsOnly.startsWith('07');
  }

  /**
   * Check if phone starts with valid prefix (06 or 07)
   */
  hasValidPhonePrefix(phone: string | null | undefined): boolean {
    if (!phone || phone.length < 2) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.startsWith('06') || digitsOnly.startsWith('07');
  }

  /**
   * Filter phone input to only allow valid phone formats
   */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Check prefix - if there are at least 2 digits and they're not 06 or 07
    if (digitsOnly.length >= 2 && !digitsOnly.startsWith('06') && !digitsOnly.startsWith('07')) {
      // If user is typing a new number, auto-correct to start with 06
      if (digitsOnly.length === 2) {
        const corrected = '06';
        input.value = corrected;
        this.student.phone = corrected;
        return;
      }
    }

    // Update the input value if it changed
    if (digitsOnly !== value) {
      input.value = digitsOnly;
      // Update the model
      this.student.phone = digitsOnly;
    }

    // Enforce 10 digit max
    if (digitsOnly.length > 10) {
      input.value = digitsOnly.substring(0, 10);
      this.student.phone = digitsOnly.substring(0, 10);
    }
  }

  /**
   * Check if the email is valid
   */
  isEmailValid(): boolean {
    const email = this.student.user?.email;
    if (!email || email.trim() === '') return true; // Empty email is valid (as it's optional)

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Reset the form
   */
  resetForm(): void {
    this.submitted = false;
    this.student = {
      user: {
        firstName: '',
        lastName: '',
        email: ''
      },
      phone: '',
      studentGroup: null
    };
  }

  /**
   * Cancel and navigate back to the list
   */
  cancel(): void {
    this.router.navigate(['/students/list']);
  }
}
