import {Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import {StudentService} from "../student.service";
import {Student} from "../../../models/student.model";
import {MessageService} from "primeng/api";
import {Table} from "primeng/table";
import {GroupService} from "../../group/group.service";
import {Group} from "../../../models/group.model";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    providers: [GroupService] // Ensure we have our own instance of GroupService
})
export class ListComponent implements OnInit {
    students?: Student[] | null;
    student: Student = {};
    selectedStudents: Student[] = [];
    submitted: boolean = false;

    cols: any[] = [];
    statuses: any[] = [];
    studentGroups: Group[] = [];

    studentDialog: boolean = false;

    deleteStudentDialog: boolean = false;

    deleteStudentsDialog: boolean = false;

    rowsPerPageOptions = [5, 10, 20];

    constructor(
        private studentService: StudentService,
        private groupService: GroupService,
        private messageService: MessageService,
        private http: HttpClient // Direct http client
    ) {
        // Make sure we're using student-groups endpoint
        // This is a hacky way to fix it for debugging - in real app update the service
        if ((this.groupService as any).resourceUrl.includes('/student-groups')) {
            console.log('Group service URL is correct:', (this.groupService as any).resourceUrl);
        } else {
            console.error('Adjusting incorrect group service URL');
            (this.groupService as any).resourceUrl = (this.groupService as any).resourceUrl.replace('/groups', '/student-groups');
        }
    }

    /**
     * Load groups directly using HttpClient
     */
    loadGroupsDirect() {
        const url = `${environment.apiBaseUrl}/student-groups`;
        console.log('Loading groups directly from:', url);

        this.http.get<Group[]>(url, { observe: 'response' })
            .subscribe(
                (response: HttpResponse<Group[]>) => {
                    this.studentGroups = response.body || [];
                    console.log('Directly loaded groups:', this.studentGroups);
                },
                error => {
                    console.error('Error directly loading groups:', error);
                }
            );
    }

     ngOnInit():void {
        // Load students
        this.studentService.findAll().subscribe(data => {
            this.students = data.body;
            console.log('Loaded students:', this.students);
        });

        // Load student groups directly - more reliable
        this.loadGroupsDirect();

        this.cols = [
            { field: 'id', header: 'id' },
            { field: 'phone', header: 'phone' },
            { field: 'user.firstName', header: 'First Name' },
            { field: 'user.lastName', header: 'Last Name' },
            { field: 'studentGroup.name', header: 'Group' },
        ];
     }



         /**
     * Load student groups for the dropdown
     */
         loadGroups() {
             console.log('Loading groups from:', this.groupService['resourceUrl']);

             this.groupService.findAll().subscribe(
                 data => {
                     this.studentGroups = data.body || [];
                     console.log('Loaded groups:', this.studentGroups);

                     // Force UI update if needed
                     if (this.studentGroups.length > 0) {
                         setTimeout(() => {
                             // This triggers change detection just in case
                         }, 0);
                     }
                 },
                 error => {
                     console.error('Error loading groups:', error);
                     this.messageService.add({
                         severity: 'error',
                         summary: 'Error',
                         detail: 'Failed to load student groups: ' + (error.message || error),
                    life: 3000
                });
            }
        );
    }


    openNew() {
        // Initialize with empty objects for nested properties
        this.student = {
            user: {
                firstName: '',
                lastName: '',
                email: ''
            },
            phone: '',
            studentGroup: null
        };
        this.submitted = false;

        // Make sure we have groups loaded before showing the dialog
        if (this.studentGroups.length === 0) {
            this.loadGroups();
        }

        this.studentDialog = true;
    }

    deleteSelectedStudents() {
        this.deleteStudentsDialog = true;
    }

    editStudent(student: Student) {
        // Clone the student to avoid modifying the original until save
        this.student = {...student};

        // Ensure user object is properly initialized
        if (!this.student.user) {
            this.student.user = {
                firstName: '',
                lastName: '',
                email: ''
            };
        } else {
            // Create a deep copy of the user object
            this.student.user = {...this.student.user};
        }

        // Make sure we have groups loaded
        if (this.studentGroups.length === 0) {
            this.loadGroupsDirect();
        }

        // If student has a group ID, find the matching complete group
        if (this.student.studentGroup && this.student.studentGroup.id) {
            const groupId = this.student.studentGroup.id;
            console.log('Looking for group with ID:', groupId);

            // Match group after a short delay to ensure groups are loaded
            setTimeout(() => {
                const foundGroup = this.studentGroups.find(g => g.id === groupId);
                if (foundGroup) {
                    console.log('Found matching group:', foundGroup);
                    this.student.studentGroup = foundGroup;
                } else {
                    console.log('No matching group found in:', this.studentGroups);
                }
            }, 200);
        }

        this.studentDialog = true;
    }

    deleteStudent(student: Student) {
        this.deleteStudentDialog = true;
        this.student = {...student};
    }

    confirmDeleteSelected() {
        this.deleteStudentsDialog = false;
        if (this.selectedStudents && this.selectedStudents.length > 0) {
            // Create a copy of the array to avoid modifying during iteration
            const studentsToDelete = [...this.selectedStudents];

            // Reset the selection
            this.selectedStudents = [];

            // Delete each student
            studentsToDelete.forEach(student => {
                if (student.id) {
                    this.studentService.delete(student.id).subscribe(
                        () => {
                            // Remove from the local array after successful deletion
                            this.students = this.students?.filter(s => s.id !== student.id) || [];
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Students Deleted',
                                life: 3000
                            });
                        },
                        error => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete students',
                                life: 3000
                            });
                        }
                    );
                }
            });
        }
    }

    confirmDelete() {
        this.deleteStudentDialog = false;

        if (this.student && this.student.id) {
            this.studentService.delete(this.student.id).subscribe(
                () => {
                    // Remove from the local array after successful deletion
                    this.students = this.students?.filter(s => s.id !== this.student.id) || [];
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Student Deleted',
                        life: 3000
                    });
                    // Reset current student
                    this.student = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete student',
                        life: 3000
                    });
                }
            );
        }
    }




    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.students!.length; i++) {
            if (this.students![i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }



    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }


    hideDialog() {
        this.studentDialog = false;
        this.submitted = false;
    }

    saveStudent() {
        this.submitted = true;

        // Validate required fields
        let hasErrors = false;

        if (!this.student.user?.firstName?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'First Name is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (!this.student.user?.lastName?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Last Name is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (!this.student.user?.email?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Email is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (!this.student.phone?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Phone number is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        if (this.student.id) {
            // Update existing student
            this.studentService.update(this.student).subscribe(
                response => {
                    // Update the local array with the updated student
                    const index = this.findIndexById(this.student.id!);
                    if (index !== -1 && this.students) {
                        this.students[index] = response.body || this.student;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Student Updated',
                        life: 3000
                    });

                    this.studentDialog = false;
                    this.student = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update student',
                        life: 3000
                    });
                }
            );
        } else {
            // Create new student
            this.studentService.create(this.student).subscribe(
                response => {
                    const newStudent = response.body;
                    if (newStudent && this.students) {
                        this.students.push(newStudent);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Student Created',
                        life: 3000
                    });

                    this.studentDialog = false;
                    this.student = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create student',
                        life: 3000
                    });
                }
            );
        }
    }
}
