package com.student.management.domain;

import static com.student.management.domain.ProfessorTestSamples.*;
import static com.student.management.domain.SubjectTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.student.management.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProfessorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Professor.class);
        Professor professor1 = getProfessorSample1();
        Professor professor2 = new Professor();
        assertThat(professor1).isNotEqualTo(professor2);

        professor2.setId(professor1.getId());
        assertThat(professor1).isEqualTo(professor2);

        professor2 = getProfessorSample2();
        assertThat(professor1).isNotEqualTo(professor2);
    }

    @Test
    void subjectsTest() {
        Professor professor = getProfessorRandomSampleGenerator();
        Subject subjectBack = getSubjectRandomSampleGenerator();

        professor.addSubjects(subjectBack);
        assertThat(professor.getSubjects()).containsOnly(subjectBack);
        assertThat(subjectBack.getProfessors()).containsOnly(professor);

        professor.removeSubjects(subjectBack);
        assertThat(professor.getSubjects()).doesNotContain(subjectBack);
        assertThat(subjectBack.getProfessors()).doesNotContain(professor);

        professor.subjects(new HashSet<>(Set.of(subjectBack)));
        assertThat(professor.getSubjects()).containsOnly(subjectBack);
        assertThat(subjectBack.getProfessors()).containsOnly(professor);

        professor.setSubjects(new HashSet<>());
        assertThat(professor.getSubjects()).doesNotContain(subjectBack);
        assertThat(subjectBack.getProfessors()).doesNotContain(professor);
    }
}
