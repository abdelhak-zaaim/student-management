package com.student.management.repository;

import com.student.management.domain.StudentGroup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface StudentGroupRepositoryWithBagRelationships {
    Optional<StudentGroup> fetchBagRelationships(Optional<StudentGroup> studentGroup);

    List<StudentGroup> fetchBagRelationships(List<StudentGroup> studentGroups);

    Page<StudentGroup> fetchBagRelationships(Page<StudentGroup> studentGroups);
}
