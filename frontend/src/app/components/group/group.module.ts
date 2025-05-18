import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {GroupComponent} from "./group.component";
import {ButtonModule} from "primeng/button";
import {FileUploadModule} from "primeng/fileupload";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {RippleModule} from "primeng/ripple";
import {MessageService, SharedModule} from "primeng/api";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {GroupRoutingModule} from "./group-routing.module";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";



@NgModule({
  declarations: [ListComponent, UpdateComponent, GroupComponent],
    imports: [
        CommonModule,
        FormsModule, // Added for ngModel binding
        ButtonModule,
        FileUploadModule,
        InputTextModule,
        InputTextareaModule, // Added for textarea support
        RippleModule,
        SharedModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        DialogModule, // Added for p-dialog
        DropdownModule, // Added for potential dropdown requirements
        GroupRoutingModule
    ],
    providers: [MessageService]

})
export class GroupModule { }
