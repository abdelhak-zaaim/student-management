import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ProfessorDashboardComponent } from './professor-dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TimelineModule } from "primeng/timeline";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DashboardRoutingModule,
        TimelineModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [
        MessageService,
        ConfirmationService
    ],
    declarations: [DashboardComponent, ProfessorDashboardComponent]
})
export class DashboardModule { }
