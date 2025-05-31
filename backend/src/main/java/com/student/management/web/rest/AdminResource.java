package com.student.management.web.rest;

import com.student.management.domain.Authority;
import com.student.management.domain.User;
import com.student.management.security.AuthoritiesConstants;
import com.student.management.service.UserService;
import com.student.management.service.dto.AdminUserDTO;
import com.student.management.web.rest.errors.BadRequestAlertException;
import com.student.management.web.rest.errors.EmailAlreadyUsedException;
import com.student.management.web.rest.errors.LoginAlreadyUsedException;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing administrators.
 * This resource handles CRUD operations for users with the ADMIN role.
 */
@RestController
@RequestMapping("/api/admins")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
public class AdminResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdminResource.class);

    private static final String ENTITY_NAME = "admin";

    @Value("${student-management.clientApp.name}")
    private String applicationName;

    private final UserService userService;

    public AdminResource(UserService userService) {
        this.userService = userService;
    }

    /**
     * {@code POST  /admins} : Create a new admin user.
     *
     * @param adminUserDTO the admin user to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new admin user.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     * @throws BadRequestAlertException if the login or email is already in use.
     */
    @PostMapping("")
    public ResponseEntity<AdminUserDTO> createAdmin(@Valid @RequestBody AdminUserDTO adminUserDTO) throws URISyntaxException {
        LOG.debug("REST request to create Admin User : {}", adminUserDTO);

        if (adminUserDTO.getId() != null) {
            throw new BadRequestAlertException("A new admin cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Always set ADMIN role for users created through this endpoint
        Set<String> authorities = new HashSet<>();
        authorities.add(AuthoritiesConstants.ADMIN);
        adminUserDTO.setAuthorities(authorities);

        try {
            // Create the user and convert it back to a DTO
            User newUser = userService.createUser(adminUserDTO);
            AdminUserDTO newAdmin = new AdminUserDTO(newUser);

            return ResponseEntity
                .created(new URI("/api/admins/" + newAdmin.getLogin()))
                .headers(HeaderUtil.createAlert(applicationName, "userManagement.created", newAdmin.getLogin()))
                .body(newAdmin);
        } catch (EmailAlreadyUsedException e) {
            throw new EmailAlreadyUsedException();
        } catch (LoginAlreadyUsedException e) {
            throw new LoginAlreadyUsedException();
        }
    }

    /**
     * {@code PUT  /admins} : Updates an existing admin User.
     *
     * @param adminUserDTO the user to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated user.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already in use.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already in use.
     */
    @PutMapping("")
    public ResponseEntity<AdminUserDTO> updateAdmin(@Valid @RequestBody AdminUserDTO adminUserDTO) {
        LOG.debug("REST request to update Admin User : {}", adminUserDTO);

        // Always ensure the ADMIN role is preserved
        Set<String> authorities = adminUserDTO.getAuthorities();
        if (authorities == null) {
            authorities = new HashSet<>();
        }
        authorities.add(AuthoritiesConstants.ADMIN);
        adminUserDTO.setAuthorities(authorities);

        Optional<AdminUserDTO> updatedUser = userService.updateUser(adminUserDTO);

        return ResponseUtil.wrapOrNotFound(
            updatedUser,
            HeaderUtil.createAlert(applicationName, "userManagement.updated", adminUserDTO.getLogin())
        );
    }

    /**
     * {@code PUT  /admins/:id} : Updates an existing admin user by ID.
     *
     * @param id the id of the admin user to update
     * @param adminUserDTO the user to update
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated user,
     * or with status {@code 404 (Not Found)} if the user is not found or not an admin,
     * or with status {@code 400 (Bad Request)} if the user ID in the URL doesn't match the ID in the body
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already in use
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already in use
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminUserDTO> updateAdminById(
        @PathVariable Long id,
        @Valid @RequestBody AdminUserDTO adminUserDTO
    ) {
        LOG.debug("REST request to update Admin User by ID : {}, {}", id, adminUserDTO);

        if (adminUserDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }

        if (!Objects.equals(id, adminUserDTO.getId())) {
            throw new BadRequestAlertException("ID mismatch", ENTITY_NAME, "idmismatch");
        }

        // Check if user exists and has admin role
        Optional<User> userOpt = userService.getUserWithAuthorities(id);
        if (userOpt.isEmpty() || userOpt.get().getAuthorities().stream()
            .noneMatch(authority -> AuthoritiesConstants.ADMIN.equals(authority.getName()))) {
            LOG.debug("User with ID {} not found or does not have ADMIN role", id);
            return ResponseEntity.notFound().build();
        }

        // Always ensure the ADMIN role is preserved
        Set<String> authorities = adminUserDTO.getAuthorities();
        if (authorities == null) {
            authorities = new HashSet<>();
        }
        authorities.add(AuthoritiesConstants.ADMIN);
        adminUserDTO.setAuthorities(authorities);

        // Check if request includes password update
        String password = null;
        try {
            // Use reflection to check if password field exists and get its value
            java.lang.reflect.Field passwordField = adminUserDTO.getClass().getDeclaredField("password");
            passwordField.setAccessible(true);
            password = (String) passwordField.get(adminUserDTO);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Password field not found or cannot be accessed, continue with normal update
            LOG.debug("No password field found in AdminUserDTO or cannot be accessed");
        }

        Optional<AdminUserDTO> updatedUser;

        if (password != null && !password.isEmpty()) {
            // Update with password change
            LOG.debug("Updating user with password change");
            User user = userOpt.get();
            userService.updateUser(
                adminUserDTO.getFirstName(),
                adminUserDTO.getLastName(),
                adminUserDTO.getEmail(),
                adminUserDTO.getLangKey(),
                adminUserDTO.getImageUrl()
            );

            // Update password separately
            userService.changePassword("", password); // Empty string as we're admin and don't need current password

            // Get updated user for response
            updatedUser = userService.getUserWithAuthoritiesByLogin(user.getLogin())
                .map(AdminUserDTO::new);
        } else {
            // Standard update without password change
            updatedUser = userService.updateUser(adminUserDTO);
        }

        return ResponseUtil.wrapOrNotFound(
            updatedUser,
            HeaderUtil.createAlert(applicationName, "userManagement.updated", adminUserDTO.getLogin())
        );
    }

    /**
     * {@code GET  /admins} : get all users with ADMIN role.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the list of admin users.
     */
    @GetMapping("")
    public ResponseEntity<List<AdminUserDTO>> getAllAdmins(Pageable pageable) {
        LOG.debug("REST request to get all Admin Users");

        // Get all users with ADMIN role directly from database using optimized query
        Page<AdminUserDTO> page = userService.getUsersByAuthority(AuthoritiesConstants.ADMIN, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(),
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /admins/:id} : get the admin user with the given id.
     *
     * @param id the id of the user to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the admin user, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDTO> getAdmin(@PathVariable Long id) {
        LOG.debug("REST request to get Admin User by ID : {}", id);

        Optional<User> userOpt = userService.getUserWithAuthorities(id);

        // Check if user exists and has admin role
        if (userOpt.isEmpty() || userOpt.get().getAuthorities().stream()
            .noneMatch(authority -> AuthoritiesConstants.ADMIN.equals(authority.getName()))) {
            LOG.debug("User with ID {} not found or does not have ADMIN role", id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new AdminUserDTO(userOpt.get()));
    }

    /**
     * {@code DELETE  /admins/:id} : delete the admin user with the given id.
     *
     * @param id the id of the user to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        LOG.debug("REST request to delete Admin User by ID: {}", id);

        // Check if user exists and has admin role
        Optional<User> userOpt = userService.getUserWithAuthorities(id);
        if (userOpt.isEmpty() || userOpt.get().getAuthorities().stream()
            .noneMatch(authority -> AuthoritiesConstants.ADMIN.equals(authority.getName()))) {
            throw new BadRequestAlertException("User not found or is not an admin", ENTITY_NAME, "notadmin");
        }

        userService.deleteUser(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createAlert(applicationName, "userManagement.deleted", id.toString()))
            .build();
    }
}
