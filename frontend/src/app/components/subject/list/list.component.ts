import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject } from '../../../models/subject.model';
import { SubjectService } from '../subject.service';

@Component({
  selector: 'app-subject-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  subjects: Subject[] | null = null;
  subject: Subject = { name: '', description: '' };
  selectedSubjects: Subject[] = [];

  subjectDialog = false;
  deleteSubjectDialog = false;
  deleteSubjectsDialog = false;
  submitted = false;
  loading = false;
  cols: any[] = [];

  constructor(
    private subjectService: SubjectService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSubjects();

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' }
    ];
  }

  /**
   * Load all subjects from the server
   */
  loadSubjects(): void {
    this.loading = true;

    this.subjectService.findAll().subscribe(
      response => {
        this.subjects = response.body || [];
        console.log('Loaded subjects:', this.subjects);
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
   * Open dialog to create a new subject
   */
  openNew(): void {
    this.subject = { name: '', description: '' };
    this.submitted = false;
    this.subjectDialog = true;
  }

  /**
   * Open dialog to edit an existing subject
   */
  editSubject(subject: Subject): void {
    this.subject = { ...subject };
    this.subjectDialog = true;
  }

  /**
   * Delete a subject after confirmation
   */
  deleteSubject(subject: Subject): void {
    this.deleteSubjectDialog = true;
    this.subject = { ...subject };
  }

  /**
   * Confirm single subject deletion
   */
  confirmDelete(): void {
    this.deleteSubjectDialog = false;

    if (this.subject.id) {
      this.loading = true;

      this.subjectService.delete(this.subject.id).subscribe(
        () => {
          this.subjects = this.subjects!.filter(val => val.id !== this.subject.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Subject Deleted',
            life: 3000
          });
          this.subject = { name: '', description: '' };
          this.loading = false;
        },
        error => {
          console.error('Error deleting subject:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete subject: ' + (error.message || error),
            life: 3000
          });
          this.loading = false;
        }
      );
    }
  }

  /**
   * Open dialog to delete selected subjects
   */
  deleteSelectedSubjects(): void {
    this.deleteSubjectsDialog = true;
  }

  /**
   * Confirm multiple subject deletion
   */
  confirmDeleteSelected(): void {
    this.deleteSubjectsDialog = false;
    this.loading = true;

    const deletePromises: Promise<any>[] = [];

    this.selectedSubjects.forEach(subject => {
      if (subject.id) {
        const deletePromise = new Promise<void>((resolve, reject) => {
          this.subjectService.delete(subject.id!).subscribe(
            () => resolve(),
            error => reject(error)
          );
        });
        deletePromises.push(deletePromise);
      }
    });

    Promise.all(deletePromises)
      .then(() => {
        this.subjects = this.subjects!.filter(
          subject => !this.selectedSubjects.some(selected => selected.id === subject.id)
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Subjects Deleted',
          life: 3000
        });

        this.selectedSubjects = [];
        this.loading = false;
      })
      .catch(error => {
        console.error('Error deleting subjects:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete subjects: ' + (error.message || error),
          life: 3000
        });
        this.loading = false;
      });
  }

  /**
   * Hide the subject dialog
   */
  hideDialog(): void {
    this.subjectDialog = false;
    this.submitted = false;
  }

  /**
   * Save a new or existing subject
   */
  saveSubject(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.subject.name?.trim()) {
      return;
    }

    this.loading = true;

    // Clone the subject to avoid modifying the displayed object
    const subjectToSave: Subject = {
      id: this.subject.id,
      name: this.subject.name.trim(),
      description: this.subject.description?.trim()
    };

    if (subjectToSave.id) {
      // Update existing subject
      this.subjectService.update(subjectToSave).subscribe(
        response => {
          let updatedSubject = response.body || subjectToSave;

          const index = this.findIndexById(subjectToSave.id!);
          if (index !== -1 && this.subjects) {
            this.subjects[index] = updatedSubject;
          } else {
            this.loadSubjects();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Subject Updated',
            life: 3000
          });

          this.subjectDialog = false;
          this.subject = { name: '', description: '' };
          this.loading = false;
        },
        error => {
          console.error('Error updating subject:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update subject: ' + (error.message || error),
            life: 3000
          });
          this.loading = false;
        }
      );
    } else {
      // Create new subject
      this.subjectService.create(subjectToSave).subscribe(
        response => {
          const newSubject = response.body || subjectToSave;

          if (this.subjects) {
            this.subjects.push(newSubject);
          } else {
            this.loadSubjects();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Subject Created',
            life: 3000
          });

          this.subjectDialog = false;
          this.subject = { name: '', description: '' };
          this.loading = false;
        },
        error => {
          console.error('Error creating subject:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create subject: ' + (error.message || error),
            life: 3000
          });
          this.loading = false;
        }
      );
    }
  }

  /**
   * Find the index of a subject by its ID
   */
  findIndexById(id: number): number {
    if (!this.subjects) return -1;
    return this.subjects.findIndex(subject => subject.id === id);
  }

  /**
   * Apply global filter to the data table
   */
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Navigate to create new subject page
   */
  navigateToAdd(): void {
    this.router.navigate(['/subjects/add']);
  }
}
