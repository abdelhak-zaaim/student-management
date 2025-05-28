package com.student.management.service;

import com.student.management.domain.Payment;
import com.student.management.domain.enumeration.Status;
import com.student.management.repository.CourseAssignmentRepository;
import com.student.management.repository.PaymentRepository;
import com.student.management.repository.ProfessorRepository;
import com.student.management.repository.StudentRepository;
import com.student.management.service.dto.DashboardDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Dashboard data.
 */
@Service
@Transactional
public class DashboardService {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardService.class);

    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final PaymentRepository paymentRepository;
    private final CourseAssignmentRepository courseAssignmentRepository;

    public DashboardService(StudentRepository studentRepository,
                          ProfessorRepository professorRepository,
                          PaymentRepository paymentRepository,
                          CourseAssignmentRepository courseAssignmentRepository) {
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
        this.paymentRepository = paymentRepository;
        this.courseAssignmentRepository = courseAssignmentRepository;
    }

    /**
     * Get dashboard data.
     *
     * @return the dashboard data.
     */
    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData() {
        LOG.debug("Request to get Dashboard data");

        DashboardDTO dashboardDTO = new DashboardDTO();

        // Total Students
        dashboardDTO.setTotalStudents(studentRepository.count());

        // Total Professors
        dashboardDTO.setTotalProfessors(professorRepository.count());

        // Total Revenue (from all accepted payments)
        List<Payment> acceptedPayments = paymentRepository.findAll().stream()
            .filter(payment -> Status.ACCEPTED.equals(payment.getStatus()))
            .collect(Collectors.toList());

        Double totalRevenue = acceptedPayments.stream()
            .mapToDouble(Payment::getAmount)
            .sum();
        dashboardDTO.setTotalRevenue(totalRevenue);

        // Revenue for the last month
        LocalDate today = LocalDate.now();
        LocalDate firstDayLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayLastMonth = today.withDayOfMonth(1).minusDays(1);

        Instant startLastMonth = firstDayLastMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endLastMonth = lastDayLastMonth.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        Double lastMonthRevenue = acceptedPayments.stream()
            .filter(payment -> !payment.getDate().isBefore(startLastMonth) && payment.getDate().isBefore(endLastMonth))
            .mapToDouble(Payment::getAmount)
            .sum();
        dashboardDTO.setRevenueLastMonth(lastMonthRevenue);

        // Revenue by month for the last 4 months
        List<Map<String, Object>> revenueByMonth = new ArrayList<>();

        for (int i = 3; i >= 0; i--) {
            LocalDate firstDayOfMonth = today.minusMonths(i).withDayOfMonth(1);
            LocalDate lastDayOfMonth = i > 0
                ? firstDayOfMonth.plusMonths(1).minusDays(1)
                : today;

            Instant startOfMonth = firstDayOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endOfMonth = lastDayOfMonth.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

            Double monthlyRevenue = acceptedPayments.stream()
                .filter(payment -> !payment.getDate().isBefore(startOfMonth) && payment.getDate().isBefore(endOfMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", firstDayOfMonth.getMonth().toString());
            monthData.put("year", firstDayOfMonth.getYear());
            monthData.put("revenue", monthlyRevenue);

            revenueByMonth.add(monthData);
        }

        dashboardDTO.setRevenueByMonth(revenueByMonth);

        // Last 10 payments
        List<Payment> lastPayments = paymentRepository.findAll(
            PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "date"))
        ).getContent();

        List<Map<String, Object>> lastPaymentsData = lastPayments.stream()
            .map(payment -> {
                Map<String, Object> paymentData = new HashMap<>();
                paymentData.put("id", payment.getId());
                paymentData.put("amount", payment.getAmount());
                paymentData.put("status", payment.getStatus().name());
                paymentData.put("date", payment.getDate());
                paymentData.put("studentId", payment.getStudent().getId());
                paymentData.put("studentName", payment.getStudent().getUser().getFirstName() + " " + payment.getStudent().getUser().getLastName());
                return paymentData;
            })
            .collect(Collectors.toList());

        dashboardDTO.setLastPayments(lastPaymentsData);

        // Professor activities (last assignments)
        List<Map<String, Object>> professorActivities = courseAssignmentRepository.findAll(
            PageRequest.of(0, 10)
        ).getContent()
        .stream()
        .map(ca -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", ca.getId());
            activity.put("professorId", ca.getProfessor().getId());
            activity.put("professorName", ca.getProfessor().getUser().getFirstName() + " " + ca.getProfessor().getUser().getLastName());
            activity.put("subjectName", ca.getSubject().getName());
            activity.put("studentGroupId", ca.getStudentGroup().getId());
            return activity;
        })
        .collect(Collectors.toList());

        dashboardDTO.setProfessorActivities(professorActivities);

        return dashboardDTO;
    }

    /**
     * Get revenue statistics for a specific time period.
     *
     * @param months Number of months to look back
     * @return revenue by month.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueStatistics(Integer months) {
        LOG.debug("Request to get Revenue statistics for the last {} months", months);

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> revenueByMonth = new ArrayList<>();

        List<Payment> acceptedPayments = paymentRepository.findAll().stream()
            .filter(payment -> Status.ACCEPTED.equals(payment.getStatus()))
            .collect(Collectors.toList());

        for (int i = months - 1; i >= 0; i--) {
            LocalDate firstDayOfMonth = today.minusMonths(i).withDayOfMonth(1);
            LocalDate lastDayOfMonth = i > 0
                ? firstDayOfMonth.plusMonths(1).minusDays(1)
                : today;

            Instant startOfMonth = firstDayOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endOfMonth = lastDayOfMonth.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

            Double monthlyRevenue = acceptedPayments.stream()
                .filter(payment -> !payment.getDate().isBefore(startOfMonth) && payment.getDate().isBefore(endOfMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", firstDayOfMonth.getMonth().toString());
            monthData.put("year", firstDayOfMonth.getYear());
            monthData.put("revenue", monthlyRevenue);

            revenueByMonth.add(monthData);
        }

        return revenueByMonth;
    }

    /**
     * Get recent student payments.
     *
     * @param limit Number of payments to return
     * @return list of recent payments.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentPayments(Integer limit) {
        LOG.debug("Request to get {} recent payments", limit);

        List<Payment> recentPayments = paymentRepository.findAll(
            PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "date"))
        ).getContent();

        return recentPayments.stream()
            .map(payment -> {
                Map<String, Object> paymentData = new HashMap<>();
                paymentData.put("id", payment.getId());
                paymentData.put("amount", payment.getAmount());
                paymentData.put("status", payment.getStatus().name());
                paymentData.put("date", payment.getDate());
                paymentData.put("studentId", payment.getStudent().getId());
                paymentData.put("studentName", payment.getStudent().getUser().getFirstName() + " " + payment.getStudent().getUser().getLastName());
                return paymentData;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get professor activities.
     *
     * @param limit Number of activities to return
     * @return list of professor activities.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProfessorActivities(Integer limit) {
        LOG.debug("Request to get {} professor activities", limit);

        return courseAssignmentRepository.findAll(
            PageRequest.of(0, limit)
        ).getContent()
        .stream()
        .map(ca -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", ca.getId());
            activity.put("professorId", ca.getProfessor().getId());
            activity.put("professorName", ca.getProfessor().getUser().getFirstName() + " " + ca.getProfessor().getUser().getLastName());
            activity.put("subjectName", ca.getSubject().getName());
            activity.put("studentGroupId", ca.getStudentGroup().getId());
            return activity;
        })
        .collect(Collectors.toList());
    }
}
