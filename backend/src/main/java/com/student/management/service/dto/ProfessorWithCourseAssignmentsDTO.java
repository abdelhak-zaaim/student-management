package com.student.management.service.dto;

import java.util.List;

public class ProfessorWithCourseAssignmentsDTO {
    private UserDTO user;
    private List<SubjectGroupAssignmentDTO> subjectGroups;

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public List<SubjectGroupAssignmentDTO> getSubjectGroups() {
        return subjectGroups;
    }

    public void setSubjectGroups(List<SubjectGroupAssignmentDTO> subjectGroups) {
        this.subjectGroups = subjectGroups;
    }

    public static class UserDTO {
        private String firstName;
        private String lastName;
        private String email;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class SubjectGroupAssignmentDTO {
        private SubjectDTO subject;
        private List<StudentGroupDTO> studentGroup;

        public SubjectDTO getSubject() {
            return subject;
        }

        public void setSubject(SubjectDTO subject) {
            this.subject = subject;
        }

        public List<StudentGroupDTO> getStudentGroup() {
            return studentGroup;
        }

        public void setStudentGroup(List<StudentGroupDTO> studentGroup) {
            this.studentGroup = studentGroup;
        }
    }

    public static class SubjectDTO {
        private Long id;
        private String name;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class StudentGroupDTO {
        private Long id;
        private String name;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
