package com.student.management.service;

import com.student.management.domain.Subject;
import com.student.management.repository.SubjectRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.student.management.domain.Subject}.
 */
@Service
@Transactional
public class SubjectService {

    private static final Logger LOG = LoggerFactory.getLogger(SubjectService.class);

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    /**
     * Save a subject.
     *
     * @param subject the entity to save.
     * @return the persisted entity.
     */
    public Subject save(Subject subject) {
        LOG.debug("Request to save Subject : {}", subject);
        return subjectRepository.save(subject);
    }

    /**
     * Update a subject.
     *
     * @param subject the entity to save.
     * @return the persisted entity.
     */
    public Subject update(Subject subject) {
        LOG.debug("Request to update Subject : {}", subject);
        return subjectRepository.save(subject);
    }

    /**
     * Partially update a subject.
     *
     * @param subject the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Subject> partialUpdate(Subject subject) {
        LOG.debug("Request to partially update Subject : {}", subject);

        return subjectRepository
            .findById(subject.getId())
            .map(existingSubject -> {
                if (subject.getName() != null) {
                    existingSubject.setName(subject.getName());
                }
                if (subject.getDescription() != null) {
                    existingSubject.setDescription(subject.getDescription());
                }

                return existingSubject;
            })
            .map(subjectRepository::save);
    }

    /**
     * Get all the subjects.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Subject> findAll(Pageable pageable) {
        LOG.debug("Request to get all Subjects");
        return subjectRepository.findAll(pageable);
    }

    /**
     * Get all the subjects with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Subject> findAllWithEagerRelationships(Pageable pageable) {
        return subjectRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one subject by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Subject> findOne(Long id) {
        LOG.debug("Request to get Subject : {}", id);
        return subjectRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the subject by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Subject : {}", id);
        subjectRepository.deleteById(id);
    }
}
