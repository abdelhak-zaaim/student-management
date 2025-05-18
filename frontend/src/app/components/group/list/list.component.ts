import { Component, OnInit } from '@angular/core';
import {Group} from "../../../models/group.model";
import {MessageService, MenuItem} from "primeng/api";
import {Table} from "primeng/table";
import {GroupService} from "../group.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
    groups?: Group[] | null;
    group: Group = {};
    selectedGroups: Group[] = [];
    submitted: boolean = false;

    cols: any[] = [];
    statuses: any[] = [];

    groupDialog: boolean = false;
    deleteGroupDialog: boolean = false;
    deleteGroupsDialog: boolean = false;

    // New properties for students dialog
    studentsDialog: boolean = false;
    selectedGroupStudents: any[] = [];
    selectedGroupForStudents: Group | null = null;
    loadingStudents: boolean = false;

    rowsPerPageOptions = [5, 10, 20];

    constructor(private groupService: GroupService, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.groupService.findAll().subscribe(data => {
            this.groups = data.body
        });

        this.cols = [
            {field: 'name', header: 'Name'},
            {field: 'description', header: 'Description'},
        ];
    }

    /**
     * View students in a group
     */
    viewStudents(group: Group) {
        if (!group.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Cannot view students for this group',
                life: 3000
            });
            return;
        }

        this.selectedGroupForStudents = group;
        this.loadingStudents = true;
        this.selectedGroupStudents = [];
        this.studentsDialog = true;

        // Fetch students for this group
        this.groupService.findStudentsByGroupId(group.id).subscribe(
            response => {
                this.loadingStudents = false;
                if (response.body) {
                    // Transform the data to match the table structure
                    this.selectedGroupStudents = response.body.map(student => {
                        return {
                            id: student.id,
                            firstName: student.user?.firstName,
                            lastName: student.user?.lastName,
                            email: student.user?.email,
                            phone: student.phone
                        };
                    });
                }
            },
            error => {
                this.loadingStudents = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load students for this group',
                    life: 3000
                });
            }
        );
    }

    /**
     * Close the students dialog
     */
    hideStudentsDialog() {
        this.studentsDialog = false;
        this.selectedGroupForStudents = null;
        this.selectedGroupStudents = [];
    }

    /**
     * Export student list to CSV using native browser features
     */
    exportToCSV() {
        if (!this.selectedGroupStudents || this.selectedGroupStudents.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No data to export',
                life: 3000
            });
            return;
        }

        const groupName = this.selectedGroupForStudents?.name || 'group';
        const filename = `students_${groupName}_${new Date().toISOString().slice(0,10)}.csv`;

        // Define CSV headers
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone'];

        // Transform data to CSV rows
        const csvData = this.selectedGroupStudents.map(student => {
            return [
                student.id,
                student.firstName,
                student.lastName,
                student.email || '',
                student.phone || ''
            ].join(',');
        });

        // Combine headers and data
        const csv = [
            headers.join(','),
            ...csvData
        ].join('\n');

        // Create download using a temporary anchor element
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'CSV file exported successfully',
            life: 3000
        });
    }

    /**
     * Export student list to PDF (placeholder for future implementation)
     */
    exportToPDF() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'PDF export functionality will be added soon',
            life: 3000
        });
    }


    openNew() {
        this.group = {};
        this.submitted = false;
        this.groupDialog = true;
    }

    deleteSelectedGroups() {
        this.deleteGroupsDialog = true;
    }

    editGroup(group: Group) {
        // Clone the group to avoid modifying the original until save
        this.group = {...group};
        this.groupDialog = true;
    }

    deleteGroup(group: Group) {
        this.deleteGroupDialog = true;
        this.group = {...group};
    }

    confirmDeleteSelected() {
        this.deleteGroupsDialog = false;
        if (this.selectedGroups && this.selectedGroups.length > 0) {
            // Get all valid IDs
            const groupIds = this.selectedGroups
                .filter(group => group.id !== undefined)
                .map(group => group.id as number);

            if (groupIds.length === 0) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No valid groups to delete',
                    life: 3000
                });
                return;
            }

            // Store IDs for local array filtering
            const idsToDelete = new Set(groupIds);

            // Reset the selection
            this.selectedGroups = [];

            // Use bulk delete if available, otherwise fall back to individual deletes
            if (groupIds.length === 1) {
                // Single group delete
                this.groupService.delete(groupIds[0]).subscribe(
                    () => {
                        // Remove from the local array
                        this.groups = this.groups?.filter(g => !idsToDelete.has(g.id as number)) || [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Group Deleted',
                            life: 3000
                        });
                    },
                    error => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete group',
                            life: 3000
                        });
                    }
                );
            } else {
                // Multiple group delete
                this.groupService.bulkDelete(groupIds).subscribe(
                    () => {
                        // Remove all deleted groups from the local array
                        this.groups = this.groups?.filter(g => !idsToDelete.has(g.id as number)) || [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: `${groupIds.length} Groups Deleted`,
                            life: 3000
                        });
                    },
                    error => {
                        // Fallback to individual deletes if bulk delete fails or isn't supported
                        console.error('Bulk delete failed, falling back to individual deletes', error);
                        let successCount = 0;
                        let failureCount = 0;

                        // Track completion of all delete operations
                        const total = groupIds.length;
                        let completed = 0;

                        groupIds.forEach(id => {
                            this.groupService.delete(id).subscribe(
                                () => {
                                    successCount++;
                                    completed++;

                                    if (completed === total) {
                                        this.handleDeleteCompletion(successCount, failureCount);
                                    }
                                },
                                () => {
                                    failureCount++;
                                    completed++;

                                    if (completed === total) {
                                        this.handleDeleteCompletion(successCount, failureCount);
                                    }
                                }
                            );
                        });
                    }
                );
            }
        }
    }

    /**
     * Helper method to display appropriate message after multiple deletes
     */
    private handleDeleteCompletion(successCount: number, failureCount: number) {
        // Update local array to remove deleted groups
        this.groupService.findAll().subscribe(response => {
            this.groups = response.body;
        });

        if (failureCount === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `${successCount} Groups Deleted`,
                life: 3000
            });
        } else if (successCount === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete groups',
                life: 3000
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Partial Success',
                detail: `${successCount} Groups Deleted, ${failureCount} Failed`,
                life: 5000
            });
        }
    }

    confirmDelete() {
        this.deleteGroupDialog = false;

        if (this.group && this.group.id) {
            this.groupService.delete(this.group.id).subscribe(
                () => {
                    // Remove from the local array after successful deletion
                    this.groups = this.groups?.filter(g => g.id !== this.group.id) || [];
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Group Deleted',
                        life: 3000
                    });
                    // Reset current group
                    this.group = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete group',
                        life: 3000
                    });
                }
            );
        }
    }

    hideDialog() {
        this.groupDialog = false;
        this.submitted = false;
    }

    saveGroup() {
        this.submitted = true;

        // Validate both name and description
        let hasErrors = false;

        if (!this.group.name?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Group name is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (!this.group.description?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Group description is required',
                life: 3000
            });
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        if (this.group.id) {
            // Update existing group
            this.groupService.update(this.group).subscribe(
                response => {
                    // Update the local array with the updated group
                    const index = this.findIndexById(this.group.id!);
                    if (index !== -1 && this.groups) {
                        this.groups[index] = response.body || this.group;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Group Updated',
                        life: 3000
                    });

                    this.groupDialog = false;
                    this.group = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update group',
                        life: 3000
                    });
                }
            );
        } else {
            // Create new group
            this.groupService.create(this.group).subscribe(
                response => {
                    const newGroup = response.body;
                    if (newGroup && this.groups) {
                        this.groups.push(newGroup);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Group Created',
                        life: 3000
                    });

                    this.groupDialog = false;
                    this.group = {};
                },
                error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create group',
                        life: 3000
                    });
                }
            );
        }
    }


    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.groups!.length; i++) {
            if (this.groups![i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Handle file import
     */
    onImportFile(event: any) {
        const files = event.files;
        if (files.length > 0) {
            const file = files[0];

            // Check if file is valid (CSV, Excel, etc.)
            const validTypes = ['text/csv', 'application/vnd.ms-excel',
                               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

            if (!validTypes.includes(file.type)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Invalid file type. Please upload a CSV or Excel file.',
                    life: 3000
                });
                return;
            }

            // Process the file
            this.groupService.importGroups(file).subscribe(
                response => {
                    const importedGroups = response.body;
                    if (importedGroups && importedGroups.length > 0) {
                        // Refresh the group list
                        this.groupService.findAll().subscribe(data => {
                            this.groups = data.body;

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: `${importedGroups.length} Groups Imported Successfully`,
                                life: 3000
                            });
                        });
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Information',
                            detail: 'No groups imported from the file',
                            life: 3000
                        });
                    }
                },
                error => {
                    console.error('Import error:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to import groups. Please check the file format.',
                        life: 3000
                    });
                }
            );
        }
    }
}
