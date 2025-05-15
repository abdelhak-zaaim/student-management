package com.student.management.web.rest;

import static com.student.management.domain.StudentGroupAsserts.*;
import static com.student.management.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.student.management.IntegrationTest;
import com.student.management.domain.StudentGroup;
import com.student.management.repository.StudentGroupRepository;
import com.student.management.service.StudentGroupService;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link StudentGroupResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class StudentGroupResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/student-groups";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private StudentGroupRepository studentGroupRepository;

    @Mock
    private StudentGroupRepository studentGroupRepositoryMock;

    @Mock
    private StudentGroupService studentGroupServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restStudentGroupMockMvc;

    private StudentGroup studentGroup;

    private StudentGroup insertedStudentGroup;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static StudentGroup createEntity() {
        return new StudentGroup().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static StudentGroup createUpdatedEntity() {
        return new StudentGroup().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
    }

    @BeforeEach
    public void initTest() {
        studentGroup = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedStudentGroup != null) {
            studentGroupRepository.delete(insertedStudentGroup);
            insertedStudentGroup = null;
        }
    }

    @Test
    @Transactional
    void createStudentGroup() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the StudentGroup
        var returnedStudentGroup = om.readValue(
            restStudentGroupMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentGroup)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            StudentGroup.class
        );

        // Validate the StudentGroup in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertStudentGroupUpdatableFieldsEquals(returnedStudentGroup, getPersistedStudentGroup(returnedStudentGroup));

        insertedStudentGroup = returnedStudentGroup;
    }

    @Test
    @Transactional
    void createStudentGroupWithExistingId() throws Exception {
        // Create the StudentGroup with an existing ID
        studentGroup.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restStudentGroupMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentGroup)))
            .andExpect(status().isBadRequest());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllStudentGroups() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        // Get all the studentGroupList
        restStudentGroupMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(studentGroup.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllStudentGroupsWithEagerRelationshipsIsEnabled() throws Exception {
        when(studentGroupServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restStudentGroupMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(studentGroupServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllStudentGroupsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(studentGroupServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restStudentGroupMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(studentGroupRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getStudentGroup() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        // Get the studentGroup
        restStudentGroupMockMvc
            .perform(get(ENTITY_API_URL_ID, studentGroup.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(studentGroup.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingStudentGroup() throws Exception {
        // Get the studentGroup
        restStudentGroupMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingStudentGroup() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the studentGroup
        StudentGroup updatedStudentGroup = studentGroupRepository.findById(studentGroup.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedStudentGroup are not directly saved in db
        em.detach(updatedStudentGroup);
        updatedStudentGroup.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restStudentGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedStudentGroup.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedStudentGroup))
            )
            .andExpect(status().isOk());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedStudentGroupToMatchAllProperties(updatedStudentGroup);
    }

    @Test
    @Transactional
    void putNonExistingStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, studentGroup.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(studentGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(studentGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(studentGroup)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateStudentGroupWithPatch() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the studentGroup using partial update
        StudentGroup partialUpdatedStudentGroup = new StudentGroup();
        partialUpdatedStudentGroup.setId(studentGroup.getId());

        partialUpdatedStudentGroup.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restStudentGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudentGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStudentGroup))
            )
            .andExpect(status().isOk());

        // Validate the StudentGroup in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStudentGroupUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedStudentGroup, studentGroup),
            getPersistedStudentGroup(studentGroup)
        );
    }

    @Test
    @Transactional
    void fullUpdateStudentGroupWithPatch() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the studentGroup using partial update
        StudentGroup partialUpdatedStudentGroup = new StudentGroup();
        partialUpdatedStudentGroup.setId(studentGroup.getId());

        partialUpdatedStudentGroup.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restStudentGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudentGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStudentGroup))
            )
            .andExpect(status().isOk());

        // Validate the StudentGroup in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStudentGroupUpdatableFieldsEquals(partialUpdatedStudentGroup, getPersistedStudentGroup(partialUpdatedStudentGroup));
    }

    @Test
    @Transactional
    void patchNonExistingStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, studentGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(studentGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(studentGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamStudentGroup() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        studentGroup.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentGroupMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(studentGroup)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the StudentGroup in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteStudentGroup() throws Exception {
        // Initialize the database
        insertedStudentGroup = studentGroupRepository.saveAndFlush(studentGroup);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the studentGroup
        restStudentGroupMockMvc
            .perform(delete(ENTITY_API_URL_ID, studentGroup.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return studentGroupRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected StudentGroup getPersistedStudentGroup(StudentGroup studentGroup) {
        return studentGroupRepository.findById(studentGroup.getId()).orElseThrow();
    }

    protected void assertPersistedStudentGroupToMatchAllProperties(StudentGroup expectedStudentGroup) {
        assertStudentGroupAllPropertiesEquals(expectedStudentGroup, getPersistedStudentGroup(expectedStudentGroup));
    }

    protected void assertPersistedStudentGroupToMatchUpdatableProperties(StudentGroup expectedStudentGroup) {
        assertStudentGroupAllUpdatablePropertiesEquals(expectedStudentGroup, getPersistedStudentGroup(expectedStudentGroup));
    }
}
