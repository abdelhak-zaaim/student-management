package com.student.management.web.rest;

import com.student.management.domain.CourseAssignment;
import com.student.management.service.CourseAssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * REST controller for managing {@link com.student.management.domain.CourseAssignment}.
 */
@RestController
@RequestMapping("/api")
public class CourseAssignmentResource {

    private final Logger log = LoggerFactory.getLogger(CourseAssignmentResource.class);

    private final CourseAssignmentService courseAssignmentService;

    public CourseAssignmentResource(CourseAssignmentService courseAssignmentService) {
        this.courseAssignmentService = courseAssignmentService;
    }

    /**
     * {@code POST  /course-assignments} : Create a new courseAssignment.
     *
     * @param courseAssignment the courseAssignment to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new courseAssignment, or with status {@code 400 (Bad Request)} if the courseAssignment has already an ID.
     */
    @PostMapping("/course-assignments")
    public ResponseEntity<CourseAssignment> createCourseAssignment(@Valid @RequestBody CourseAssignment courseAssignment) {
        log.debug("REST request to save CourseAssignment : {}", courseAssignment);
        if (courseAssignment.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        CourseAssignment result = courseAssignmentService.save(courseAssignment);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(result.getId())
            .toUri();
        return ResponseEntity.created(location).body(result);
    }

    /**
     * {@code PUT  /course-assignments/:id} : Updates an existing courseAssignment.
     *
     * @param id the id of the courseAssignment to save.
     * @param courseAssignment the courseAssignment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated courseAssignment,
     * or with status {@code 400 (Bad Request)} if the courseAssignment is not valid,
     * or with status {@code 500 (Internal Server Error)} if the courseAssignment couldn't be updated.
     */
    @PutMapping("/course-assignments/{id}")
    public ResponseEntity<CourseAssignment> updateCourseAssignment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CourseAssignment courseAssignment
    ) {
        log.debug("REST request to update CourseAssignment : {}, {}", id, courseAssignment);
        if (courseAssignment.getId() == null || !Objects.equals(id, courseAssignment.getId())) {
            return ResponseEntity.badRequest().build();
        }
        CourseAssignment result = courseAssignmentService.save(courseAssignment);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code PATCH  /course-assignments/:id} : Partial updates given fields of an existing courseAssignment, field will ignore if it is null
     *
     * @param id the id of the courseAssignment to save.
     * @param courseAssignment the courseAssignment to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated courseAssignment,
     * or with status {@code 400 (Bad Request)} if the courseAssignment is not valid,
     * or with status {@code 404 (Not Found)} if the courseAssignment is not found,
     * or with status {@code 500 (Internal Server Error)} if the courseAssignment couldn't be updated.
     */
    @PatchMapping("/course-assignments/{id}")
    public ResponseEntity<CourseAssignment> partialUpdateCourseAssignment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CourseAssignment courseAssignment
    ) {
        log.debug("REST request to partially update CourseAssignment : {}, {}", id, courseAssignment);
        if (courseAssignment.getId() == null || !Objects.equals(id, courseAssignment.getId())) {
            return ResponseEntity.badRequest().build();
        }

        Optional<CourseAssignment> result = courseAssignmentService.partialUpdate(courseAssignment);

        return result
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * {@code GET  /course-assignments} : get all the courseAssignments.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of courseAssignments in body.
     */
    @GetMapping("/course-assignments")
    public ResponseEntity<List<CourseAssignment>> getAllCourseAssignments(Pageable pageable) {
        log.debug("REST request to get a page of CourseAssignments");
        Page<CourseAssignment> page = courseAssignmentService.findAll(pageable);
        return ResponseEntity.ok().body(page.getContent());
    }

    /**
     * {@code GET  /course-assignments/:id} : get the "id" courseAssignment.
     *
     * @param id the id of the courseAssignment to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the courseAssignment, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/course-assignments/{id}")
    public ResponseEntity<CourseAssignment> getCourseAssignment(@PathVariable Long id) {
        log.debug("REST request to get CourseAssignment : {}", id);
        Optional<CourseAssignment> courseAssignment = courseAssignmentService.findOne(id);
        return courseAssignment
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * {@code GET  /course-assignments/student-group/:id} : get courseAssignments by student group id.
     *
     * @param id the id of the student group.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the courseAssignments.
     */
    @GetMapping("/course-assignments/student-group/{id}")
    public ResponseEntity<List<CourseAssignment>> getCourseAssignmentsByStudentGroup(@PathVariable Long id) {
        log.debug("REST request to get CourseAssignments by StudentGroup : {}", id);
        List<CourseAssignment> courseAssignments = courseAssignmentService.findByStudentGroupId(id);
        return ResponseEntity.ok().body(courseAssignments);
    }

    /**
     * {@code GET  /course-assignments/subject/:id} : get courseAssignments by subject id.
     *
     * @param id the id of the subject.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the courseAssignments.
     */
    @GetMapping("/course-assignments/subject/{id}")
    public ResponseEntity<List<CourseAssignment>> getCourseAssignmentsBySubject(@PathVariable Long id) {
        log.debug("REST request to get CourseAssignments by Subject : {}", id);
        List<CourseAssignment> courseAssignments = courseAssignmentService.findBySubjectId(id);
        return ResponseEntity.ok().body(courseAssignments);
    }

    /**
     * {@code GET  /course-assignments/professor/:id} : get courseAssignments by professor id.
     *
     * @param id the id of the professor.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the courseAssignments.
     */
    @GetMapping("/course-assignments/professor/{id}")
    public ResponseEntity<List<CourseAssignment>> getCourseAssignmentsByProfessor(@PathVariable Long id) {
        log.debug("REST request to get CourseAssignments by Professor : {}", id);
        List<CourseAssignment> courseAssignments = courseAssignmentService.findByProfessorId(id);
        return ResponseEntity.ok().body(courseAssignments);
    }

    /**
     * {@code DELETE  /course-assignments/:id} : delete the "id" courseAssignment.
     *
     * @param id the id of the courseAssignment to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/course-assignments/{id}")
    public ResponseEntity<Void> deleteCourseAssignment(@PathVariable Long id) {
        log.debug("REST request to delete CourseAssignment : {}", id);
        courseAssignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}