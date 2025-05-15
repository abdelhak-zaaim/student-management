package com.student.management.web.rest;

import static com.student.management.domain.ProfessorAsserts.*;
import static com.student.management.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.student.management.IntegrationTest;
import com.student.management.domain.Professor;
import com.student.management.domain.User;
import com.student.management.repository.ProfessorRepository;
import com.student.management.repository.UserRepository;
import com.student.management.service.ProfessorService;
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
 * Integration tests for the {@link ProfessorResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ProfessorResourceIT {

    private static final String ENTITY_API_URL = "/api/professors";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private ProfessorRepository professorRepositoryMock;

    @Mock
    private ProfessorService professorServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProfessorMockMvc;

    private Professor professor;

    private Professor insertedProfessor;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Professor createEntity(EntityManager em) {
        Professor professor = new Professor();
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        professor.setUser(user);
        return professor;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Professor createUpdatedEntity(EntityManager em) {
        Professor updatedProfessor = new Professor();
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        updatedProfessor.setUser(user);
        return updatedProfessor;
    }

    @BeforeEach
    public void initTest() {
        professor = createEntity(em);
    }

    @AfterEach
    public void cleanup() {
        if (insertedProfessor != null) {
            professorRepository.delete(insertedProfessor);
            insertedProfessor = null;
        }
    }

    @Test
    @Transactional
    void createProfessor() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Professor
        var returnedProfessor = om.readValue(
            restProfessorMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(professor)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Professor.class
        );

        // Validate the Professor in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertProfessorUpdatableFieldsEquals(returnedProfessor, getPersistedProfessor(returnedProfessor));

        assertProfessorMapsIdRelationshipPersistedValue(professor, returnedProfessor);

        insertedProfessor = returnedProfessor;
    }

    @Test
    @Transactional
    void createProfessorWithExistingId() throws Exception {
        // Create the Professor with an existing ID
        professor.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProfessorMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(professor)))
            .andExpect(status().isBadRequest());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void updateProfessorMapsIdAssociationWithNewId() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Add a new parent entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();

        // Load the professor
        Professor updatedProfessor = professorRepository.findById(professor.getId()).orElseThrow();
        assertThat(updatedProfessor).isNotNull();
        // Disconnect from session so that the updates on updatedProfessor are not directly saved in db
        em.detach(updatedProfessor);

        // Update the User with new association value
        updatedProfessor.setUser(user);

        // Update the entity
        restProfessorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedProfessor.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedProfessor))
            )
            .andExpect(status().isOk());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        /**
         * Validate the id for MapsId, the ids must be same
         * Uncomment the following line for assertion. However, please note that there is a known issue and uncommenting will fail the test.
         * Please look at https://github.com/jhipster/generator-jhipster/issues/9100. You can modify this test as necessary.
         * assertThat(testProfessor.getId()).isEqualTo(testProfessor.getUser().getId());
         */
    }

    @Test
    @Transactional
    void getAllProfessors() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        // Get all the professorList
        restProfessorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(professor.getId().intValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProfessorsWithEagerRelationshipsIsEnabled() throws Exception {
        when(professorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProfessorMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(professorServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProfessorsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(professorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProfessorMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(professorRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getProfessor() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        // Get the professor
        restProfessorMockMvc
            .perform(get(ENTITY_API_URL_ID, professor.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(professor.getId().intValue()));
    }

    @Test
    @Transactional
    void getNonExistingProfessor() throws Exception {
        // Get the professor
        restProfessorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProfessor() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the professor
        Professor updatedProfessor = professorRepository.findById(professor.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProfessor are not directly saved in db
        em.detach(updatedProfessor);

        restProfessorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedProfessor.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedProfessor))
            )
            .andExpect(status().isOk());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProfessorToMatchAllProperties(updatedProfessor);
    }

    @Test
    @Transactional
    void putNonExistingProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, professor.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(professor))
            )
            .andExpect(status().isBadRequest());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(professor))
            )
            .andExpect(status().isBadRequest());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(professor)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProfessorWithPatch() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the professor using partial update
        Professor partialUpdatedProfessor = new Professor();
        partialUpdatedProfessor.setId(professor.getId());

        restProfessorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProfessor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProfessor))
            )
            .andExpect(status().isOk());

        // Validate the Professor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProfessorUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedProfessor, professor),
            getPersistedProfessor(professor)
        );
    }

    @Test
    @Transactional
    void fullUpdateProfessorWithPatch() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the professor using partial update
        Professor partialUpdatedProfessor = new Professor();
        partialUpdatedProfessor.setId(professor.getId());

        restProfessorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProfessor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProfessor))
            )
            .andExpect(status().isOk());

        // Validate the Professor in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProfessorUpdatableFieldsEquals(partialUpdatedProfessor, getPersistedProfessor(partialUpdatedProfessor));
    }

    @Test
    @Transactional
    void patchNonExistingProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, professor.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(professor))
            )
            .andExpect(status().isBadRequest());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(professor))
            )
            .andExpect(status().isBadRequest());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProfessor() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        professor.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProfessorMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(professor)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Professor in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProfessor() throws Exception {
        // Initialize the database
        insertedProfessor = professorRepository.saveAndFlush(professor);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the professor
        restProfessorMockMvc
            .perform(delete(ENTITY_API_URL_ID, professor.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return professorRepository.count();
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

    protected Professor getPersistedProfessor(Professor professor) {
        return professorRepository.findById(professor.getId()).orElseThrow();
    }

    protected void assertPersistedProfessorToMatchAllProperties(Professor expectedProfessor) {
        assertProfessorAllPropertiesEquals(expectedProfessor, getPersistedProfessor(expectedProfessor));
    }

    protected void assertPersistedProfessorToMatchUpdatableProperties(Professor expectedProfessor) {
        assertProfessorAllUpdatablePropertiesEquals(expectedProfessor, getPersistedProfessor(expectedProfessor));
    }
}
