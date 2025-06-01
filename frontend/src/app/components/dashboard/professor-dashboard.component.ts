import { Component, OnInit, Input } from '@angular/core';
import { DashboardService, ProfessorStatisticsDTO } from '../../service/dashboard.service';
import { TokenService } from '../../core/auth/token.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-professor-dashboard',
  templateUrl: './professor-dashboard.component.html',
  providers: [MessageService]
})
export class ProfessorDashboardComponent implements OnInit {
  @Input() professorStats: ProfessorStatisticsDTO | null = null;

  professorLogin: string | null = null;
  loading = true;
  assignmentsBySubject: { subjectName: string, count: number }[] = [];

  // Chart data
  subjectPieChartData: any;
  subjectPieChartOptions: any;
  classGroupData: any;
  studentGroupRevenueChartOptions: any;

  constructor(
    private dashboardService: DashboardService,
    private tokenService: TokenService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.extractProfessorId();
    this.loadProfessorStats();
    this.initCharts();
  }

  private extractProfessorId(): void {
    // Extract professor ID from token
    // This is a simplification - in a real app, you would get the ID in a more secure way
    if (this.tokenService.username) {
      try {
        this.professorLogin = this.tokenService.username;
      } catch (e) {
        console.error('Failed to parse professor ID from token');
      }
    }
  }

  loadProfessorStats(): void {
    if (!this.professorLogin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot identify professor ID'
      });
      this.loading = false;
      return;
    }

    this.dashboardService.getProfessorStatistics(this.professorLogin).subscribe({
      next: (data) => {
        this.professorStats = data;

        // Process subject distribution for pie chart
        if (data.subjectDistribution) {
          this.assignmentsBySubject = Object.keys(data.subjectDistribution).map(key => ({
            subjectName: key,
            count: data.subjectDistribution[key]
          }));
        }

        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading professor statistics:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load data'
        });
        this.loading = false;
      }
    });
  }

  updateCharts(): void {
    this.updateSubjectDistributionChart();
    this.updateClassGroupsChart();
  }

  updateSubjectDistributionChart(): void {
    if (this.professorStats?.subjectDistribution) {
      const labels = Object.keys(this.professorStats.subjectDistribution);
      const data = Object.values(this.professorStats.subjectDistribution);

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

      this.subjectPieChartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors.slice(0, data.length),
            hoverBackgroundColor: backgroundColors.slice(0, data.length)
          }
        ]
      };

      this.subjectPieChartOptions = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              color: textColor
            }
          },
          title: {
            display: true,
            text: 'Classes by Subject',
            color: textColor
          }
        }
      };
    }
  }

  updateClassGroupsChart(): void {
    if (this.professorStats?.assignments) {
      // Group assignments by student group and count students
      const groupCounts = this.professorStats.assignments.reduce((acc, assignment) => {
        const groupName = assignment.studentGroupName;
        if (!acc[groupName]) {
          acc[groupName] = assignment.studentCount;
        }
        return acc;
      }, {} as Record<string, number>);

      const labels = Object.keys(groupCounts);
      const data = Object.values(groupCounts);

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      this.classGroupData = {
        labels: labels,
        datasets: [
          {
            label: 'Students per Group',
            data: data,
            backgroundColor: documentStyle.getPropertyValue('--primary-color'),
            borderColor: documentStyle.getPropertyValue('--primary-color'),
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

  initCharts(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    // Default pie chart data
    this.subjectPieChartData = {
      labels: ['No Data Available'],
      datasets: [
        {
          data: [1],
          backgroundColor: [documentStyle.getPropertyValue('--gray-500')],
          hoverBackgroundColor: [documentStyle.getPropertyValue('--gray-400')]
        }
      ]
    };

    this.subjectPieChartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };

    // Default students per group chart data
    this.classGroupData = {
      labels: ['No Data Available'],
      datasets: [
        {
          label: 'Students per Group',
          data: [0],
          backgroundColor: documentStyle.getPropertyValue('--gray-500'),
          borderColor: documentStyle.getPropertyValue('--gray-500')
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
