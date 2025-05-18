import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';


import { NgForm } from '@angular/forms';
   // <-- new import
import { Router } from '@angular/router';
import {Message, MessageService} from "primeng/api";
import {AuthService} from "../../../core/auth/auth.service";


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [MessageService],
    styles: [`
        :host ::ng-deep .p-password input {
            width: 100%;
            padding:1rem;
        }

        :host ::ng-deep .pi-eye{
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }

        :host ::ng-deep .pi-eye-slash{
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
// …imports are the same
export class LoginComponent {

    msgs: Message[] = [];



    model   = { username: '', password: '', remember: false };
    errors  : Record<string, string> = {};     // <-- NEW
    submitting = false;

    constructor(
        public  layoutService: LayoutService,
        private authService  : AuthService,
        private router       : Router,
        private messageService: MessageService
    ) {}

    onSubmit(form: NgForm): void {
        if (form.invalid) { return; }

        this.errors      = {};                 // clear old messages
        this.submitting  = true;

        this.authService.login({
                username  : this.model.username,   // or a real username field
                password  : this.model.password,
                rememberMe: this.model.remember // checkbox value
            }
        ).subscribe({
            next : () => this.router.navigate(['/']),
            error: err => {
                this.submitting = false;

                if (err.status === 400 && err.error?.fieldErrors) {
                    err.error.fieldErrors.forEach((fe: any) => {
                        // backend uses "username" so map to our "email" input
                        const key = fe.field === 'username' ? 'email' : fe.field;
                        this.errors[key] = fe.message;
                    });
                }


                this.showErrorViaMessages(err.error?.message || 'Validation error')
            }
        });
    }


    showInfoViaMessages(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'info',  detail: message });
    }

    showWarnViaMessages(message: string ) {
        this.msgs = [];
        this.msgs.push({ severity: 'warn',  detail: message });
    }

    showErrorViaMessages(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

    showSuccessViaMessages(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }
}
