import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';
import {TokenService} from "../core/auth/token.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    items!: MenuItem[];
    userMenuItems!: MenuItem[];
    logoutDialog : boolean = false;

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private tokenService: TokenService
    ) { }

    ngOnInit() {
        this.userMenuItems = [
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.logout();
                }
            }
        ];
    }

    logout() {
        this.logoutDialog = true;
    }


    confirmLogout() {
        // Clear auth token from localStorage
        this.tokenService.logout()

        // Redirect to login page
        this.router.navigate(['/auth/login']);
    }
}
