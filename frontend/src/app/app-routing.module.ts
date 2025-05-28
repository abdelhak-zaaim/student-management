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
                        path: '',
                        loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
                    },
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
                    {
                        path: 'payments',
                        loadChildren: () => import('./components/payment/payment.module').then(m => m.PaymentModule)
                    },
                    {
                        path: 'subjects',
                        loadChildren: () => import('./components/subject/subject.module').then(m => m.SubjectModule)
                    },
                ],
            },
            {path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule)},
            {path: '**', redirectTo: 'pages/notfound'},
        ], {scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload'})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
