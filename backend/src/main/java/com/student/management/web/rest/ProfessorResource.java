package com.student.management.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.student.management.domain.CourseAssignment;
import com.student.management.domain.Professor;
import com.student.management.repository.ProfessorRepository;
import com.student.management.service.ProfessorService;
import com.student.management.service.dto.ProfessorDTO;
import com.student.management.service.dto.ProfessorWithCourseAssignmentsDTO;
import com.student.management.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

/**
 * REST controller for managing {@link com.student.management.domain.Professor}.
 */
@RestController
@RequestMapping("/api/professors")
public class ProfessorResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProfessorResource.class);

    private static final String ENTITY_NAME = "professor";

    @Value("${student-management.clientApp.name}")
    private String applicationName;

    private final ProfessorService professorService;

    private final ProfessorRepository professorRepository;

    private final ObjectMapper objectMapper;

    public ProfessorResource(ProfessorService professorService, ProfessorRepository professorRepository) {
        this.professorService = professorService;
        this.professorRepository = professorRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * {@code POST  /professors} : Create a new professor.
     * If the request body contains subjectGroups or courseAssignments, course assignments will be created.
     *
     * @param professorData the professor or professor with course assignments to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new professor, or with status {@code 400 (Bad Request)} if the professor has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<?> createProfessor(@RequestBody Map<String, Object> professorData) throws URISyntaxException {
        LOG.debug("REST request to save Professor : {}", professorData);

        try {
            // Check if the request contains subject groups or course assignments
            if (professorData.containsKey("subjectGroups")) {
                ProfessorWithCourseAssignmentsDTO dto = objectMapper.convertValue(professorData, ProfessorWithCourseAssignmentsDTO.class);

                if (dto.getId() != null) {
                    throw new BadRequestAlertException("A new professor cannot already have an ID", ENTITY_NAME, "idexists");
                }

                List<CourseAssignment> assignments = professorService.saveWithCourseAssignments(dto);

                return ResponseEntity.status(HttpStatus.CREATED)
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, "new"))
                        .body(assignments);
            } else if (professorData.containsKey("courseAssignments")) {
                // Handle the courseAssignments format
                // Extract user info for creating the professor
                Map<String, Object> userMap = (Map<String, Object>) professorData.get("user");

                // Create a new DTO with subject group structure
                ProfessorWithCourseAssignmentsDTO dto = new ProfessorWithCourseAssignmentsDTO();

                // Set user info
                ProfessorWithCourseAssignmentsDTO.UserDTO userDto = new ProfessorWithCourseAssignmentsDTO.UserDTO();
                userDto.setFirstName((String) userMap.get("firstName"));
                userDto.setLastName((String) userMap.get("lastName"));
                userDto.setEmail((String) userMap.get("email"));
                userDto.setPassword((String) userMap.get("password"));
                dto.setUser(userDto);

                // Convert courseAssignments to subjectGroups format
                List<Map<String, Object>> courseAssignments = (List<Map<String, Object>>) professorData.get("courseAssignments");
                Map<Long, ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO> subjectGroupMap = new HashMap<>();

                for (Map<String, Object> assignment : courseAssignments) {
                    Map<String, Object> subjectMap = (Map<String, Object>) assignment.get("subject");
                    Map<String, Object> groupMap = (Map<String, Object>) assignment.get("studentGroup");

                    Long subjectId = Long.valueOf(subjectMap.get("id").toString());

                    // Get or create subject group assignment
                    ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO subjectGroup =
                            subjectGroupMap.getOrDefault(subjectId, new ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO());

                    // Set subject info if not already set
                    if (subjectGroup.getSubject() == null) {
                        ProfessorWithCourseAssignmentsDTO.SubjectDTO subjectDto = new ProfessorWithCourseAssignmentsDTO.SubjectDTO();
                        subjectDto.setId(subjectId);
                        subjectDto.setName((String) subjectMap.get("name"));
                        subjectGroup.setSubject(subjectDto);
                        subjectGroup.setStudentGroup(new ArrayList<>());
                    }

                    // Add student group
                    ProfessorWithCourseAssignmentsDTO.StudentGroupDTO groupDto = new ProfessorWithCourseAssignmentsDTO.StudentGroupDTO();
                    groupDto.setId(Long.valueOf(groupMap.get("id").toString()));
                    groupDto.setName((String) groupMap.get("name"));
                    subjectGroup.getStudentGroup().add(groupDto);

                    // Update map
                    subjectGroupMap.put(subjectId, subjectGroup);
                }

                // Set subject groups
                dto.setSubjectGroups(new ArrayList<>(subjectGroupMap.values()));

                // Save professor with course assignments
                List<CourseAssignment> assignments = professorService.saveWithCourseAssignments(dto);

                return ResponseEntity.status(HttpStatus.CREATED)
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, "new"))
                        .body(assignments);
            } else {
                // Handle as a regular professor creation
                Professor professor = objectMapper.convertValue(professorData, Professor.class);

                if (professor.getId() != null) {
                    throw new BadRequestAlertException("A new professor cannot already have an ID", ENTITY_NAME, "idexists");
                }
                if (Objects.isNull(professor.getUser())) {
                    throw new BadRequestAlertException("Invalid association value provided", ENTITY_NAME, "null");
                }
                professor = professorService.save(professor);
                return ResponseEntity.created(new URI("/api/professors/" + professor.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, professor.getId().toString()))
                        .body(professor);
            }
        } catch (Exception e) {
            LOG.error("Exception in createProfessor() with cause = '{}' and exception = '{}'", e.getCause(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * {@code PUT  /professors/:id} : Updates an existing professor.
     * If the request body contains subjectGroups or courseAssignments, course assignments will be updated.
     *
     * @param id            the id of the professor to save.
     * @param professorData the professor or professor with course assignments to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated professor,
     * or with status {@code 400 (Bad Request)} if the professor is not valid,
     * or with status {@code 500 (Internal Server Error)} if the professor couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfessor(
            @PathVariable(value = "id", required = false) final Long id,
            @RequestBody Map<String, Object> professorData
    ) throws URISyntaxException {
        LOG.debug("REST request to update Professor : {}, {}", id, professorData);

        try {
            // Check if the request contains subject groups or course assignments
            if (professorData.containsKey("subjectGroups")) {
                ProfessorWithCourseAssignmentsDTO dto = objectMapper.convertValue(professorData, ProfessorWithCourseAssignmentsDTO.class);

                if (dto.getId() == null) {
                    dto.setId(id);
                } else if (!Objects.equals(id, dto.getId())) {
                    throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
                }

                if (!professorRepository.existsById(id)) {
                    throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
                }

                List<CourseAssignment> assignments = professorService.updateWithCourseAssignments(dto);

                return ResponseEntity.ok()
                        .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
                        .body(assignments);
            } else if (professorData.containsKey("courseAssignments")) {
                // Handle the courseAssignments format for updates
                // Extract user info for updating the professor
                Map<String, Object> userMap = (Map<String, Object>) professorData.get("user");

                // Create a new DTO with subject group structure
                ProfessorWithCourseAssignmentsDTO dto = new ProfessorWithCourseAssignmentsDTO();
                dto.setId(id); // Set ID for update

                // Set user info
                ProfessorWithCourseAssignmentsDTO.UserDTO userDto = new ProfessorWithCourseAssignmentsDTO.UserDTO();
                userDto.setFirstName((String) userMap.get("firstName"));
                userDto.setLastName((String) userMap.get("lastName"));
                userDto.setEmail((String) userMap.get("email"));
                userDto.setPassword((String) userMap.get("password"));
                dto.setUser(userDto);

                // Convert courseAssignments to subjectGroups format
                List<Map<String, Object>> courseAssignments = (List<Map<String, Object>>) professorData.get("courseAssignments");
                Map<Long, ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO> subjectGroupMap = new HashMap<>();


                for (Map<String, Object> assignment : courseAssignments) {
                    Map<String, Object> subjectMap = (Map<String, Object>) assignment.get("subject");
                    Map<String, Object> groupMap = (Map<String, Object>) assignment.get("studentGroup");
                    // check if subjectMap and groupMap are not null
                    if (subjectMap == null || groupMap == null) {
                        continue;
                    }

                    Long subjectId = Long.valueOf(subjectMap.get("id").toString());

                    // Get or create subject group assignment
                    ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO subjectGroup =
                            subjectGroupMap.getOrDefault(subjectId, new ProfessorWithCourseAssignmentsDTO.SubjectGroupAssignmentDTO());

                    // Set subject info if not already set
                    if (subjectGroup.getSubject() == null) {
                        ProfessorWithCourseAssignmentsDTO.SubjectDTO subjectDto = new ProfessorWithCourseAssignmentsDTO.SubjectDTO();
                        subjectDto.setId(subjectId);
                        subjectDto.setName((String) subjectMap.get("name"));
                        subjectGroup.setSubject(subjectDto);
                        subjectGroup.setStudentGroup(new ArrayList<>());
                    }

                    // Add student group
                    ProfessorWithCourseAssignmentsDTO.StudentGroupDTO groupDto = new ProfessorWithCourseAssignmentsDTO.StudentGroupDTO();
                    groupDto.setId(Long.valueOf(groupMap.get("id").toString()));
                    groupDto.setName((String) groupMap.get("name"));
                    subjectGroup.getStudentGroup().add(groupDto);

                    // Update map
                    subjectGroupMap.put(subjectId, subjectGroup);
                }

                // Set subject groups
                dto.setSubjectGroups(new ArrayList<>(subjectGroupMap.values()));

                if (!professorRepository.existsById(id)) {
                    throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
                }

                // Update professor with course assignments
                List<CourseAssignment> assignments = professorService.updateWithCourseAssignments(dto);

                return ResponseEntity.ok()
                        .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
                        .body(assignments);
            } else {
                // Handle as a regular professor update
                Professor professor = objectMapper.convertValue(professorData, Professor.class);

                if (professor.getId() == null) {
                    throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
                }
                if (!Objects.equals(id, professor.getId())) {
                    throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
                }

                if (!professorRepository.existsById(id)) {
                    throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
                }

                professor = professorService.update(professor);
                return ResponseEntity.ok()
                        .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, professor.getId().toString()))
                        .body(professor);
            }
        } catch (Exception e) {
            LOG.error("Exception in updateProfessor() with cause = '{}' and exception = '{}'", e.getCause(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * {@code PATCH  /professors/:id} : Partial updates given fields of an existing professor, field will ignore if it is null
     *
     * @param id        the id of the professor to save.
     * @param professor the professor to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated professor,
     * or with status {@code 400 (Bad Request)} if the professor is not valid,
     * or with status {@code 404 (Not Found)} if the professor is not found,
     * or with status {@code 500 (Internal Server Error)} if the professor couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = {"application/json", "application/merge-patch+json"})
    public ResponseEntity<Professor> partialUpdateProfessor(
            @PathVariable(value = "id", required = false) final Long id,
            @RequestBody Professor professor
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Professor partially : {}, {}", id, professor);
        if (professor.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, professor.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!professorRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Professor> result = professorService.partialUpdate(professor);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, professor.getId().toString())
        );
    }

    /**
     * {@code GET  /professors} : get all the professors with their course assignments.
     *
     * @param pageable  the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of professors with their course assignments in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProfessorDTO>> getAllProfessors(
            @org.springdoc.core.annotations.ParameterObject Pageable pageable,
            @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Professors with course assignments");
        Page<ProfessorDTO> page = professorService.findAllWithCourseAssignments(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /professors/:id} : get the "id" professor with course assignments.
     *
     * @param id the id of the professor to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the professor with course assignments, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProfessorDTO> getProfessor(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Professor with course assignments : {}", id);
        Optional<ProfessorDTO> professor = professorService.findOneWithCourseAssignments(id);
        return ResponseUtil.wrapOrNotFound(professor);
    }

    /**
     * {@code DELETE  /professors/:id} : delete the "id" professor.
     *
     * @param id the id of the professor to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)} or status {@code 400 (Bad Request)} if the professor has associated course assignments.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfessor(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Professor : {}", id);
        try {
            professorService.delete(id);
            return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                .build();
        } catch (IllegalStateException e) {
            // Return a 400 Bad Request with the error message if professor has assignments
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
        }
    }
}
