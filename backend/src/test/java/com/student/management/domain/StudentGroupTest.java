package com.student.management.domain;

import static com.student.management.domain.StudentGroupTestSamples.*;
import static com.student.management.domain.StudentTestSamples.*;
import static com.student.management.domain.SubjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.student.management.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class StudentGroupTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(StudentGroup.class);
        StudentGroup studentGroup1 = getStudentGroupSample1();
        StudentGroup studentGroup2 = new StudentGroup();
        assertThat(studentGroup1).isNotEqualTo(studentGroup2);

        studentGroup2.setId(studentGroup1.getId());
        assertThat(studentGroup1).isEqualTo(studentGroup2);

        studentGroup2 = getStudentGroupSample2();
        assertThat(studentGroup1).isNotEqualTo(studentGroup2);
    }

    @Test
    void studentsTest() {
        StudentGroup studentGroup = getStudentGroupRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        studentGroup.addStudents(studentBack);
        assertThat(studentGroup.getStudents()).containsOnly(studentBack);
        assertThat(studentBack.getStudentGroup()).isEqualTo(studentGroup);

        studentGroup.removeStudents(studentBack);
        assertThat(studentGroup.getStudents()).doesNotContain(studentBack);
        assertThat(studentBack.getStudentGroup()).isNull();

        studentGroup.students(new HashSet<>(Set.of(studentBack)));
        assertThat(studentGroup.getStudents()).containsOnly(studentBack);
        assertThat(studentBack.getStudentGroup()).isEqualTo(studentGroup);

        studentGroup.setStudents(new HashSet<>());
        assertThat(studentGroup.getStudents()).doesNotContain(studentBack);
        assertThat(studentBack.getStudentGroup()).isNull();
    }

    @Test
    void subjectsTest() {
        StudentGroup studentGroup = getStudentGroupRandomSampleGenerator();
        Subject subjectBack = getSubjectRandomSampleGenerator();

        studentGroup.addSubjects(subjectBack);
        assertThat(studentGroup.getSubjects()).containsOnly(subjectBack);

        studentGroup.removeSubjects(subjectBack);
        assertThat(studentGroup.getSubjects()).doesNotContain(subjectBack);

        studentGroup.subjects(new HashSet<>(Set.of(subjectBack)));
        assertThat(studentGroup.getSubjects()).containsOnly(subjectBack);

        studentGroup.setSubjects(new HashSet<>());
        assertThat(studentGroup.getSubjects()).doesNotContain(subjectBack);
    }
}
