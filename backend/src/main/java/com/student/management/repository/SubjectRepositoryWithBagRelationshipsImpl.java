package com.student.management.repository;

import com.student.management.domain.Subject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class SubjectRepositoryWithBagRelationshipsImpl implements SubjectRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String SUBJECTS_PARAMETER = "subjects";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Subject> fetchBagRelationships(Optional<Subject> subject) {
        return subject.map(this::fetchProfessors);
    }

    @Override
    public Page<Subject> fetchBagRelationships(Page<Subject> subjects) {
        return new PageImpl<>(fetchBagRelationships(subjects.getContent()), subjects.getPageable(), subjects.getTotalElements());
    }

    @Override
    public List<Subject> fetchBagRelationships(List<Subject> subjects) {
        return Optional.of(subjects).map(this::fetchProfessors).orElse(Collections.emptyList());
    }

    Subject fetchProfessors(Subject result) {
        return entityManager
            .createQuery("select subject from Subject subject left join fetch subject.professors where subject.id = :id", Subject.class)
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<Subject> fetchProfessors(List<Subject> subjects) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, subjects.size()).forEach(index -> order.put(subjects.get(index).getId(), index));
        List<Subject> result = entityManager
            .createQuery("select subject from Subject subject left join fetch subject.professors where subject in :subjects", Subject.class)
            .setParameter(SUBJECTS_PARAMETER, subjects)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
