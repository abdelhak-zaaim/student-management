import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {StudentComponent} from "./student.component";
import {AddComponent} from "./add/add.component";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {FileUploadModule} from "primeng/fileupload";
import {TableModule} from "primeng/table";
import {DropdownModule} from "primeng/dropdown";
import {PaginatorModule} from "primeng/paginator";
import {RadioButtonModule} from "primeng/radiobutton";
import {DialogModule} from "primeng/dialog";
import {RatingModule} from "primeng/rating";
import {RippleModule} from "primeng/ripple";
import {ChipsModule} from "primeng/chips";
import {StudentRoutingModule} from "./student-routing.module";
import {MessageService} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";
import {ProgressSpinnerModule} from "primeng/progressspinner";


@NgModule({
    declarations: [ListComponent, UpdateComponent, StudentComponent, AddComponent],
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        ToolbarModule,
        FileUploadModule,
        TableModule,
        PaginatorModule,
        RadioButtonModule,
        DialogModule,
        RatingModule,
        RippleModule,
        ChipsModule,
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        DropdownModule,
        StudentRoutingModule,
        ProgressSpinnerModule
    ],
    providers: [
        MessageService
    ],

})
export class StudentModule {
}
