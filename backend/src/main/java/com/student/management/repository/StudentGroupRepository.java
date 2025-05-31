package com.student.management.repository;

import com.student.management.domain.StudentGroup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    /**
     * Find student groups that have course assignments with a specific professor.
     *
     * @param professorId the ID of the professor
     * @param pageable the pagination information
     * @return page of student groups
     */
    @Query("SELECT DISTINCT sg FROM StudentGroup sg JOIN CourseAssignment ca ON ca.studentGroup.id = sg.id " +
           "WHERE ca.professor.id = :professorId")
    Page<StudentGroup> findByProfessorId(@Param("professorId") Long professorId, Pageable pageable);

    /**
     * Find student groups that have course assignments with a professor by user login.
     *
     * @param login the login of the user associated with the professor
     * @param pageable the pagination information
     * @return page of student groups
     */
    @Query("SELECT DISTINCT sg FROM StudentGroup sg JOIN CourseAssignment ca ON ca.studentGroup.id = sg.id " +
           "JOIN Professor p ON ca.professor.id = p.id " +
           "JOIN User u ON p.user.id = u.id " +
           "WHERE u.login = :login")
    Page<StudentGroup> findByProfessorLogin(@Param("login") String login, Pageable pageable);
}
