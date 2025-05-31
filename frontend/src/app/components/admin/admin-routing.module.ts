import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { AdminComponent } from './admin.component';
import {AddComponent} from "../professor/add/add.component";

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', component: ListComponent },
      { path: 'list', component: ListComponent },
      { path: 'add', component: UpdateComponent },
      { path: 'edit/:id', component: UpdateComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  }
];

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', component: ListComponent },
        { path: 'add', component: UpdateComponent },
        { path: 'edit/:id', component: UpdateComponent },
        { path: '', redirectTo: 'list', pathMatch: 'full' }
    ])],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
