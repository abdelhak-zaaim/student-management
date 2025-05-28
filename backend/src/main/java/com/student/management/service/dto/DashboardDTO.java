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
    private Double totalRevenue;
    private Double revenueLastMonth;
    private List<Map<String, Object>> revenueByMonth;
    private List<Map<String, Object>> lastPayments;
    private List<Map<String, Object>> professorActivities;

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

    @Override
    public String toString() {
        return "DashboardDTO{" +
            "totalStudents=" + totalStudents +
            ", totalProfessors=" + totalProfessors +
            ", totalRevenue=" + totalRevenue +
            ", revenueLastMonth=" + revenueLastMonth +
            ", revenueByMonth=" + revenueByMonth +
            ", lastPayments=" + lastPayments +
            ", professorActivities=" + professorActivities +
            '}';
    }
}
