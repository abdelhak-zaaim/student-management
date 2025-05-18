package com.student.management.repository;

import com.student.management.domain.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Student entity.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    default Optional<Student> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Student> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Student> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select student from Student student left join fetch student.user",
        countQuery = "select count(student) from Student student"
    )
    Page<Student> findAllWithToOneRelationships(Pageable pageable);

    @Query("select student from Student student left join fetch student.user")
    List<Student> findAllWithToOneRelationships();

    @Query("select student from Student student left join fetch student.user where student.id =:id")
    Optional<Student> findOneWithToOneRelationships(@Param("id") Long id);
    
    /**
     * Find all students by student group ID.
     * 
     * @param studentGroupId the ID of the student group
     * @return list of students in the group
     */
    @Query("select student from Student student left join fetch student.user where student.studentGroup.id = :studentGroupId")
    List<Student> findByStudentGroupId(@Param("studentGroupId") Long studentGroupId);
    
    /**
     * Find all students by student group ID with pagination.
     *
     * @param studentGroupId the ID of the student group
     * @param pageable pagination information
     * @return page of students in the group
     */
    @Query(
        value = "select student from Student student left join fetch student.user where student.studentGroup.id = :studentGroupId",
        countQuery = "select count(student) from Student student where student.studentGroup.id = :studentGroupId"
    )
    Page<Student> findByStudentGroupId(@Param("studentGroupId") Long studentGroupId, Pageable pageable);
    
    /**
     * Check if any students are associated with a student group.
     *
     * @param studentGroupId the ID of the student group
     * @return true if students exist for the group, false otherwise
     */
    @Query("select case when count(student) > 0 then true else false end from Student student where student.studentGroup.id = :studentGroupId")
    boolean existsByStudentGroupId(@Param("studentGroupId") Long studentGroupId);
    
    /**
     * Count the number of students in a student group.
     *
     * @param studentGroupId the ID of the student group
     * @return the number of students in the group
     */
    @Query("select count(student) from Student student where student.studentGroup.id = :studentGroupId")
    long countByStudentGroupId(@Param("studentGroupId") Long studentGroupId);
}
