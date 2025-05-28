package com.student.management.service;

import com.student.management.domain.CourseAssignment;
import com.student.management.domain.Professor;
import com.student.management.domain.StudentGroup;
import com.student.management.domain.Subject;
import com.student.management.domain.User;
import com.student.management.repository.CourseAssignmentRepository;
import com.student.management.repository.ProfessorRepository;
import com.student.management.repository.StudentGroupRepository;
import com.student.management.repository.SubjectRepository;
import com.student.management.repository.UserRepository;
import com.student.management.service.dto.ProfessorWithCourseAssignmentsDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.student.management.domain.Professor}.
 */
@Service
@Transactional
public class ProfessorService {

    private static final Logger LOG = LoggerFactory.getLogger(ProfessorService.class);

    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final CourseAssignmentRepository courseAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfessorService(
        ProfessorRepository professorRepository,
        UserRepository userRepository,
        SubjectRepository subjectRepository,
        StudentGroupRepository studentGroupRepository,
        CourseAssignmentRepository courseAssignmentRepository,
        PasswordEncoder passwordEncoder) {
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.courseAssignmentRepository = courseAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Save a professor.
     *
     * @param professor the entity to save.
     * @return the persisted entity.
     */
    public Professor save(Professor professor) {
        LOG.debug("Request to save Professor : {}", professor);
        if (professor.getUser() != null && professor.getUser().getId() == null) {
            // Create and save the new user
            String tempLogin = "professor" + System.currentTimeMillis();
            professor.getUser().setLogin(tempLogin);
            professor.setUser(userRepository.save(professor.getUser()));
        } else if (professor.getUser() != null) {
            // Load existing user if present
            Long userId = professor.getUser().getId();
            userRepository.findById(userId).ifPresent(professor::setUser);
        }
        return professorRepository.save(professor);
    }

    /**
     * Save a professor with course assignments.
     *
     * @param dto the data transfer object with professor and course assignment details.
     * @return the list of created course assignments.
     */
    @Transactional
    public List<CourseAssignment> saveWithCourseAssignments(ProfessorWithCourseAssignmentsDTO dto) {
        LOG.debug("Request to save Professor with course assignments : {}", dto);

        // Create user from DTO
        User user = new User();
        user.setFirstName(dto.getUser().getFirstName());
        user.setLastName(dto.getUser().getLastName());
        user.setEmail(dto.getUser().getEmail());

        // Set username based on email (or generate a unique one)
        String username = dto.getUser().getEmail().split("@")[0] + System.currentTimeMillis();
        user.setLogin(username);

        // Generate a temporary password
        String tempPassword = "temp" + System.currentTimeMillis();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setActivated(true);

        // Save user
        user = userRepository.save(user);

        // Create and save professor
        Professor professor = new Professor();
        professor.setUser(user);
        professor = professorRepository.save(professor);

        // Create course assignments
        List<CourseAssignment> createdAssignments = new ArrayList<>();

        for (ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO subjectGroup : dto.getSubjectGroups()) {
            // Get subject
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectGroup.getSubject().getId());

            if (subjectOpt.isPresent()) {
                Subject subject = subjectOpt.get();

                // Create assignments for each student group
                for (ProfessorWithCourseAssignmentsDTO.StudentGroupDTO groupDto : subjectGroup.getStudentGroup()) {
                    Optional<StudentGroup> groupOpt = studentGroupRepository.findById(groupDto.getId());

                    if (groupOpt.isPresent()) {
                        StudentGroup group = groupOpt.get();

                        // Create and save course assignment
                        CourseAssignment assignment = new CourseAssignment();
                        assignment.setProfessor(professor);
                        assignment.setSubject(subject);
                        assignment.setStudentGroup(group);

                        assignment = courseAssignmentRepository.save(assignment);
                        createdAssignments.add(assignment);
                    }
                }
            }
        }

        return createdAssignments;
    }

    /**
     * Update a professor.
     *
     * @param professor the entity to save.
     * @return the persisted entity.
     */
    public Professor update(Professor professor) {
        LOG.debug("Request to update Professor : {}", professor);
        return professorRepository.save(professor);
    }

    /**
     * Partially update a professor.
     *
     * @param professor the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Professor> partialUpdate(Professor professor) {
        LOG.debug("Request to partially update Professor : {}", professor);

        return professorRepository.findById(professor.getId()).map(professorRepository::save);
    }

    /**
     * Get all the professors.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Professor> findAll(Pageable pageable) {
        LOG.debug("Request to get all Professors");
        return professorRepository.findAll(pageable);
    }

    /**
     * Get all the professors with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Professor> findAllWithEagerRelationships(Pageable pageable) {
        return professorRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one professor by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Professor> findOne(Long id) {
        LOG.debug("Request to get Professor : {}", id);
        return professorRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the professor by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Professor : {}", id);
        professorRepository.deleteById(id);
    }
}
