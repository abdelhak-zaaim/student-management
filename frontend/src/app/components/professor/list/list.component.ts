import { Component, OnInit } from '@angular/core';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../professor.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { GroupService } from "../../group/group.service";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [GroupService]
})
export class ListComponent implements OnInit {
  professors: Professor[] | null = null;
  professor: Professor = { user: { firstName: '', lastName: '', email: '' } };
  selectedProfessors: Professor[] = [];
  professorGroups: any[] = []; // Replace with proper type if available

  professorDialog = false;
  deleteProfessorDialog = false;
  deleteProfessorsDialog = false;
  submitted = false;
  cols: any[] = [];

  groupOptions: any[] = [];
  subjectOptions: any[] = [];
  subjectGroupRecords: { subject: any; studentGroup: any[] }[] = [];
  loading = false;

  constructor(
    private professorService: ProfessorService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProfessors();
    this.loadGroups();
    this.loadSubjects();

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'user.firstName', header: 'First Name' },
      { field: 'user.lastName', header: 'Last Name' },
      { field: 'user.email', header: 'Email' }
    ];
  }

  loadProfessors(): void {
    console.log("Loading professors...");
    this.professorService.findAll().subscribe(
      response => {
        this.professors = response.body || [];
        console.log('Loaded professors:', this.professors);
      },
      error => {
        console.error('Error loading professors:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load professors: ' + (error.message || error),
          life: 3000
        });
      }
    );
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

  openNew(): void {
    this.professor = { user: { firstName: '', lastName: '', email: '' } };
    this.submitted = false;
    this.professorDialog = true;
  }

  editProfessor(professor: Professor): void {
    this.professor = {
      ...professor,
      user: { ...professor.user }
    };
    this.professorDialog = true;
  }

  deleteProfessor(professor: Professor): void {
    this.deleteProfessorDialog = true;
    this.professor = { ...professor };
  }

  confirmDelete(): void {
    this.deleteProfessorDialog = false;

    if (this.professor.id) {
      this.professorService.delete(this.professor.id).subscribe(
        () => {
          this.professors = this.professors!.filter(val => val.id !== this.professor.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Professor Deleted',
            life: 3000
          });
          this.professor = { user: { firstName: '', lastName: '', email: '' } };
        },
        error => {
          console.error('Error deleting professor:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete professor: ' + (error.message || error),
            life: 3000
          });
        }
      );
    }
  }

  deleteSelectedProfessors(): void {
    this.deleteProfessorsDialog = true;
  }

  confirmDeleteSelected(): void {
    this.deleteProfessorsDialog = false;

    const deletePromises: Promise<any>[] = [];

    this.selectedProfessors.forEach(professor => {
      if (professor.id) {
        const deletePromise = new Promise<void>((resolve, reject) => {
          this.professorService.delete(professor.id!).subscribe(
            () => resolve(),
            error => reject(error)
          );
        });
        deletePromises.push(deletePromise);
      }
    });

    Promise.all(deletePromises)
      .then(() => {
        this.professors = this.professors!.filter(
          professor => !this.selectedProfessors.some(selected => selected.id === professor.id)
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Professors Deleted',
          life: 3000
        });

        this.selectedProfessors = [];
      })
      .catch(error => {
        console.error('Error deleting professors:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete professors: ' + (error.message || error),
          life: 3000
        });
      });
  }

  hideDialog(): void {
    this.professorDialog = false;
    this.submitted = false;
  }

  isEmailValid(): boolean {
    if (!this.professor.user?.email || this.professor.user.email.trim() === '') {
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.professor.user.email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(06|07)\d{8}$/;
    return phoneRegex.test(phone);
  }

  hasValidPhonePrefix(phone: string): boolean {
    return phone.startsWith('06') || phone.startsWith('07');
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    //this.professor.phone = input.value;
  }

  saveProfessor(): void {
    this.submitted = true;

    if (!this.professor.user?.firstName || !this.professor.user.lastName) {
      return;
    }

    if (!this.isEmailValid()) {
      return;
    }

    if (!this.professor.user?.email || this.professor.user.email.trim() === '') {
      return; // Optional field, so we can skip validation
    }

    if (this.subjectGroupRecords.some(record => !record.subject || record.studentGroup.length === 0)) {
      return;
    }

    const professorToSave: Professor = {
      id: this.professor.id,

      user: {
        id: this.professor.user.id,
        firstName: this.professor.user.firstName,
        lastName: this.professor.user.lastName,
        email: this.professor.user.email
      },
      subjectGroups: this.subjectGroupRecords.map(record => ({
        subject: record.subject || null,
        studentGroup: record.studentGroup || []
      }))
    };

    if (professorToSave.id) {
      this.professorService.update(professorToSave).subscribe(
        response => {
          let updatedProfessor = response.body || professorToSave;

          const index = this.findIndexById(professorToSave.id!);
          if (index !== -1 && this.professors) {
            this.professors[index] = updatedProfessor;
          } else {
            this.loadProfessors();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Professor Updated',
            life: 3000
          });

          this.professorDialog = false;
          this.professor = { user: { firstName: '', lastName: '', email: '' } };
        },
        error => {
          console.error('Error updating professor:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update professor: ' + (error.message || error),
            life: 3000
          });
        }
      );
    } else {
      this.professorService.create(professorToSave).subscribe(
        response => {
          const newProfessor = response.body || professorToSave;

          if (this.professors) {
            this.professors.push(newProfessor);
          } else {
            this.loadProfessors();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Professor Created',
            life: 3000
          });

          this.professorDialog = false;
          this.professor = { user: { firstName: '', lastName: '', email: '' } };
        },
        error => {
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
  }

  findIndexById(id: number): number {
    if (!this.professors) return -1;
    return this.professors.findIndex(professor => professor.id === id);
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  addSubjectGroupRecord(): void {
    this.subjectGroupRecords.push({ subject: null, studentGroup: [] });
  }

  removeSubjectGroupRecord(index: number): void {
    this.subjectGroupRecords.splice(index, 1);
  }
}
