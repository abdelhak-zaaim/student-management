package com.student.management.web.rest;

import com.student.management.domain.Student;
import com.student.management.domain.StudentGroup;
import com.student.management.repository.StudentGroupRepository;
import com.student.management.service.StudentGroupService;
import com.student.management.service.StudentService;
import com.student.management.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.student.management.domain.StudentGroup}.
 */
@RestController
@RequestMapping("/api/student-groups")
public class StudentGroupResource {

    private static final Logger LOG = LoggerFactory.getLogger(StudentGroupResource.class);

    private static final String ENTITY_NAME = "studentGroup";

    @Value("${student-management.clientApp.name}")
    private String applicationName;

    private final StudentGroupService studentGroupService;

    private final StudentGroupRepository studentGroupRepository;

    private final StudentService studentService;
    
    public StudentGroupResource(
        StudentGroupService studentGroupService, 
        StudentGroupRepository studentGroupRepository,
        StudentService studentService
    ) {
        this.studentGroupService = studentGroupService;
        this.studentGroupRepository = studentGroupRepository;
        this.studentService = studentService;
    }

    /**
     * {@code POST  /student-groups} : Create a new studentGroup.
     *
     * @param studentGroup the studentGroup to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new studentGroup, or with status {@code 400 (Bad Request)} if the studentGroup has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<StudentGroup> createStudentGroup(@RequestBody StudentGroup studentGroup) throws URISyntaxException {
        LOG.debug("REST request to save StudentGroup : {}", studentGroup);
        if (studentGroup.getId() != null) {
            throw new BadRequestAlertException("A new studentGroup cannot already have an ID", ENTITY_NAME, "idexists");
        }
        studentGroup = studentGroupService.save(studentGroup);
        return ResponseEntity.created(new URI("/api/student-groups/" + studentGroup.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, studentGroup.getId().toString()))
            .body(studentGroup);
    }

    /**
     * {@code PUT  /student-groups/:id} : Updates an existing studentGroup.
     *
     * @param id the id of the studentGroup to save.
     * @param studentGroup the studentGroup to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated studentGroup,
     * or with status {@code 400 (Bad Request)} if the studentGroup is not valid,
     * or with status {@code 500 (Internal Server Error)} if the studentGroup couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudentGroup> updateStudentGroup(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody StudentGroup studentGroup
    ) throws URISyntaxException {
        LOG.debug("REST request to update StudentGroup : {}, {}", id, studentGroup);
        if (studentGroup.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, studentGroup.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!studentGroupRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        studentGroup = studentGroupService.update(studentGroup);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, studentGroup.getId().toString()))
            .body(studentGroup);
    }

    /**
     * {@code PATCH  /student-groups/:id} : Partial updates given fields of an existing studentGroup, field will ignore if it is null
     *
     * @param id the id of the studentGroup to save.
     * @param studentGroup the studentGroup to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated studentGroup,
     * or with status {@code 400 (Bad Request)} if the studentGroup is not valid,
     * or with status {@code 404 (Not Found)} if the studentGroup is not found,
     * or with status {@code 500 (Internal Server Error)} if the studentGroup couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<StudentGroup> partialUpdateStudentGroup(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody StudentGroup studentGroup
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update StudentGroup partially : {}, {}", id, studentGroup);
        if (studentGroup.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, studentGroup.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!studentGroupRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<StudentGroup> result = studentGroupService.partialUpdate(studentGroup);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, studentGroup.getId().toString())
        );
    }

    /**
     * {@code GET  /student-groups} : get all the studentGroups.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of studentGroups in body.
     */
    @GetMapping("")
    public ResponseEntity<List<StudentGroup>> getAllStudentGroups(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of StudentGroups");
        Page<StudentGroup> page;
        if (eagerload) {
            page = studentGroupService.findAllWithEagerRelationships(pageable);
        } else {
            page = studentGroupService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /student-groups/:id} : get the "id" studentGroup.
     *
     * @param id the id of the studentGroup to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the studentGroup, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudentGroup> getStudentGroup(@PathVariable("id") Long id) {
        LOG.debug("REST request to get StudentGroup : {}", id);
        Optional<StudentGroup> studentGroup = studentGroupService.findOne(id);
        return ResponseUtil.wrapOrNotFound(studentGroup);
    }

    /**
     * {@code GET  /student-groups/:id/students} : get the students for the "id" studentGroup.
     *
     * @param id the id of the studentGroup to retrieve students for.
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the list of students.
     */
    @GetMapping("/{id}/students")
    public ResponseEntity<List<Student>> getStudentGroupStudents(
        @PathVariable("id") Long id,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get students for StudentGroup : {}", id);
        
        if (!studentGroupRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        Page<Student> page = studentService.findByStudentGroupId(id, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(), 
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
    
    /**
     * {@code GET  /student-groups/professor-groups} : get all student groups that have course assignments
     * with the current logged-in professor.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of studentGroups in body.
     */
    @GetMapping("/professor-groups")
    public ResponseEntity<List<StudentGroup>> getProfessorGroups(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get student groups for the current logged-in professor");
        Page<StudentGroup> page = studentGroupService.findByCurrentProfessor(pageable);

        // Apply eager loading if requested
        if (eagerload) {
            page = new PageImpl<>(
                page.getContent().stream()
                    .map(group -> studentGroupRepository.findOneWithEagerRelationships(group.getId()).orElse(group))
                    .collect(java.util.stream.Collectors.toList()),
                pageable,
                page.getTotalElements()
            );
        }

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(),
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code DELETE  /student-groups/:id} : delete the "id" studentGroup.
     *
     * @param id the id of the studentGroup to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentGroup(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete StudentGroup : {}", id);
        studentGroupService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
