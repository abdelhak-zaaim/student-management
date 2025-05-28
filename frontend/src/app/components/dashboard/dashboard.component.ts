import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { DashboardService, DashboardDTO } from '../../service/dashboard.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    // Statistics from DashboardDTO
    dashboardData: DashboardDTO | null = null;
    studentCount: number = 0;
    professorCount: number = 0;
    totalRevenue: number = 0;
    revenueLastMonth: number = 0;
    groupCount: number = 0;  // Not directly available in DTO
    pendingPayments: number = 0; // Will need to calculate
    recentPayments: any[] = [];
    professorActivities: any[] = [];
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

        this.dashboardService.getDashboardData().subscribe({
            next: (data) => {
                this.dashboardData = data;

                // Map data from DTO
                this.studentCount = data.totalStudents || 0;
                this.professorCount = data.totalProfessors || 0;
                this.totalRevenue = data.totalRevenue || 0;
                this.revenueLastMonth = data.revenueLastMonth || 0;

                // Map payments
                this.recentPayments = data.lastPayments || [];

                // Map professor activities
                this.professorActivities = data.professorActivities || [];

                // Calculate pending payments (if needed)
                this.pendingPayments = this.recentPayments
                    .filter(payment => payment.status === 'PENDING')
                    .length;

                // Map monthly revenue data for chart
                this.monthlyRevenue = data.revenueByMonth || [];

                // Load group count separately as it's not in the DTO
                this.dashboardService.getGroupCount().subscribe(count => {
                    this.groupCount = count;
                });

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
            const labels = this.monthlyRevenue.map(item => item.month || '');
            const data = this.monthlyRevenue.map(item => item.amount || 0);

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
