import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListComponent } from "./list/list.component";
import { AddComponent } from "./add/add.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', component: ListComponent },
        { path: 'add', component: AddComponent },
        { path: '', redirectTo: 'list', pathMatch: 'full' }
    ])],
    exports: [RouterModule]
})
export class ProfessorRoutingModule { }
