import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { AdminComponent } from './admin.component';
import {AddComponent} from "../professor/add/add.component";


@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', component: ListComponent },
        { path: 'add', component: UpdateComponent },
        { path: 'edit/:login', component: UpdateComponent },
        { path: '', redirectTo: 'list', pathMatch: 'full' }
    ])],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
