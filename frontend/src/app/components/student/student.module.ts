import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {StudentComponent} from "./student.component";
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
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
    declarations: [ListComponent, UpdateComponent, StudentComponent],
    imports: [
        CommonModule,
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
        StudentRoutingModule
    ],
    providers: [
        MessageService           // <-- add it here
    ],

})
export class StudentModule {
}
