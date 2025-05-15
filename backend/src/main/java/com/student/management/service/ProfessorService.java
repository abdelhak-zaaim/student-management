package com.student.management.service;

import com.student.management.domain.Professor;
import com.student.management.repository.ProfessorRepository;
import com.student.management.repository.UserRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public ProfessorService(ProfessorRepository professorRepository, UserRepository userRepository) {
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
    }

    /**
     * Save a professor.
     *
     * @param professor the entity to save.
     * @return the persisted entity.
     */
    public Professor save(Professor professor) {
        LOG.debug("Request to save Professor : {}", professor);
        Long userId = professor.getUser().getId();
        userRepository.findById(userId).ifPresent(professor::user);
        return professorRepository.save(professor);
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
