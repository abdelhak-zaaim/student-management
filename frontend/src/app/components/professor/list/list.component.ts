import { Component, OnInit } from '@angular/core';
import { Professor, CourseAssignment } from '../../../models/professor.model';
import { ProfessorService } from '../professor.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { GroupService } from "../../group/group.service";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Group } from '../../../models/group.model';
import { Subject } from '../../../models/subject.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [GroupService]
})
export class ListComponent implements OnInit {
  professors: Professor[] | null = null;
  professor: Professor = { user: { firstName: '', lastName: '', email: '', password : ''} };
  selectedProfessors: Professor[] = [];

  // Properties for the professor assignments dialog
  assignmentsDialog = false;
  selectedProfessorForAssignments: Professor | null = null;

  professorDialog = false;
  deleteProfessorDialog = false;
  deleteProfessorsDialog = false;
  submitted = false;
  cols: any[] = [];

  groupOptions: Group[] = [];
  subjectOptions: Subject[] = [];
  courseAssignments: CourseAssignment[] = [];
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

    // Check if a new professor was created in the add component
    this.checkForNewlyCreatedProfessor();
  }

  /**
   * Check if there's a newly created professor in session storage
   * and add it to the professors list if found
   */
  checkForNewlyCreatedProfessor(): void {
    const newlyCreatedProfessorJson = sessionStorage.getItem('newlyCreatedProfessor');

    if (newlyCreatedProfessorJson) {
      try {
        // Parse the stored professor data
        const newlyCreatedInfo = JSON.parse(newlyCreatedProfessorJson);

        if (newlyCreatedInfo.action === 'created') {
          // Fetch the full professor details including course assignments
          this.professorService.find(newlyCreatedInfo.id).subscribe(
            response => {
              const fullProfessor = response.body;

              if (fullProfessor && this.professors) {
                // Check if this professor is already in the list
                const exists = this.professors.some(p => p.id === fullProfessor.id);

                if (!exists) {
                  // Add the new professor to the beginning of the list for visibility
                  this.professors.unshift(fullProfessor);
                }

                // Highlight animation could be added here if desired
              }

              // Clear the session storage to avoid adding duplicates on refreshes
              sessionStorage.removeItem('newlyCreatedProfessor');
            },
            error => {
              console.error('Error fetching new professor details:', error);
              sessionStorage.removeItem('newlyCreatedProfessor');
            }
          );
        }
      } catch (error) {
        console.error('Error parsing newly created professor data:', error);
        sessionStorage.removeItem('newlyCreatedProfessor');
      }
    }
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

    this.http.get<Subject[]>(url, { observe: 'response' }).subscribe(
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
    this.professor = { user: { firstName: '', lastName: '', email: '' }, courseAssignments: [] };
    this.courseAssignments = [];
    this.submitted = false;
    this.professorDialog = true;
    this.addCourseAssignment();
  }

  editProfessor(professor: Professor): void {
    this.professor = {
      ...professor,
      user: { ...professor.user }
    };

    // Clear existing assignments and copy the professor's assignments
    this.courseAssignments = [];

    if (professor.courseAssignments && professor.courseAssignments.length > 0) {
      // Make sure both subject and groups are properly linked to their respective options
      professor.courseAssignments.forEach(assignment => {
        const matchingSubject = this.subjectOptions.find(s => s.id === assignment.subject.id);
        const matchingGroup = this.groupOptions.find(g => g.id === assignment.studentGroup.id);

        this.courseAssignments.push({
          id: assignment.id,
          subject: matchingSubject || assignment.subject,
          studentGroup: matchingGroup || assignment.studentGroup
        });
      });
    } else {
      // Add an empty assignment if none exist
      this.addCourseAssignment();
    }

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
            detail: error.error.message || 'Failed to delete selected professors',
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
         // error to json

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete selected professors',
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
      return;
    }

    if (this.courseAssignments.some(assignment => !assignment.subject || !assignment.studentGroup)) {
      //return;
    }

    const professorToSave: Professor = {
      id: this.professor.id,
      user: {
        id: this.professor.user.id,
        firstName: this.professor.user.firstName,
        lastName: this.professor.user.lastName,
        email: this.professor.user.email,
        password: this.professor.user.password
      },
      courseAssignments: this.courseAssignments
    };

    // Hide dialog immediately to improve perceived performance
    this.professorDialog = false;
    this.loading = true;

    if (professorToSave.id) {
      // Update existing professor
      this.professorService.update(professorToSave).subscribe(
        response => {
          const updatedProfessor = response.body;

          if (updatedProfessor && this.professors) {
            // Find the index of the professor in the array
            const index = this.findIndexById(updatedProfessor.id!);

            if (index !== -1) {
              // Replace the professor with the updated one from server
              this.professors[index] = { ...updatedProfessor };
            } else {
              // If professor not found in list, reload all professors
              this.loadProfessors();
            }
          } else {
            // If response body is null or professors array doesn't exist, reload the list
            this.loadProfessors();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Professor Updated',
            life: 3000
          });

          this.loading = false;
          this.professor = { user: { firstName: '', lastName: '', email: '' } };
        },
        error => {
          this.loading = false;
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
      // Create new professor
      this.professorService.create(professorToSave).subscribe(
        response => {
          const newProfessor = response.body;
          console.log('New professor created:', newProfessor);

          if (newProfessor && this.professors) {
            // Make sure we have a fully populated professor object
            if (newProfessor.user?.firstName && newProfessor.user?.lastName) {
              // Add the complete professor object from server response to the beginning of the list
              this.professors.unshift(newProfessor);
            } else {
              // If the response doesn't contain expected data, reload full list
              console.warn('New professor data incomplete, reloading list');
              this.loadProfessors();
            }
          } else {
            // If response body is null or professors array doesn't exist, reload the list
            console.warn('Failed to get proper response for new professor, reloading list');
            this.loadProfessors();
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Professor Created',
            life: 3000
          });

          this.loading = false;
          this.professor = { user: { firstName: '', lastName: '', email: '' } };
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
  }

  findIndexById(id: number): number {
    if (!this.professors) return -1;
    return this.professors.findIndex(professor => professor.id === id);
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  addCourseAssignment(): void {
    this.courseAssignments.push({
      subject: null as unknown as Subject,
      studentGroup: null as unknown as Group
    });
  }

  removeCourseAssignment(index: number): void {
    this.courseAssignments.splice(index, 1);
    if (this.courseAssignments.length === 0) {
      this.addCourseAssignment();
    }
  }

  /**
   * Shows the course assignments for a given professor in a dialog
   * @param professor The professor whose assignments to show
   */
  showProfessorAssignments(professor: Professor): void {
    // If the professor doesn't have course assignments loaded, fetch them first
    if (professor.id && (!professor.courseAssignments || professor.courseAssignments.length === 0)) {
      this.loading = true;

      // Fetch the full professor details with assignments
      this.professorService.find(professor.id).subscribe(
        response => {
          this.selectedProfessorForAssignments = response.body;
          this.assignmentsDialog = true;
          this.loading = false;
        },
        error => {
          console.error('Error loading professor assignments:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load professor assignments: ' + (error.message || error),
            life: 3000
          });
          this.loading = false;
        }
      );
    } else {
      // Professor already has assignments loaded, just show them
      this.selectedProfessorForAssignments = { ...professor };
      this.assignmentsDialog = true;
    }
  }

isPasswordValid() {
    // Check if password is provided
    if (this.professor.user?.password && this.professor.user.password.trim() !== '') {
        // Password is provided - validate it
        const password = this.professor.user.password;
        return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    }

    // Password is not provided
    // If editing (professor has ID), it's optional
    // If adding new professor (no ID), it's required
    return !!this.professor.id;
}
}
