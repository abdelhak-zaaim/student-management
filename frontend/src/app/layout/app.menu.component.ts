import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { TokenService } from '../core/auth/token.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private tokenService: TokenService
    ) { }

    ngOnInit(): void {
        const userRole = this.tokenService.role;

        if (userRole === 'ROLE_ADMIN') {
            this.initAdminMenu();
        } else if (userRole === 'ROLE_PROFESSOR') {
            this.initProfessorMenu();
        } else {
            // Default or fallback menu
            this.initDefaultMenu();
        }
    }

    private initAdminMenu(): void {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Professors',
                items: [
                    { label: 'Professors',  icon: 'pi pi-users',      routerLink: ['/profs/list'] },
                    { label: 'Add Professor',   icon: 'pi pi-user-plus',  routerLink: ['/profs/add'] }
                ]
            },
            {
                label: 'Students',
                items: [
                    { label: 'List Students', icon: 'pi pi-users',     routerLink: ['/students/list'] },
                    { label: 'Add Student',   icon: 'pi pi-user-plus', routerLink: ['/students/add'] }
                ]
            },
            {
                label: 'Payments',
                items: [
                    { label: 'Payment List', icon: 'pi pi-credit-card', routerLink: ['/payments/list'] },
                    { label: 'Make Payment', icon: 'pi pi-dollar',      routerLink: ['/payments/add'] }
                ]
            },
            {
                label: 'Groups',
                items: [
                    { label: 'Groups', icon: 'pi pi-clone', routerLink: ['/groups/list'] },
                ]
            },
            {
                label: 'Subjects',
                items: [
                    { label: 'Subjects', icon: 'pi pi-clone', routerLink: ['/subjects/list'] },
                    { label: 'Add Subject', icon: 'pi pi-clone', routerLink: ['/subjects/add'] },
                ]
            }
        ];
    }

    private initProfessorMenu(): void {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Groups',
                items: [
                    { label: 'Groups', icon: 'pi pi-clone', routerLink: ['/groups/list'] },
                ]
            }
        ];
    }

    private initDefaultMenu(): void {
        // Fallback menu with minimal access
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] }
                ]
            }
        ];
    }
}
