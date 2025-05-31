import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {CourseAssignment, Professor} from '../../../models/professor.model';
import {ProfessorService} from '../professor.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Group} from '../../../models/group.model';
import {Subject} from '../../../models/subject.model';

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
        courseAssignments: []
    };

    groupOptions: Group[] = [];
    subjectOptions: Subject[] = [];
    courseAssignments: CourseAssignment[] = [];

    submitted = false;
    loading = false;

    constructor(
        private professorService: ProfessorService,
        private messageService: MessageService,
        private router: Router,
        private http: HttpClient
    ) {
    }

    ngOnInit(): void {
        this.loadGroups();
        this.loadSubjects();
        this.addCourseAssignment(); // Initialize with one empty record
    }

    /**
     * Load groups for the dropdown
     */
    loadGroups(): void {
        this.loading = true;

        // Make sure we're using the correct API URL for groups
        const url = `${environment.apiBaseUrl}/student-groups`;

        this.http.get<Group[]>(url, {observe: 'response'}).subscribe(
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

        this.http.get<Subject[]>(url, {observe: 'response'}).subscribe(
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
     * Add a new course assignment record
     */
    addCourseAssignment(): void {
        this.courseAssignments.push({
            subject: null as unknown as Subject,
            studentGroup: null as unknown as Group
        });
    }

    /**
     * Remove a course assignment record by index
     */
    removeCourseAssignment(index: number): void {
        this.courseAssignments.splice(index, 1);
        if (this.courseAssignments.length === 0) {
            this.addCourseAssignment();
        }
    }

    /**
     * Check if email is valid
     */
    isEmailValid(): boolean {
        if (!this.professor.user?.email || this.professor.user.email.trim() === '') {
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(this.professor.user.email);
    }

    /**
     * Create professor
     */
    createProfessor(): void {
        this.submitted = true;

        if (!this.professor.user?.firstName?.trim() || !this.professor.user.lastName?.trim()) {
            return;
        }

        if (!this.isEmailValid()) {
            return;
        }

        if (!this.isPasswordValid()) {
            return;
        }


        if (this.courseAssignments.some(assignment => !assignment.subject || !assignment.studentGroup)) {
            return;
        }

        this.loading = true;

        const professorToSave: Professor = {
            user: {
                firstName: this.professor.user.firstName,
                lastName: this.professor.user.lastName,
                email: this.professor.user.email,
                password: this.professor.user.password
            },
            courseAssignments: this.courseAssignments
        };

        this.professorService.create(professorToSave).subscribe(
            response => {
                this.loading = false;
                // Store the newly created professor with its ID in sessionStorage
                // This is a way to pass data between components during navigation
                const newProfessor = response.body;
                if (newProfessor) {
                    // Store important data only to avoid clutter
                    sessionStorage.setItem('newlyCreatedProfessor', JSON.stringify({
                        id: newProfessor.id,
                        user: newProfessor.user,
                        action: 'created'
                    }));
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Professor created successfully',
                    life: 3000
                });

                // Navigate back to the professor list
                this.router.navigate(['/professors']);
            },
            error => {
                this.loading = false;
                console.error('Error creating professor:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create professor: ' + (error.message || error),
                    life: 5000
                });
            }
        );
    }

    /**
     * Reset the form to initial state
     */
    resetForm(): void {
        this.professor = {
            user: {
                firstName: '',
                lastName: '',
                email: '',
                password: ''
            }
        };
        this.courseAssignments = [];
        this.addCourseAssignment();
        this.submitted = false;
    }

    /**
     * Cancel and navigate back to professors list
     */
    cancel(): void {
        this.router.navigate(['/professors']);
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
