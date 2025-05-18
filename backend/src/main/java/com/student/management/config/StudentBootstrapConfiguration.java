package com.student.management.config;

import com.student.management.domain.Student;
import com.student.management.domain.StudentGroup;
import com.student.management.repository.StudentGroupRepository;
import com.student.management.repository.StudentRepository;
import com.student.management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

/**
 * Inserts initial Student rows (IDs 1 and 2) at application start-up.
 * Prerequisite: matching User rows already exist.
 */

@Configuration

public class StudentBootstrapConfiguration implements CommandLineRunner {


    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentGroupRepository studentGroupRepository;

    public StudentBootstrapConfiguration(UserRepository userRepository, StudentRepository studentRepository, StudentGroupRepository studentGroupRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.studentGroupRepository = studentGroupRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        createStudentIfAbsent(6L, "0601020304");
        createStudentIfAbsent(7L, "0602030405");
    }

    private void createStudentIfAbsent(Long id, String phone) {
        if (studentRepository.existsById(id)) {
            return;
        }

        // create s StudentGroup
        StudentGroup studentGroup = new StudentGroup();
        studentGroup.setName("Group 1");
        StudentGroup myStudentGroup = studentGroupRepository.save(studentGroup);

        userRepository.findById(id).ifPresentOrElse(user -> {
            System.out.println(user);
            Student student = new Student();

            /* ORDER MATTERS with @MapsId */
            student.setUser(user);          // binds the FK
            student.setStudentGroup(myStudentGroup);
            student.setPhone(phone);        // 10-digit placeholder
            studentRepository.save(student);

        }, () -> System.out.printf("User %d not found."));
    }
}