import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {GroupComponent} from "./group.component";
import {ButtonModule} from "primeng/button";
import {FileUploadModule} from "primeng/fileupload";
import {InputTextModule} from "primeng/inputtext";
import {RippleModule} from "primeng/ripple";
import {MessageService, SharedModule} from "primeng/api";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {GroupRoutingModule} from "./group-routing.module";



@NgModule({
  declarations: [ListComponent, UpdateComponent, GroupComponent],
    imports: [
        CommonModule,
        ButtonModule,
        FileUploadModule,
        InputTextModule,
        RippleModule,
        SharedModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        GroupRoutingModule
    ],
    providers: [MessageService]

})
export class GroupModule { }
