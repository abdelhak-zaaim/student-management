import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from '../../../models/subject.model';
import { SubjectService } from '../subject.service';

@Component({
  selector: 'app-add-subject',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  subject: Subject = {
    name: '',
    description: ''
  };

  submitted = false;
  loading = false;

  constructor(
    private subjectService: SubjectService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Validate and create a new subject
   */
  createSubject(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;

    // Prepare subject data for saving
    const subjectToSave: Subject = {
      name: this.subject.name?.trim() ?? '',
      description: this.subject.description?.trim() || ''
    };

    // Create new subject
    this.subjectService.create(subjectToSave).subscribe(
      response => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Subject Created Successfully',
          life: 3000
        });

        // Navigate to list after short delay
        setTimeout(() => {
          this.router.navigate(['/subjects/list']);
        }, 1500);
      },
      error => {
        this.loading = false;
        console.error('Error creating subject:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create subject: ' + (error.message || error),
          life: 3000
        });
      }
    );
  }

  /**
   * Check if the form is valid
   */
  isFormValid(): boolean {
    // Check required fields
    if (!this.subject.name?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Subject name is required',
        life: 3000
      });
      return false;
    }

    return true;
  }

  /**
   * Reset the form
   */
  resetForm(): void {
    this.submitted = false;
    this.subject = {
      name: '',
      description: ''
    };
  }

  /**
   * Cancel and navigate back to the list
   */
  cancel(): void {
    this.router.navigate(['/subjects/list']);
  }
}
