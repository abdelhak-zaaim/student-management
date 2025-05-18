package com.student.management.service;

import com.student.management.domain.Student;
import com.student.management.domain.User;
import com.student.management.repository.StudentRepository;
import com.student.management.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.student.management.domain.Student}.
 */
@Service
@Transactional
public class StudentService {

    private static final Logger LOG = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;

    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Save a student.
     *
     * @param student the entity to save.
     * @return the persisted entity.
     */
    public Student save(Student student) {
        LOG.debug("Request to save Student : {}", student);
        
        // Validate phone number
        validatePhoneNumber(student);
        
        if (student.getUser() != null) {
            if (student.getUser().getId() != null) {
                // If user has ID, try to find existing user
                userRepository.findById(student.getUser().getId()).ifPresent(student::user);
            } else {
                // If no user ID, prepare the new user
                User user = student.getUser();
                
                // Set required fields for User entity
                if (user.getLogin() == null) {
                    // Generate a temporary unique login based on timestamp
                    String tempLogin = "student" + System.currentTimeMillis();
                    user.setLogin(tempLogin);
                }

                if (user.getLangKey() == null) {
                    user.setLangKey("en");
                }
                if (user.getCreatedBy() == null) {
                    user.setCreatedBy("system");
                }
                if (user.getLastModifiedBy() == null) {
                    user.setLastModifiedBy("system");
                }
                
                // Email is optional for students
                if (user.getEmail() == null || user.getEmail().isEmpty()) {
                    // Set a placeholder email or leave it null as the database allows
                    // The schema shows email is nullable in the database
                    user.setEmail(null);
                }
                
                // Save the user first
                user = userRepository.save(user);
                
                // Now update the login to use the actual ID if it's a temporary login
                if (user.getLogin().startsWith("student") && user.getLogin().substring(7).matches("\\d+")) {
                    user.setLogin("student" + user.getId());
                    user = userRepository.save(user);
                }
                
                student.setUser(user);
            }
        }
        return studentRepository.save(student);
    }
    
    /**
     * Validate that the phone number is exactly 10 digits
     */
    private void validatePhoneNumber(Student student) {
        if (student.getPhone() != null) {
            String phone = student.getPhone();
            if (phone.length() != 10 || !phone.matches("\\d{10}")) {
                throw new IllegalArgumentException("Phone number must be exactly 10 digits");
            }
        }
    }

    /**
     * Update a student.
     *
     * @param student the entity to save.
     * @return the persisted entity.
     */
    public Student update(Student student) {
        LOG.debug("Request to update Student : {}", student);
        
        // Validate phone number
        validatePhoneNumber(student);
        
        if (student.getUser() != null && student.getUser().getId() != null) {
            // Get the existing user from the database
            userRepository.findById(student.getUser().getId()).ifPresent(existingUser -> {
                // Update user properties that are not null in the incoming request
                if (student.getUser().getFirstName() != null) {
                    existingUser.setFirstName(student.getUser().getFirstName());
                }
                if (student.getUser().getLastName() != null) {
                    existingUser.setLastName(student.getUser().getLastName());
                }
                
                // Handle email - it can be set to null explicitly for students
                // If the incoming email is empty string, set it to null
                if (student.getUser().getEmail() != null) {
                    if (student.getUser().getEmail().isEmpty()) {
                        existingUser.setEmail(null);
                    } else {
                        existingUser.setEmail(student.getUser().getEmail());
                    }
                }
                
                if (student.getUser().getLogin() != null) {
                    existingUser.setLogin(student.getUser().getLogin());
                }
                if (student.getUser().getImageUrl() != null) {
                    existingUser.setImageUrl(student.getUser().getImageUrl());
                }
                if (student.getUser().getLangKey() != null) {
                    existingUser.setLangKey(student.getUser().getLangKey());
                }
                
                // Save updated user
                userRepository.save(existingUser);
                
                // Set the updated user to the student
                student.setUser(existingUser);
            });
        }
        
        return studentRepository.save(student);
    }

    /**
     * Partially update a student.
     *
     * @param student the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Student> partialUpdate(Student student) {
        LOG.debug("Request to partially update Student : {}", student);

        // Validate phone number if it's being updated
        if (student.getPhone() != null) {
            validatePhoneNumber(student);
        }
        
        // Update user data if provided
        if (student.getUser() != null && student.getUser().getId() != null) {
            userRepository.findById(student.getUser().getId()).ifPresent(existingUser -> {
                // Update only the fields that are provided
                if (student.getUser().getFirstName() != null) {
                    existingUser.setFirstName(student.getUser().getFirstName());
                }
                if (student.getUser().getLastName() != null) {
                    existingUser.setLastName(student.getUser().getLastName());
                }
                // Email is optional
                if (student.getUser().getEmail() != null) {
                    existingUser.setEmail(student.getUser().getEmail());
                }
                
                // Save user updates
                userRepository.save(existingUser);
                student.setUser(existingUser);
            });
        }
    
        return studentRepository.findById(student.getId())
            .map(existingStudent -> {
                if (student.getPhone() != null) {
                    existingStudent.setPhone(student.getPhone());
                }
                if (student.getStudentGroup() != null) {
                    existingStudent.setStudentGroup(student.getStudentGroup());
                }
                return studentRepository.save(existingStudent);
            });
    }

    /**
     * Get all the students.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Student> findAll(Pageable pageable) {
        LOG.debug("Request to get all Students");
        return studentRepository.findAll(pageable);
    }

    /**
     * Get all the students with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Student> findAllWithEagerRelationships(Pageable pageable) {
        return studentRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one student by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Student> findOne(Long id) {
        LOG.debug("Request to get Student : {}", id);
        return studentRepository.findOneWithEagerRelationships(id);
    }
    
    /**
     * Get all students by student group ID.
     *
     * @param studentGroupId the ID of the student group
     * @return the list of students in the group
     */
    @Transactional(readOnly = true)
    public List<Student> findByStudentGroupId(Long studentGroupId) {
        LOG.debug("Request to get Students by student group ID : {}", studentGroupId);
        return studentRepository.findByStudentGroupId(studentGroupId);
    }
    
    /**
     * Get all students by student group ID with pagination.
     *
     * @param studentGroupId the ID of the student group
     * @param pageable pagination information
     * @return page of students in the group
     */
    @Transactional(readOnly = true)
    public Page<Student> findByStudentGroupId(Long studentGroupId, Pageable pageable) {
        LOG.debug("Request to get Students by student group ID with pagination : {}", studentGroupId);
        return studentRepository.findByStudentGroupId(studentGroupId, pageable);
    }

    /**
     * Delete the student by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Student : {}", id);
        studentRepository.deleteById(id);
    }
}
