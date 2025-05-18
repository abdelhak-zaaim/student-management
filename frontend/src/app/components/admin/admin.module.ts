import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {AdminComponent} from "./admin.component";



@NgModule({
  declarations: [ListComponent, UpdateComponent, AdminComponent],
  imports: [
    CommonModule
  ]
})
export class AdminModule { }
