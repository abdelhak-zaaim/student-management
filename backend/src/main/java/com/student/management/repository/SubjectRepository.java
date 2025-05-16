package com.student.management.repository;

import com.student.management.domain.Subject;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Subject entity.
 *
 * When extending this class, extend SubjectRepositoryWithBagRelationships too.
 */
@Repository
public interface SubjectRepository extends SubjectRepositoryWithBagRelationships, JpaRepository<Subject, Long> {
    default Optional<Subject> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Subject> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Subject> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
