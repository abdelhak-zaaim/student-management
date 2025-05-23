import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AppLayoutComponent} from "./layout/app.layout.component";
import {AuthGuard} from "./guards/auth.guard";

@NgModule({
    imports: [
        RouterModule.forRoot([


            {
                path: '', component: AppLayoutComponent,
                canActivate: [AuthGuard],
                canActivateChild: [AuthGuard],

                children: [
                    {
                        path: 'students',
                        loadChildren: () => import('./components/student/student.module').then(m => m.StudentModule)
                    },

                    {
                        path: 'groups',
                        loadChildren: () => import('./components/group/group.module').then(m => m.GroupModule)
                    },
                    {
                        path: 'profs',
                        loadChildren: () => import('./components/professor/professor.module').then(m => m.ProfessorModule)
                    },


                ],
            },


            {path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule)},


            {path: '**', redirectTo: 'pages/notfound'},
        ], {enableTracing: true,scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload'})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
