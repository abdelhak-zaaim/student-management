import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit(): void {
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
            /* --- NEW SECTION --- */
            {
                label: 'Groups',
                items: [
                    { label: 'Groups', icon: 'pi pi-clone',       routerLink: ['/groups/list'] },
                ]
            },

            {
                label: 'Subjects',
                items: [
                    { label: 'Subjects', icon: 'pi pi-clone',       routerLink: ['/subjects/list'] },
                    { label: 'Add Subject', icon: 'pi pi-clone',       routerLink: ['/subjects/add'] },
                ]
            }
        ];
    }
}
