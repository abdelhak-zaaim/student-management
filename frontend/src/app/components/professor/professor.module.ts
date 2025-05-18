import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {ProfessorComponent} from "./professor.component";



@NgModule({
  declarations: [ListComponent, UpdateComponent, ProfessorComponent],
  imports: [
    CommonModule
  ]
})
export class ProfessorModule { }
