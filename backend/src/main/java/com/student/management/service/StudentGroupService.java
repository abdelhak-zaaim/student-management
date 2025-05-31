package com.student.management.service;

import com.student.management.domain.StudentGroup;
import com.student.management.repository.StudentGroupRepository;
import com.student.management.repository.StudentRepository;
import com.student.management.security.SecurityUtils;
import com.student.management.service.exception.BusinessException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.student.management.domain.StudentGroup}.
 */
@Service
@Transactional
public class StudentGroupService {

    private static final Logger LOG = LoggerFactory.getLogger(StudentGroupService.class);

    private final StudentGroupRepository studentGroupRepository;
    private final StudentRepository studentRepository;

    public StudentGroupService(StudentGroupRepository studentGroupRepository, StudentRepository studentRepository) {
        this.studentGroupRepository = studentGroupRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Save a studentGroup.
     *
     * @param studentGroup the entity to save.
     * @return the persisted entity.
     */
    public StudentGroup save(StudentGroup studentGroup) {
        LOG.debug("Request to save StudentGroup : {}", studentGroup);
        return studentGroupRepository.save(studentGroup);
    }

    /**
     * Update a studentGroup.
     *
     * @param studentGroup the entity to save.
     * @return the persisted entity.
     */
    public StudentGroup update(StudentGroup studentGroup) {
        LOG.debug("Request to update StudentGroup : {}", studentGroup);
        return studentGroupRepository.save(studentGroup);
    }

    /**
     * Partially update a studentGroup.
     *
     * @param studentGroup the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<StudentGroup> partialUpdate(StudentGroup studentGroup) {
        LOG.debug("Request to partially update StudentGroup : {}", studentGroup);

        return studentGroupRepository
            .findById(studentGroup.getId())
            .map(existingStudentGroup -> {
                if (studentGroup.getName() != null) {
                    existingStudentGroup.setName(studentGroup.getName());
                }
                if (studentGroup.getDescription() != null) {
                    existingStudentGroup.setDescription(studentGroup.getDescription());
                }

                return existingStudentGroup;
            })
            .map(studentGroupRepository::save);
    }

    /**
     * Get all the studentGroups.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<StudentGroup> findAll(Pageable pageable) {
        LOG.debug("Request to get all StudentGroups");
        return studentGroupRepository.findAll(pageable);
    }

    /**
     * Get all the studentGroups with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<StudentGroup> findAllWithEagerRelationships(Pageable pageable) {
        return studentGroupRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one studentGroup by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<StudentGroup> findOne(Long id) {
        LOG.debug("Request to get StudentGroup : {}", id);
        return studentGroupRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the studentGroup by id.
     *
     * @param id the id of the entity.
     * @throws BusinessException if the student group has associated students
     */
    public void delete(Long id) {
        LOG.debug("Request to delete StudentGroup : {}", id);
        
        // Check if there are students associated with this group
        if (studentRepository.existsByStudentGroupId(id)) {
            long studentCount = studentRepository.countByStudentGroupId(id);
            throw new BusinessException(
                "Cannot delete Student Group with ID " + id + " because it has " + 
                studentCount + " associated student(s). Remove all students from the group first."
            );
        }
        
        studentGroupRepository.deleteById(id);
    }

    /**
     * Get all the studentGroups for a specific professor based on course assignments.
     *
     * @param professorId the ID of the professor
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<StudentGroup> findByProfessorId(Long professorId, Pageable pageable) {
        LOG.debug("Request to get StudentGroups for Professor ID: {}", professorId);
        return studentGroupRepository.findByProfessorId(professorId, pageable);
    }

    /**
     * Get all the studentGroups for the current logged-in professor based on course assignments.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<StudentGroup> findByCurrentProfessor(Pageable pageable) {
        LOG.debug("Request to get StudentGroups for current Professor");

        // Get current user login
        String currentUserLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new IllegalStateException("Current user login not found"));

        LOG.debug("Current user login: {}", currentUserLogin);

        return studentGroupRepository.findByProfessorLogin(currentUserLogin, pageable);
    }
}
