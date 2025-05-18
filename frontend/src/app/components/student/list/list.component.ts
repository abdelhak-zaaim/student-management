import {Component, OnInit} from '@angular/core';
import {StudentService} from "../student.service";
import {Student} from "../../../models/student.model";
import {MessageService} from "primeng/api";
import {Table} from "primeng/table";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
    students?: Student[] | null;
    student: Student = {};
    selectedStudents: Student[] = [];
    submitted: boolean = false;

    cols: any[] = [];
    statuses: any[] = [];

    studentDialog: boolean = false;

    deleteStudentDialog: boolean = false;

    deleteStudentsDialog: boolean = false;

    rowsPerPageOptions = [5, 10, 20];

    constructor(private studentService: StudentService, private messageService: MessageService) {
    }

     ngOnInit():void {
        this.studentService.findAll().subscribe(data => {
            this.students = data.body
        });

        this.cols = [
            { field: 'id', header: 'id' },
            { field: 'phone', header: 'phone' },
            { field: 'user.firstName', header: 'First Name' },
            { field: 'user.lastName', header: 'Last Name' },
            { field: 'studentGroup.name', header: 'Group' },
        ];
    }


    openNew() {
        this.student = {};
        this.submitted = false;
        this.studentDialog = true;
    }

    deleteSelectedStudents() {

    }

    editStudent(product: Student) {

    }

    deleteStudent(student: Student) {

    }

    confirmDeleteSelected() {

    }

    confirmDelete() {

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

    saveProduct() {

    }
}
