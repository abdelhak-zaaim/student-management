import {Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import {StudentService} from "../student.service";
import {Student} from "../../../models/student.model";
import {MessageService} from "primeng/api";
import {Table} from "primeng/table";
import {GroupService} from "../../group/group.service";
import {Group} from "../../../models/group.model";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Payment} from "../../../models/payment.model";
import {Router} from "@angular/router";

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

    // New properties for student payments
    studentPaymentsDialog: boolean = false;
    loadingPayments: boolean = false;
    studentPayments: Payment[] = [];
    currentStudent: Student | null = null;

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
        private http: HttpClient, // Direct http client
        private router: Router // Added router for navigation
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

     refreshStudents() {
         // Load fresh data from server
         this.studentService.findAll().subscribe(data => {
             this.students = data.body;
             console.log('Refreshed students:', this.students);
         });
     }

     ngOnInit():void {
         // Load students
         this.refreshStudents();

         // Log student structure on initial load
         this.studentService.findAll().subscribe(data => {
             const students = data.body;

             // Log the first student to examine structure
             if (students && students.length > 0) {
                 console.log('First student structure:', JSON.stringify(students[0], null, 2));

                 // Check if user IDs are present in the loaded data
                 const firstStudent = students[0];
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
        // Email is optional, so don't initialize it (will be undefined)
        this.student = {
            user: {
                firstName: '',
                lastName: '',
                // email is optional, omitting it sets it to undefined
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
                email: student.user.email || '' // Use empty string if email not provided
            } : {
                firstName: '',
                lastName: '',
                email: '' // Initialize with empty string (will be treated as optional)
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




    /**
     * Helper method to merge student data between different sources
     * Ensures all required properties exist in the final object
     */
    mergeStudentData(target: Student, source: Student): Student {
        const result: Student = { ...target };

        // Handle user object
        if (!result.user) {
            result.user = { ...source.user };
        } else {
            result.user = {
                id: result.user.id || source.user?.id,
                firstName: result.user.firstName || source.user?.firstName || '',
                lastName: result.user.lastName || source.user?.lastName || '',
                email: result.user.email !== undefined ? result.user.email : (source.user?.email || '')
            };
        }

        // Handle other properties
        result.phone = result.phone || source.phone;
        result.studentGroup = result.studentGroup || source.studentGroup;

        console.log('Merged student data:', result);
        return result;
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
     * Validates email format if provided (optional)
     */
    isValidEmail(email: string | undefined): boolean {
        if (!email || email.trim() === '') return true; // Empty or undefined is valid since it's optional

        // Simple email validation regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Safe accessor method for template to check email validity
     * This avoids null/undefined errors in the template
     */
    isEmailValid(): boolean {
        if (!this.student || !this.student.user) return true;
        const email = this.student.user.email;
        return this.isValidEmail(email);
    }

    /**
     * Check if phone starts with valid prefix (06 or 07)
     */
    hasValidPhonePrefix(phone: string | null | undefined): boolean {
        if (!phone || phone.length < 2) return false;
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.startsWith('06') || digitsOnly.startsWith('07');
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



    /**
     * Filter phone input to only allow valid phone formats
     */
    onPhoneInput(event: Event) {
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
                email: '' // Empty string for optional email
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

        // Email is optional, but if provided must be valid
        if (!this.isEmailValid()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Email format is invalid',
                life: 3000
            });
            hasErrors = true;
        }

        // Phone is required and must follow validation rules
        if (!this.student.phone?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Phone number is required',
                life: 3000
            });
            hasErrors = true;
        } else if (!this.isValidPhone(this.student.phone)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Phone must be 10 digits and start with 06 or 07',
                life: 3000
            });
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Ensure we have all required objects properly set
        if (!this.student.user) {
            this.student.user = {
                firstName: '',
                lastName: '',
                email: '' // Empty string - will be treated as optional
            };
        }

        // If email is empty string, consider it as intentionally empty (valid but empty)
        if (this.student.user.email === '') {
            // Keep it as empty string - this is valid for optional fields
        }

        // Store current student data for reference if update doesn't return complete data
        const currentData = { ...this.student };

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

                    // Create a complete updated student object
                    let updatedStudent: Student;

                    if (response.body) {
                        updatedStudent = response.body;

                        // Ensure all necessary properties exist in the response
                        if (!updatedStudent.user || !updatedStudent.user.firstName || !updatedStudent.user.lastName) {
                            console.warn('Response missing user data, merging with sent data');
                            updatedStudent = this.mergeStudentData(updatedStudent, studentToSave);
                        }
                    } else {
                        // Use the submitted data if no response body
                        console.warn('No response body, using sent data');
                        updatedStudent = { ...studentToSave };
                    }

                    // Log the final update student for debugging
                    console.log('Final updated student:', updatedStudent);

                    // Update the local array with the updated student
                    const index = this.findIndexById(studentToSave.id!);
                    if (index !== -1 && this.students) {
                        this.students[index] = updatedStudent;
                    } else {
                        console.warn('Could not find student in local array, refreshing from server');
                        this.refreshStudents(); // Refresh all students if we can't find the one to update
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

                    let newStudent: Student;

                    if (response.body) {
                        newStudent = response.body;

                        // Ensure all necessary properties exist in the response
                        if (!newStudent.user || !newStudent.user.firstName || !newStudent.user.lastName) {
                            console.warn('Response missing user data, merging with sent data');
                            newStudent = this.mergeStudentData(newStudent, studentToSave);
                        }
                    } else {
                        // Use the submitted data if no response body
                        console.warn('No response body, using sent data');
                        newStudent = { ...studentToSave };
                    }

                    if (newStudent && this.students) {
                        this.students.push(newStudent);
                    } else {
                        console.warn('Issue with adding new student to array, refreshing from server');
                        this.refreshStudents(); // Refresh all students if we can't add the new one
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

    /**
     * Open the payment history dialog for a specific student
     */
    viewStudentPayments(student: Student): void {
        this.currentStudent = student;
        this.studentPayments = []; // Reset payments array
        this.studentPaymentsDialog = true;
        this.loadingPayments = true;

        if (student && student.id) {
            this.fetchStudentPayments(student.id);
        } else {
            this.loadingPayments = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Student ID is missing',
                life: 3000
            });
        }
    }

    /**
     * Fetch payments for a specific student
     */
    fetchStudentPayments(studentId: number): void {
        const url = `${environment.apiBaseUrl}/payments/student/${studentId}`;
        console.log(`Fetching payments for student ID ${studentId} from: ${url}`);

        this.http.get<Payment[]>(url, { observe: 'response' })
            .subscribe(
                response => {
                    this.studentPayments = response.body || [];
                    console.log('Loaded student payments:', this.studentPayments);
                    this.loadingPayments = false;
                },
                error => {
                    console.error('Error loading student payments:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load student payments: ' + (error.message || error),
                        life: 3000
                    });
                    this.loadingPayments = false;
                    this.studentPayments = []; // Reset to empty array on error
                }
            );
    }

    /**
     * Edit an existing payment
     */
    editPayment(payment: Payment): void {
        // Navigate to the payment edit page with payment ID
        this.router.navigate(['/payments/edit', payment.id]);
    }

    /**
     * View payment details
     */
    viewPaymentDetails(payment: Payment): void {
        // Navigate to the payment details page with payment ID
        this.router.navigate(['/payments/view', payment.id]);
    }

    /**
     * Create a new payment for the current student
     */
    createPaymentForStudent(): void {
        // Navigate to the make payment page with the student ID prefilled
        if (this.currentStudent && this.currentStudent.id) {
            this.router.navigate(['/payments/add'], {
                queryParams: {
                    studentId: this.currentStudent.id,
                    studentName: `${this.currentStudent.user?.firstName} ${this.currentStudent.user?.lastName}`.trim()
                }
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Student ID is missing',
                life: 3000
            });
        }
    }
}
