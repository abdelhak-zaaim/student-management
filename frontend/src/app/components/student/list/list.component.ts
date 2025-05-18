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
    student: Student = { user: { firstName: '', lastName: '', email: '' } };
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

             // Log the first student to examine structure
             if (this.students && this.students.length > 0) {
                 console.log('First student structure:', JSON.stringify(this.students[0], null, 2));

                 // Check if user IDs are present in the loaded data
                 const firstStudent = this.students[0];
                 console.log('User ID check:',
                     firstStudent.id ? `Student ID: ${firstStudent.id}` : 'No student ID',
                     firstStudent.user?.id ? `User ID: ${firstStudent.user.id}` : 'No user ID'
                 );

                 // Analyze user object structure
                 this.logStudentFields(firstStudent);
             }
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
      * Helper method to log nested object properties for debugging
      */
     private logStudentFields(student: Student) {
         if (!student) {
             console.log('Student is null or undefined');
             return;
         }

         console.log('Student ID:', student.id);
         console.log('Student Phone:', student.phone);

         // Log user details if available
         if (student.user) {
             console.log('User FirstName:', student.user.firstName);
             console.log('User LastName:', student.user.lastName);
             console.log('User Email:', student.user.email);
         } else {
             console.log('User object is missing');
         }

         // Log group details if available
         if (student.studentGroup) {
             console.log('Group ID:', student.studentGroup.id);
             console.log('Group Name:', student.studentGroup.name);
         } else {
             console.log('Group object is missing');
         }
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

        console.log('New student initialized with:', this.student);

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
        console.log('Original student to edit:', student);

        // Create a copy of the student to avoid modifying the original
        // Using a structured approach to maintain type safety and preserve IDs
        this.student = {
            id: student.id,
            phone: student.phone || '',
            studentGroup: student.studentGroup,
            user: student.user ? {
                id: student.user.id, // Preserve the user ID for update
                firstName: student.user.firstName || '',
                lastName: student.user.lastName || '',
                email: student.user.email || ''
            } : {
                firstName: '',
                lastName: '',
                email: ''
            }
        };

        console.log('Copied student with user ID:', this.student.user?.id);

        // Make sure groups are loaded before showing the dialog
        if (this.studentGroups.length === 0) {
            this.loadGroupsDirect();
        }

        // If student has a group, find the matching one from loaded groups
        if (this.student.studentGroup && this.student.studentGroup.id) {
            const groupId = this.student.studentGroup.id;
            console.log('Looking for group with ID:', groupId);

            // First try immediately
            let foundGroup = this.studentGroups.find(g => g.id === groupId);
            if (foundGroup) {
                console.log('Found matching group immediately:', foundGroup);
                this.student.studentGroup = foundGroup;
            } else {
                // Try again after groups are loaded
                console.log('Group not found immediately, will try after delay');
                setTimeout(() => {
                    foundGroup = this.studentGroups.find(g => g.id === groupId);
                    if (foundGroup) {
                        console.log('Found matching group after delay:', foundGroup);
                        this.student.studentGroup = foundGroup;
                    } else {
                        console.log('No matching group found in:', this.studentGroups);
                    }
                }, 300);
            }
        }

        // Log the student we're about to edit with user details
        console.log('Student prepared for editing:', this.student);
        if (this.student.user) {
            console.log('User details for update - ID:', this.student.user.id,
                        'Name:', this.student.user.firstName, this.student.user.lastName);
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

        // Initialize student with proper structure to avoid null reference errors
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

    saveStudent() {
        this.submitted = true;

        console.log('Saving student:', this.student);
        console.log('User ID before save:', this.student.user?.id);

        // Validate required fields using form fields directly
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

        // Ensure we have all required objects properly set
        if (!this.student.user) {
            this.student.user = { firstName: '', lastName: '', email: '' };
        }

        // Create a clean copy that follows the Student interface
        // Make sure to include the user ID when updating
        const studentToSave: Student = {
            id: this.student.id,
            phone: this.student.phone,
            studentGroup: this.student.studentGroup,
            user: {
                id: this.student.user.id, // Include user ID for updates
                firstName: this.student.user.firstName,
                lastName: this.student.user.lastName,
                email: this.student.user.email
            }
        };

        console.log('User ID in studentToSave:', studentToSave.user?.id);
        console.log('Sending to server:', studentToSave);

        if (studentToSave.id) {
            // Update existing student - user ID must be included
            if (!studentToSave.user?.id && this.student.id) {
                console.warn('User ID is missing for update! This may cause errors.');
            }

            this.studentService.update(studentToSave).subscribe(
                response => {
                    console.log('Update response:', response.body);

                    // Update the local array with the updated student
                    const index = this.findIndexById(studentToSave.id!);
                    if (index !== -1 && this.students) {
                        this.students[index] = response.body || studentToSave;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Student Updated',
                        life: 3000
                    });

                    this.studentDialog = false;
                    this.student = { user: { firstName: '', lastName: '', email: '' } }; // Reset with proper structure
                },
                error => {
                    console.error('Error updating student:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update student: ' + (error.message || error),
                        life: 3000
                    });
                }
            );
        } else {
            // Create new student
            this.studentService.create(studentToSave).subscribe(
                response => {
                    console.log('Create response:', response.body);
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
                    this.student = { user: { firstName: '', lastName: '', email: '' } }; // Reset with proper structure
                },
                error => {
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
    }
}
