package com.student.management.domain;

import static com.student.management.domain.ProfessorTestSamples.*;
import static com.student.management.domain.StudentGroupTestSamples.*;
import static com.student.management.domain.SubjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.student.management.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class SubjectTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Subject.class);
        Subject subject1 = getSubjectSample1();
        Subject subject2 = new Subject();
        assertThat(subject1).isNotEqualTo(subject2);

        subject2.setId(subject1.getId());
        assertThat(subject1).isEqualTo(subject2);

        subject2 = getSubjectSample2();
        assertThat(subject1).isNotEqualTo(subject2);
    }

    @Test
    void professorsTest() {
        Subject subject = getSubjectRandomSampleGenerator();
        Professor professorBack = getProfessorRandomSampleGenerator();

        subject.addProfessors(professorBack);
        assertThat(subject.getProfessors()).containsOnly(professorBack);

        subject.removeProfessors(professorBack);
        assertThat(subject.getProfessors()).doesNotContain(professorBack);

        subject.professors(new HashSet<>(Set.of(professorBack)));
        assertThat(subject.getProfessors()).containsOnly(professorBack);

        subject.setProfessors(new HashSet<>());
        assertThat(subject.getProfessors()).doesNotContain(professorBack);
    }

    @Test
    void studentGroupTest() {
        Subject subject = getSubjectRandomSampleGenerator();
        StudentGroup studentGroupBack = getStudentGroupRandomSampleGenerator();

        subject.addStudentGroup(studentGroupBack);
        assertThat(subject.getStudentGroups()).containsOnly(studentGroupBack);
        assertThat(studentGroupBack.getSubjects()).containsOnly(subject);

        subject.removeStudentGroup(studentGroupBack);
        assertThat(subject.getStudentGroups()).doesNotContain(studentGroupBack);
        assertThat(studentGroupBack.getSubjects()).doesNotContain(subject);

        subject.studentGroups(new HashSet<>(Set.of(studentGroupBack)));
        assertThat(subject.getStudentGroups()).containsOnly(studentGroupBack);
        assertThat(studentGroupBack.getSubjects()).containsOnly(subject);

        subject.setStudentGroups(new HashSet<>());
        assertThat(subject.getStudentGroups()).doesNotContain(studentGroupBack);
        assertThat(studentGroupBack.getSubjects()).doesNotContain(subject);
    }
}
