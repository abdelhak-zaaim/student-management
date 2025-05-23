package com.student.management.service.dto;


import com.student.management.domain.StudentGroup;
import com.student.management.domain.Subject;

public record SubjectGroupDTO(Subject subject, StudentGroup studentGroup) {
}
