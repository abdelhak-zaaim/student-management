import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ListComponent} from "./list/list.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', component: ListComponent }
    ])],
    exports: [RouterModule]
})

// import it in the module
export class ProfessorRoutingModule { }
