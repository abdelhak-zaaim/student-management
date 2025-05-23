package com.student.management.service.dto;


import com.student.management.domain.User;

import java.util.List;

public record ProfessorRequestDto(User user, Long id, List<SubjectGroupDTO> subjectGroups) {
}
