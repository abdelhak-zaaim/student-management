package com.student.management.service.dto;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * A DTO for the Dashboard data.
 */
public class DashboardDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalStudents;
    private Long totalProfessors;
    private Long totalStudentGroups;
    private Long totalSubjects;
    private Long totalPayments;
    private Long pendingPayments;
    private Double averagePaymentAmount;
    private Double totalRevenue;
    private Double revenueLastMonth;
    private List<Map<String, Object>> revenueByMonth;
    private List<Map<String, Object>> lastPayments;
    private List<Map<String, Object>> professorActivities;
    private Map<String, Long> studentsPerGroup;
    private Map<String, Long> paymentsPerStatus;
    private RevenueOverviewDTO revenueOverview;

    // Inner class for Revenue Overview
    public static class RevenueOverviewDTO implements Serializable {
        private static final long serialVersionUID = 1L;

        private Double totalRevenue;
        private Double currentMonthRevenue;
        private Double previousMonthRevenue;
        private Double monthOverMonthChange;
        private Double averageMonthlyRevenue;
        private Map<String, Double> revenueByPaymentMethod;
        private Map<String, Double> topRevenueByStudentGroup;

        public Double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(Double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public Double getCurrentMonthRevenue() {
            return currentMonthRevenue;
        }

        public void setCurrentMonthRevenue(Double currentMonthRevenue) {
            this.currentMonthRevenue = currentMonthRevenue;
        }

        public Double getPreviousMonthRevenue() {
            return previousMonthRevenue;
        }

        public void setPreviousMonthRevenue(Double previousMonthRevenue) {
            this.previousMonthRevenue = previousMonthRevenue;
        }

        public Double getMonthOverMonthChange() {
            return monthOverMonthChange;
        }

        public void setMonthOverMonthChange(Double monthOverMonthChange) {
            this.monthOverMonthChange = monthOverMonthChange;
        }

        public Double getAverageMonthlyRevenue() {
            return averageMonthlyRevenue;
        }

        public void setAverageMonthlyRevenue(Double averageMonthlyRevenue) {
            this.averageMonthlyRevenue = averageMonthlyRevenue;
        }

        public Map<String, Double> getRevenueByPaymentMethod() {
            return revenueByPaymentMethod;
        }

        public void setRevenueByPaymentMethod(Map<String, Double> revenueByPaymentMethod) {
            this.revenueByPaymentMethod = revenueByPaymentMethod;
        }

        public Map<String, Double> getTopRevenueByStudentGroup() {
            return topRevenueByStudentGroup;
        }

        public void setTopRevenueByStudentGroup(Map<String, Double> topRevenueByStudentGroup) {
            this.topRevenueByStudentGroup = topRevenueByStudentGroup;
        }
    }

    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getTotalProfessors() {
        return totalProfessors;
    }

    public void setTotalProfessors(Long totalProfessors) {
        this.totalProfessors = totalProfessors;
    }

    public Long getTotalStudentGroups() {
        return totalStudentGroups;
    }

    public void setTotalStudentGroups(Long totalStudentGroups) {
        this.totalStudentGroups = totalStudentGroups;
    }

    public Long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(Long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public Long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(Long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public Long getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(Long pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public Double getAveragePaymentAmount() {
        return averagePaymentAmount;
    }

    public void setAveragePaymentAmount(Double averagePaymentAmount) {
        this.averagePaymentAmount = averagePaymentAmount;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Double getRevenueLastMonth() {
        return revenueLastMonth;
    }

    public void setRevenueLastMonth(Double revenueLastMonth) {
        this.revenueLastMonth = revenueLastMonth;
    }

    public List<Map<String, Object>> getRevenueByMonth() {
        return revenueByMonth;
    }

    public void setRevenueByMonth(List<Map<String, Object>> revenueByMonth) {
        this.revenueByMonth = revenueByMonth;
    }

    public List<Map<String, Object>> getLastPayments() {
        return lastPayments;
    }

    public void setLastPayments(List<Map<String, Object>> lastPayments) {
        this.lastPayments = lastPayments;
    }

    public List<Map<String, Object>> getProfessorActivities() {
        return professorActivities;
    }

    public void setProfessorActivities(List<Map<String, Object>> professorActivities) {
        this.professorActivities = professorActivities;
    }

    public Map<String, Long> getStudentsPerGroup() {
        return studentsPerGroup;
    }

    public void setStudentsPerGroup(Map<String, Long> studentsPerGroup) {
        this.studentsPerGroup = studentsPerGroup;
    }

    public Map<String, Long> getPaymentsPerStatus() {
        return paymentsPerStatus;
    }

    public void setPaymentsPerStatus(Map<String, Long> paymentsPerStatus) {
        this.paymentsPerStatus = paymentsPerStatus;
    }

    public RevenueOverviewDTO getRevenueOverview() {
        return revenueOverview;
    }

    public void setRevenueOverview(RevenueOverviewDTO revenueOverview) {
        this.revenueOverview = revenueOverview;
    }

    @Override
    public String toString() {
        return "DashboardDTO{" +
            "totalStudents=" + totalStudents +
            ", totalProfessors=" + totalProfessors +
            ", totalStudentGroups=" + totalStudentGroups +
            ", totalSubjects=" + totalSubjects +
            ", totalPayments=" + totalPayments +
            ", pendingPayments=" + pendingPayments +
            ", averagePaymentAmount=" + averagePaymentAmount +
            ", totalRevenue=" + totalRevenue +
            ", revenueLastMonth=" + revenueLastMonth +
            ", revenueByMonth=" + revenueByMonth +
            ", lastPayments=" + lastPayments +
            ", professorActivities=" + professorActivities +
            ", studentsPerGroup=" + studentsPerGroup +
            ", paymentsPerStatus=" + paymentsPerStatus +
            ", revenueOverview=" + revenueOverview +
            '}';
    }
}
