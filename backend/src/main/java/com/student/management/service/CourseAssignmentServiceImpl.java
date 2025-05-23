package com.student.management.service;


import com.student.management.domain.CourseAssignment;
import com.student.management.repository.CourseAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseAssignmentServiceImpl implements CourseAssignmentService {

    private final Logger log = LoggerFactory.getLogger(CourseAssignmentServiceImpl.class);

    private final CourseAssignmentRepository courseAssignmentRepository;

    public CourseAssignmentServiceImpl(CourseAssignmentRepository courseAssignmentRepository) {
        this.courseAssignmentRepository = courseAssignmentRepository;
    }

    @Override
    public CourseAssignment save(CourseAssignment courseAssignment) {
        log.debug("Request to save CourseAssignment : {}", courseAssignment);
        return courseAssignmentRepository.save(courseAssignment);
    }

    @Override
    public Optional<CourseAssignment> partialUpdate(CourseAssignment courseAssignment) {
        log.debug("Request to partially update CourseAssignment : {}", courseAssignment);

        return courseAssignmentRepository
            .findById(courseAssignment.getId())
            .map(existingAssignment -> {
                if (courseAssignment.getStudentGroup() != null) {
                    existingAssignment.setStudentGroup(courseAssignment.getStudentGroup());
                }
                if (courseAssignment.getSubject() != null) {
                    existingAssignment.setSubject(courseAssignment.getSubject());
                }
                if (courseAssignment.getProfessor() != null) {
                    existingAssignment.setProfessor(courseAssignment.getProfessor());
                }
                return existingAssignment;
            })
            .map(courseAssignmentRepository::save);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAssignment> findAll() {
        log.debug("Request to get all CourseAssignments");
        return courseAssignmentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseAssignment> findAll(Pageable pageable) {
        log.debug("Request to get all CourseAssignments with pagination");
        return courseAssignmentRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CourseAssignment> findOne(Long id) {
        log.debug("Request to get CourseAssignment : {}", id);
        return courseAssignmentRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete CourseAssignment : {}", id);
        courseAssignmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAssignment> findByStudentGroupId(Long studentGroupId) {
        log.debug("Request to get CourseAssignments by StudentGroup ID : {}", studentGroupId);
        return courseAssignmentRepository.findByStudentGroupId(studentGroupId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAssignment> findBySubjectId(Long subjectId) {
        log.debug("Request to get CourseAssignments by Subject ID : {}", subjectId);
        return courseAssignmentRepository.findBySubjectId(subjectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAssignment> findByProfessorId(Long professorId) {
        log.debug("Request to get CourseAssignments by Professor ID : {}", professorId);
        return courseAssignmentRepository.findByProfessorId(professorId);
    }
}