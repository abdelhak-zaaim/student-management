package com.student.management.service;

import com.student.management.domain.Payment;
import com.student.management.domain.StudentGroup;
import com.student.management.domain.enumeration.Status;
import com.student.management.repository.*;
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
    private final StudentGroupRepository studentGroupRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public DashboardService(StudentRepository studentRepository,
                          ProfessorRepository professorRepository,
                          PaymentRepository paymentRepository,
                          CourseAssignmentRepository courseAssignmentRepository,
                          StudentGroupRepository studentGroupRepository,
                          SubjectRepository subjectRepository,
                          UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
        this.paymentRepository = paymentRepository;
        this.courseAssignmentRepository = courseAssignmentRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
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

        // Total Student Groups
        dashboardDTO.setTotalStudentGroups(studentGroupRepository.count());

        // Total Subjects
        dashboardDTO.setTotalSubjects(subjectRepository.count());

        // All payments
        List<Payment> allPayments = paymentRepository.findAll();

        // Total Payments count
        dashboardDTO.setTotalPayments((long) allPayments.size());

        // Pending Payments count
        long pendingPaymentsCount = allPayments.stream()
            .filter(payment -> Status.PENDING.equals(payment.getStatus()))
            .count();
        dashboardDTO.setPendingPayments(pendingPaymentsCount);

        // Average Payment Amount
        Double averagePayment = allPayments.stream()
            .mapToDouble(Payment::getAmount)
            .average()
            .orElse(0.0);
        dashboardDTO.setAveragePaymentAmount(averagePayment);

        // Total Revenue (from all accepted payments)
        List<Payment> acceptedPayments = allPayments.stream()
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

        // Generate Revenue Overview
        DashboardDTO.RevenueOverviewDTO revenueOverview = new DashboardDTO.RevenueOverviewDTO();

        // Set total revenue
        revenueOverview.setTotalRevenue(totalRevenue);

        // Current month revenue
        LocalDate firstDayCurrentMonth = today.withDayOfMonth(1);
        Instant startCurrentMonth = firstDayCurrentMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();

        Double currentMonthRevenue = acceptedPayments.stream()
            .filter(payment -> !payment.getDate().isBefore(startCurrentMonth))
            .mapToDouble(Payment::getAmount)
            .sum();
        revenueOverview.setCurrentMonthRevenue(currentMonthRevenue);

        // Previous month revenue (we already calculated it above)
        revenueOverview.setPreviousMonthRevenue(lastMonthRevenue);

        // Month over month change (percentage)
        Double monthOverMonthChange = 0.0;
        if (lastMonthRevenue > 0) {
            monthOverMonthChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        }
        revenueOverview.setMonthOverMonthChange(monthOverMonthChange);

        // Average monthly revenue (for the last 6 months)
        List<Double> lastSixMonthsRevenue = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
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

            lastSixMonthsRevenue.add(monthlyRevenue);
        }

        Double averageMonthlyRevenue = lastSixMonthsRevenue.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
        revenueOverview.setAverageMonthlyRevenue(averageMonthlyRevenue);

        // Top revenue by student group
        Map<String, Double> revenueByStudentGroup = new HashMap<>();
        Map<Long, String> groupIdToNameMap = new HashMap<>();

        // Create a map of group ID to name for faster lookups
        studentGroupRepository.findAll().forEach(group ->
            groupIdToNameMap.put(group.getId(), group.getName())
        );

        // Group payments by student group and calculate total revenue
        Map<Long, List<Payment>> paymentsByStudentGroup = acceptedPayments.stream()
            .filter(payment -> payment.getStudent() != null && payment.getStudent().getStudentGroup() != null)
            .collect(Collectors.groupingBy(payment -> payment.getStudent().getStudentGroup().getId()));

        paymentsByStudentGroup.forEach((groupId, payments) -> {
            Double groupRevenue = payments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();

            String groupName = groupIdToNameMap.getOrDefault(groupId, "Unknown Group");
            revenueByStudentGroup.put(groupName, groupRevenue);
        });

        // Get top 5 groups by revenue
        Map<String, Double> topRevenueByGroup = revenueByStudentGroup.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (e1, e2) -> e1,
                LinkedHashMap::new
            ));

        revenueOverview.setTopRevenueByStudentGroup(topRevenueByGroup);

        // Since we don't have payment method in the Payment entity, we'll create a placeholder
        // For a real implementation, you would group by payment.getPaymentMethod() or similar
        Map<String, Double> revenueByPaymentMethod = new HashMap<>();
        revenueByPaymentMethod.put("Credit Card", totalRevenue * 0.65); // Placeholder data
        revenueByPaymentMethod.put("Bank Transfer", totalRevenue * 0.25); // Placeholder data
        revenueByPaymentMethod.put("Cash", totalRevenue * 0.1); // Placeholder data

        revenueOverview.setRevenueByPaymentMethod(revenueByPaymentMethod);

        // Set the revenue overview to dashboard DTO
        dashboardDTO.setRevenueOverview(revenueOverview);

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

        // Students per group
        Map<String, Long> studentsPerGroup = new HashMap<>();
        List<StudentGroup> allGroups = studentGroupRepository.findAll();

        for (StudentGroup group : allGroups) {
            long studentCount = group.getStudents().size();
            studentsPerGroup.put(group.getName(), studentCount);
        }
        dashboardDTO.setStudentsPerGroup(studentsPerGroup);

        // Payments per status
        Map<String, Long> paymentsPerStatus = new HashMap<>();
        Arrays.stream(Status.values()).forEach(status -> {
            long count = allPayments.stream()
                .filter(payment -> status.equals(payment.getStatus()))
                .count();
            paymentsPerStatus.put(status.name(), count);
        });
        dashboardDTO.setPaymentsPerStatus(paymentsPerStatus);

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
            activity.put("studentGroupName", ca.getStudentGroup().getName());
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
            activity.put("studentGroupName", ca.getStudentGroup().getName());
            return activity;
        })
        .collect(Collectors.toList());
    }

    /**
     * Get statistics for a specific professor.
     *
     * @param professorId ID of the professor
     * @return Map with professor statistics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProfessorStatistics(Long professorId) {
        LOG.debug("Request to get statistics for professor with ID: {}", professorId);

        Map<String, Object> statistics = new HashMap<>();

        // Get professor's course assignments
        List<Map<String, Object>> assignments = courseAssignmentRepository.findByProfessorId(professorId)
            .stream()
            .map(ca -> {
                Map<String, Object> assignment = new HashMap<>();
                assignment.put("id", ca.getId());
                assignment.put("subjectId", ca.getSubject().getId());
                assignment.put("subjectName", ca.getSubject().getName());
                assignment.put("studentGroupId", ca.getStudentGroup().getId());
                assignment.put("studentGroupName", ca.getStudentGroup().getName());
                assignment.put("studentCount", ca.getStudentGroup().getStudents().size());
                return assignment;
            })
            .collect(Collectors.toList());

        // Count distinct student groups the professor is teaching
        long distinctGroups = assignments.stream()
            .map(a -> a.get("studentGroupId"))
            .distinct()
            .count();

        // Count distinct subjects the professor is teaching
        long distinctSubjects = assignments.stream()
            .map(a -> a.get("subjectId"))
            .distinct()
            .count();

        // Total number of students the professor is teaching
        long totalStudents = assignments.stream()
            .mapToLong(a -> {
                // Safely handle conversion between Integer and Long
                Object countObj = a.get("studentCount");
                if (countObj instanceof Integer) {
                    return ((Integer) countObj).longValue();
                } else if (countObj instanceof Long) {
                    return (Long) countObj;
                }
                return 0L; // Default if for some reason the count is missing or has an unexpected type
            })
            .sum();

        // Summary statistics
        statistics.put("totalAssignments", assignments.size());
        statistics.put("totalStudentGroups", distinctGroups);
        statistics.put("totalSubjects", distinctSubjects);
        statistics.put("totalStudents", totalStudents);
        statistics.put("assignments", assignments);

        // Group assignments by subject
        Map<String, Long> subjectDistribution = assignments.stream()
            .collect(Collectors.groupingBy(
                a -> (String) a.get("subjectName"),
                Collectors.counting()
            ));
        statistics.put("subjectDistribution", subjectDistribution);

        return statistics;
    }

    /**
     * Get statistics for a professor by login.
     *
     * @param login Login of the professor
     * @return Map with professor statistics.
     * @throws IllegalArgumentException if the professor is not found
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProfessorStatisticsByLogin(String login) {
        LOG.debug("Request to get statistics for professor with login: {}", login);

        // Find the professor by login
        return userRepository.findOneByLogin(login)
            .map(user -> professorRepository.findById(user.getId())
                .map(professor -> getProfessorStatistics(professor.getId()))
                .orElseThrow(() -> new IllegalArgumentException("No professor found with login: " + login)))
            .orElseThrow(() -> new IllegalArgumentException("No user found with login: " + login));
    }
}
