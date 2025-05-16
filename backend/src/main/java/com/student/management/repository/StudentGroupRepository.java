package com.student.management.repository;

import com.student.management.domain.StudentGroup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the StudentGroup entity.
 *
 * When extending this class, extend StudentGroupRepositoryWithBagRelationships too.
 */
@Repository
public interface StudentGroupRepository extends StudentGroupRepositoryWithBagRelationships, JpaRepository<StudentGroup, Long> {
    default Optional<StudentGroup> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<StudentGroup> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<StudentGroup> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
