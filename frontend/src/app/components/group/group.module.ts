import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {GroupComponent} from "./group.component";



@NgModule({
  declarations: [ListComponent, UpdateComponent, GroupComponent],
  imports: [
    CommonModule
  ]
})
export class GroupModule { }
