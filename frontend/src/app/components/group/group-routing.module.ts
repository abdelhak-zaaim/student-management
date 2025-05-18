import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', redirectTo: 'list', pathMatch: 'full' },

        {path: 'list', component: ListComponent},
        {path: 'update', component: UpdateComponent}
    ])],
    exports: [RouterModule]
})
export class GroupRoutingModule {
}
