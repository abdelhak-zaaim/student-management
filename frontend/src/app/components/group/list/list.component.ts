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

    }

    editGroup(product: Group) {

    }

    deleteGroup(group: Group) {

    }

    confirmDeleteSelected() {

    }

    confirmDelete() {

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
