import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { Subscription, forkJoin } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DashboardService } from '../../service/dashboard.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    // Statistics
    studentCount: number = 0;
    professorCount: number = 0;
    groupCount: number = 0;
    totalRevenue: number = 0;
    pendingPayments: number = 0;
    recentPayments: any[] = [];
    loading: boolean = true;
    monthlyRevenue: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.loadStats();
        this.initChart();

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }

    loadStats() {
        this.loading = true;

        forkJoin({
            students: this.dashboardService.getStudentCount(),
            professors: this.dashboardService.getProfessorCount(),
            groups: this.dashboardService.getGroupCount(),
            payments: this.dashboardService.getPaymentStats(),
            recentPayments: this.dashboardService.getRecentPayments(),
            monthlyRevenue: this.dashboardService.getMonthlyRevenue()
        }).subscribe({
            next: (results) => {
                this.studentCount = results.students;
                this.professorCount = results.professors;
                this.groupCount = results.groups;

                if (results.payments) {
                    this.totalRevenue = results.payments.totalRevenue || 0;
                    this.pendingPayments = results.payments.pendingCount || 0;
                }

                this.recentPayments = results.recentPayments || [];
                this.monthlyRevenue = results.monthlyRevenue || [];

                this.updateRevenueChart();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard stats:', error);
                this.loading = false;
            }
        });
    }

    updateRevenueChart() {
        if (this.monthlyRevenue && this.monthlyRevenue.length > 0) {
            const labels = this.monthlyRevenue.map(item => item.month);
            const data = this.monthlyRevenue.map(item => item.amount);

            const documentStyle = getComputedStyle(document.documentElement);

            this.chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Monthly Revenue',
                        data: data,
                        fill: false,
                        backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                        borderColor: documentStyle.getPropertyValue('--primary-color'),
                        tension: .4
                    }
                ]
            };
        }
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Default chart data if API hasn't loaded yet
        this.chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Monthly Revenue',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                    borderColor: documentStyle.getPropertyValue('--primary-color'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
