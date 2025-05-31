package com.student.management.web.rest;

import com.student.management.service.DashboardService;
import com.student.management.service.dto.DashboardDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing dashboard data.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardResource.class);

    private final DashboardService dashboardService;

    public DashboardResource(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * {@code GET  /dashboard} : get all dashboard data.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the dashboard data.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<DashboardDTO> getDashboard() {
        LOG.debug("REST request to get Dashboard data");
        DashboardDTO dashboardData = dashboardService.getDashboardData();
        return ResponseEntity.ok().body(dashboardData);
    }

    /**
     * {@code GET  /dashboard/revenue} : get revenue statistics.
     *
     * @param months the number of months to look back (default 6).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the revenue statistics.
     */
    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueStatistics(
        @RequestParam(name = "months", defaultValue = "6") Integer months) {
        LOG.debug("REST request to get Revenue statistics for the last {} months", months);
        List<Map<String, Object>> revenueStats = dashboardService.getRevenueStatistics(months);
        return ResponseEntity.ok().body(revenueStats);
    }

    /**
     * {@code GET  /dashboard/payments} : get recent payments.
     *
     * @param limit the maximum number of payments to return (default 10).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the recent payments.
     */
    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getRecentPayments(
        @RequestParam(name = "limit", defaultValue = "10") Integer limit) {
        LOG.debug("REST request to get {} recent payments", limit);
        List<Map<String, Object>> recentPayments = dashboardService.getRecentPayments(limit);
        return ResponseEntity.ok().body(recentPayments);
    }

    /**
     * {@code GET  /dashboard/professor-activities} : get professor activities.
     *
     * @param limit the maximum number of activities to return (default 10).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the professor activities.
     */
    @GetMapping("/professor-activities")
    public ResponseEntity<List<Map<String, Object>>> getProfessorActivities(
        @RequestParam(name = "limit", defaultValue = "10") Integer limit) {
        LOG.debug("REST request to get {} professor activities", limit);
        List<Map<String, Object>> professorActivities = dashboardService.getProfessorActivities(limit);
        return ResponseEntity.ok().body(professorActivities);
    }

    /**
     * {@code GET  /dashboard/professor/{id}} : get professor-specific dashboard statistics.
     *
     * @param id the ID of the professor to get statistics for
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the professor statistics.
     */
    @GetMapping("/professors/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Map<String, Object>> getProfessorStatistics(@PathVariable Long id) {
        LOG.debug("REST request to get statistics for Professor: {}", id);
        Map<String, Object> statistics = dashboardService.getProfessorStatistics(id);
        return ResponseEntity.ok().body(statistics);
    }
}
