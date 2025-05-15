package com.student.management.repository;

import com.student.management.domain.StudentGroup;
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
public class StudentGroupRepositoryWithBagRelationshipsImpl implements StudentGroupRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String STUDENTGROUPS_PARAMETER = "studentGroups";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<StudentGroup> fetchBagRelationships(Optional<StudentGroup> studentGroup) {
        return studentGroup.map(this::fetchSubjects);
    }

    @Override
    public Page<StudentGroup> fetchBagRelationships(Page<StudentGroup> studentGroups) {
        return new PageImpl<>(
            fetchBagRelationships(studentGroups.getContent()),
            studentGroups.getPageable(),
            studentGroups.getTotalElements()
        );
    }

    @Override
    public List<StudentGroup> fetchBagRelationships(List<StudentGroup> studentGroups) {
        return Optional.of(studentGroups).map(this::fetchSubjects).orElse(Collections.emptyList());
    }

    StudentGroup fetchSubjects(StudentGroup result) {
        return entityManager
            .createQuery(
                "select studentGroup from StudentGroup studentGroup left join fetch studentGroup.subjects where studentGroup.id = :id",
                StudentGroup.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<StudentGroup> fetchSubjects(List<StudentGroup> studentGroups) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, studentGroups.size()).forEach(index -> order.put(studentGroups.get(index).getId(), index));
        List<StudentGroup> result = entityManager
            .createQuery(
                "select studentGroup from StudentGroup studentGroup left join fetch studentGroup.subjects where studentGroup in :studentGroups",
                StudentGroup.class
            )
            .setParameter(STUDENTGROUPS_PARAMETER, studentGroups)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
