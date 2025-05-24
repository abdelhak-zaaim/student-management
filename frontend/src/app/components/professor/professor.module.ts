import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from "./list/list.component";
import { AddComponent } from "./add/add.component";
import { UpdateComponent } from "./update/update.component";
import { ProfessorComponent } from "./professor.component";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RippleModule } from "primeng/ripple";
import { SharedModule } from "primeng/api";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { MessageService } from 'primeng/api';
import { ProfessorRoutingModule } from "./professor-routing.module";
import { MultiSelectModule } from "primeng/multiselect";



@NgModule({
  declarations: [ListComponent, UpdateComponent, ProfessorComponent, AddComponent],
    imports: [
        CommonModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        FileUploadModule,
        InputTextModule,
        ReactiveFormsModule,
        RippleModule,
        SharedModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        FormsModule,
        ProfessorRoutingModule,
        MultiSelectModule
    ],
    providers: [MessageService]
})
export class ProfessorModule { }
