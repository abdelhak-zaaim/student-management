import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import {
    DashboardService,
    DashboardDTO,
    RevenueOverviewDTO,
    ProfessorStatisticsDTO
} from '../../service/dashboard.service';
import { TokenService } from '../../core/auth/token.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    chartData: any;
    chartOptions: any;
    pieChartData: any;
    pieChartOptions: any;
    paymentMethodChartData: any;
    paymentMethodChartOptions: any;
    studentGroupRevenueChartData: any;
    studentGroupRevenueChartOptions: any;
    subscription!: Subscription;

    // User role properties
    userRole: string | null = null;
    isProfessor: boolean = false;
    isAdmin: boolean = false;
    professorLogin: string | null = null;

    // Statistics from DashboardDTO
    dashboardData: DashboardDTO | null = null;
    studentCount: number = 0;
    professorCount: number = 0;
    totalRevenue: number = 0;
    revenueLastMonth: number = 0;
    totalStudentGroups: number = 0;
    totalSubjects: number = 0;
    totalPayments: number = 0;
    pendingPayments: number = 0;
    averagePaymentAmount: number = 0;
    recentPayments: any[] = [];
    professorActivities: any[] = [];
    studentsPerGroup: { [key: string]: number } = {};
    paymentsPerStatus: { [key: string]: number } = {};
    revenueOverview: RevenueOverviewDTO | null = null;

    // New revenue overview properties
    averageMonthlyRevenue: number = 0;
    revenueByPaymentMethod: { [key: string]: number } = {};
    topRevenueByStudentGroup: { [key: string]: number } = {};

    loading: boolean = true;
    monthlyRevenue: any[] = [];
    professorStats: ProfessorStatisticsDTO | null | undefined;

    constructor(
        public layoutService: LayoutService,
        private dashboardService: DashboardService,
        private tokenService: TokenService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initCharts();
        });
    }

    ngOnInit() {
        // Determine user role
        this.userRole = this.tokenService.role;
        this.isAdmin = this.userRole === 'ROLE_ADMIN';
        this.isProfessor = this.userRole === 'ROLE_PROFESSOR';

        // Log user role for debugging
        console.log('User role:', this.userRole);
        // is admin or professor log
        if (this.isAdmin) {
            console.log('User is an admin');
        } else if (this.isProfessor) {
            console.log('User is a professor');
        } else {
            console.warn('Unknown user role:', this.userRole);
        }

        // Get professor ID from token if needed
        if (this.isProfessor && this.tokenService.username) {
            // log
            console.log('Extracting professor ID from token:', this.tokenService.username);
            try {
                // Assuming the username could be or contain the professor ID
                this.professorLogin = this.tokenService.username,
                // log
                console.log('Extracted professor ID:', this.professorLogin);
            } catch (e) {
                console.error('Failed to parse professor ID from token');
            }
        }

        this.loadStats();
        this.initCharts();

        this.items = [
            { label: 'Refresh Data', icon: 'pi pi-refresh', command: () => this.loadStats() },
            { label: 'Export', icon: 'pi pi-download' }
        ];
    }

    loadStats() {
        this.loading = true;

        if (this.isAdmin) {
            this.loadAdminStats();
        } else if (this.isProfessor && this.professorLogin) {
            this.loadProfessorStats(this.professorLogin);
        } else {
            console.warn('Unknown user role or missing professorId');
            this.loading = false;
        }
    }

    // Calculate width percentage for student group progress bars
    calculateProgressWidth(studentCount: number): number {
        // Find max value in studentsPerGroup for scaling
        if (!this.studentsPerGroup || Object.keys(this.studentsPerGroup).length === 0) {
            return 0;
        }

        const maxStudents = Math.max(...Object.values(this.studentsPerGroup));
        if (maxStudents <= 0) {
            return 0;
        }

        // Calculate width as percentage of max value (cap at 100%)
        return Math.min(100, (studentCount / maxStudents) * 100);
    }

    loadAdminStats() {
        this.dashboardService.getDashboardData().subscribe({
            next: (data) => {
                this.dashboardData = data;

                // Map data from DTO
                this.studentCount = data.totalStudents || 0;
                this.professorCount = data.totalProfessors || 0;
                this.totalStudentGroups = data.totalStudentGroups || 0;
                this.totalSubjects = data.totalSubjects || 0;
                this.totalPayments = data.totalPayments || 0;
                this.pendingPayments = data.pendingPayments || 0;
                this.averagePaymentAmount = data.averagePaymentAmount || 0;
                this.totalRevenue = data.totalRevenue || 0;
                this.revenueLastMonth = data.revenueLastMonth || 0;

                // Map collections
                this.recentPayments = data.lastPayments || [];
                this.professorActivities = data.professorActivities || [];
                this.studentsPerGroup = data.studentsPerGroup || {};
                this.paymentsPerStatus = data.paymentsPerStatus || {};
                this.revenueOverview = data.revenueOverview || null;

                // Map new revenue overview properties from revenueOverview object
                if (data.revenueOverview) {
                    this.averageMonthlyRevenue = data.revenueOverview.averageMonthlyRevenue || 0;
                    this.revenueByPaymentMethod = data.revenueOverview.revenueByPaymentMethod || {};
                    this.topRevenueByStudentGroup = data.revenueOverview.topRevenueByStudentGroup || {};
                }

                // Map monthly revenue data for chart
                this.monthlyRevenue = data.revenueByMonth || [];

                this.updateCharts();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard stats:', error);
                this.loading = false;
            }
        });
    }

    loadProfessorStats(professorLogin: string) {
        this.dashboardService.getProfessorStatistics(professorLogin).subscribe({
            next: (data) => {
                this.professorStats = data;
                this.loading = false;
                console.log('Loaded professor stats:', data);
            },
            error: (error) => {
                console.error('Error loading professor statistics:', error);
                this.loading = false;
            }
        });
    }

    updateCharts() {
        this.updateRevenueChart();
        this.updatePaymentStatusChart();
        this.updatePaymentMethodChart();
        this.updateStudentGroupRevenueChart();
    }

    updateRevenueChart() {
        if (this.monthlyRevenue && this.monthlyRevenue.length > 0) {
            const labels = this.monthlyRevenue.map(item => item.month || '');
            const data = this.monthlyRevenue.map(item => item.revenue || item.amount || 0);

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

    updatePaymentStatusChart() {
        if (this.paymentsPerStatus && Object.keys(this.paymentsPerStatus).length > 0) {
            const labels = Object.keys(this.paymentsPerStatus);
            const data = Object.values(this.paymentsPerStatus);

            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');

            // Generate colors for pie chart
            const backgroundColors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--purple-500')
            ];

            this.pieChartData = {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors,
                        hoverBackgroundColor: backgroundColors
                    }
                ]
            };

            this.pieChartOptions = {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            color: textColor
                        }
                    }
                }
            };
        }
    }

    updatePaymentMethodChart() {
        if (this.revenueByPaymentMethod && Object.keys(this.revenueByPaymentMethod).length > 0) {
            const labels = Object.keys(this.revenueByPaymentMethod);
            const data = Object.values(this.revenueByPaymentMethod);

            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');

            // Generate colors for pie chart
            const backgroundColors = [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--red-500'),
                documentStyle.getPropertyValue('--purple-500')
            ];

            this.paymentMethodChartData = {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors,
                        hoverBackgroundColor: backgroundColors
                    }
                ]
            };

            this.paymentMethodChartOptions = {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            color: textColor
                        }
                    }
                }
            };
        }
    }

    updateStudentGroupRevenueChart() {
        if (this.topRevenueByStudentGroup && Object.keys(this.topRevenueByStudentGroup).length > 0) {
            const labels = Object.keys(this.topRevenueByStudentGroup);
            const data = Object.values(this.topRevenueByStudentGroup);

            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');

            this.studentGroupRevenueChartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue by Student Group',
                        data: data,
                        backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                        borderColor: documentStyle.getPropertyValue('--primary-color'),
                        tension: .4
                    }
                ]
            };

            this.studentGroupRevenueChartOptions = {
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
                            color: textColor
                        }
                    },
                    y: {
                        ticks: {
                            color: textColor
                        }
                    }
                }
            };
        }
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Default chart data if API hasn't loaded yet
        this.chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Monthly Revenue',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            return `Revenue: $${context.raw.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
                        }
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

        // Default pie chart data
        this.pieChartData = {
            labels: ['Paid', 'Pending', 'Canceled'],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--red-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--red-400')
                    ]
                }
            ]
        };

        this.pieChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };

        // Default payment method chart data
        this.paymentMethodChartData = {
            labels: ['Credit Card', 'PayPal', 'Bank Transfer'],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--green-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--green-400')
                    ]
                }
            ]
        };

        this.paymentMethodChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };

        // Default student group revenue chart data
        this.studentGroupRevenueChartData = {
            labels: ['Group A', 'Group B', 'Group C'],
            datasets: [
                {
                    label: 'Revenue by Student Group',
                    data: [0, 0, 0],
                    backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                    borderColor: documentStyle.getPropertyValue('--primary-color'),
                    tension: .4
                }
            ]
        };

        this.studentGroupRevenueChartOptions = {
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
                        color: textColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    }
                }
            }
        };
    }

    getPercentChange(): string {
        if (this.revenueOverview && this.revenueOverview.percentageChange) {
            const change = this.revenueOverview.percentageChange;
            return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
        }
        return '0%';
    }

    isPositiveChange(): boolean {
        return this.revenueOverview ? (this.revenueOverview.percentageChange >= 0) : false;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
