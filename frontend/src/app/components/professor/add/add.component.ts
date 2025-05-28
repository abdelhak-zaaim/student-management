import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../professor.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-add-professor',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  professor: Professor = {
    user: {
      firstName: '',
      lastName: '',
      email: ''
    },
    subjectGroups: []
  };

  groupOptions: any[] = [];
  subjectOptions: any[] = [];
  subjectGroupRecords: { subject: any; studentGroup: any[] }[] = [];

  submitted = false;
  loading = false;

  constructor(
    private professorService: ProfessorService,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadSubjects();
    this.addSubjectGroupRecord(); // Initialize with one empty record
  }

  /**
   * Load groups for the dropdown
   */
  loadGroups(): void {
    this.loading = true;

    // Make sure we're using the correct API URL for groups
    const url = `${environment.apiBaseUrl}/student-groups`;

    this.http.get<Group[]>(url, { observe: 'response' }).subscribe(
      response => {
        this.groupOptions = response.body || [];
        console.log('Loaded groups for dropdown:', this.groupOptions);
        this.loading = false;
      },
      error => {
        console.error('Error loading groups:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load groups: ' + (error.message || error),
          life: 3000
        });
        this.loading = false;
      }
    );
  }

  /**
   * Load subjects for the dropdown
   */
  loadSubjects(): void {
    this.loading = true;

    // Make sure we're using the correct API URL for subjects
    const url = `${environment.apiBaseUrl}/subjects`;

    this.http.get<any[]>(url, { observe: 'response' }).subscribe(
      response => {
        this.subjectOptions = response.body || [];
        console.log('Loaded subjects for dropdown:', this.subjectOptions);
        this.loading = false;
      },
      error => {
        console.error('Error loading subjects:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load subjects: ' + (error.message || error),
          life: 3000
        });
        this.loading = false;
      }
    );
  }

  /**
   * Add a new subject-group record
   */
  addSubjectGroupRecord(): void {
    this.subjectGroupRecords.push({ subject: null, studentGroup: [] });
  }

  /**
   * Remove a subject-group record at the given index
   */
  removeSubjectGroupRecord(index: number): void {
    this.subjectGroupRecords.splice(index, 1);

    // Ensure we always have at least one record
    if (this.subjectGroupRecords.length === 0) {
      this.addSubjectGroupRecord();
    }
  }

  /**
   * Validate and create a new professor
   */
  createProfessor(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    // Prepare professor data for saving
    const professorToSave: Professor = {
      user: {
        firstName: this.professor.user?.firstName?.trim(),
        lastName: this.professor.user?.lastName?.trim(),
        email: this.professor.user?.email?.trim() || '' // Email is optional
      },
      subjectGroups: this.subjectGroupRecords
        .filter(record => record.subject && record.studentGroup.length > 0)
        .map(record => ({
          subject: record.subject,
          studentGroup: record.studentGroup
        }))
    };

    // Create new professor
    this.professorService.create(professorToSave).subscribe(
      response => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Professor Created Successfully',
          life: 3000
        });

        // Navigate to list after short delay
        setTimeout(() => {
          this.router.navigate(['/profs/list']);
        }, 1500);
      },
      error => {
        this.loading = false;
        console.error('Error creating professor:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create professor: ' + (error.message || error),
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
    if (!this.professor.user?.firstName?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'First name is required',
        life: 3000
      });
      return false;
    }

    if (!this.professor.user?.lastName?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Last name is required',
        life: 3000
      });
      return false;
    }

    // Validate email if provided (not required)
    if (this.professor.user?.email && !this.isEmailValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid email address',
        life: 3000
      });
      return false;
    }

    // Validate subject-group records
    // At least one valid record is required
    const hasValidRecord = this.subjectGroupRecords.some(
      record => record.subject && record.studentGroup.length > 0
    );

    if (!hasValidRecord) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'At least one subject and group assignment is required',
        life: 3000
      });
      return false;
    }

    return true;
  }

  /**
   * Check if the email is valid
   */
  isEmailValid(): boolean {
    const email = this.professor.user?.email;
    if (!email || email.trim() === '') return true; // Empty email is valid (as it's optional)

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Reset the form
   */
  resetForm(): void {
    this.submitted = false;
    this.professor = {
      user: {
        firstName: '',
        lastName: '',
        email: ''
      },
      subjectGroups: []
    };
    this.subjectGroupRecords = [{ subject: null, studentGroup: [] }];
  }

  /**
   * Cancel and navigate back to the list
   */
  cancel(): void {
    this.router.navigate(['/profs/list']);
  }
}
