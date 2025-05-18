import { Component, OnInit } from '@angular/core';
import {Group} from "../../../models/group.model";
import {MessageService} from "primeng/api";
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

    rowsPerPageOptions = [5, 10, 20];

    constructor(private groupService: GroupService, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.groupService.findAll().subscribe(data => {
            this.groups = data.body
        });

        this.cols = [
            {field: 'user', header: 'User'},
            {field: 'groupGroup', header: 'groupGroup'},
        ];

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
            // Create a copy of the array to avoid modifying during iteration
            const groupsToDelete = [...this.selectedGroups];

            // Reset the selection
            this.selectedGroups = [];

            // Delete each group
            groupsToDelete.forEach(group => {
                if (group.id) {
                    this.groupService.delete(group.id).subscribe(
                        () => {
                            // Remove from the local array after successful deletion
                            this.groups = this.groups?.filter(g => g.id !== group.id) || [];
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Groups Deleted',
                                life: 3000
                            });
                        },
                        error => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete groups',
                                life: 3000
                            });
                        }
                    );
                }
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

}
