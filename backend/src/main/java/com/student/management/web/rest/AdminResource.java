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
     * {@code GET  /admins/:login} : get the "login" admin user.
     *
     * @param login the login of the user to find.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the "login" user, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{login}")
    public ResponseEntity<AdminUserDTO> getAdmin(@PathVariable String login) {
        LOG.debug("REST request to get Admin User : {}", login);

        // Check if user has admin role before retrieving
        if (!userService.hasAuthority(login, AuthoritiesConstants.ADMIN)) {
            LOG.debug("User {} does not have ADMIN role", login);
            return ResponseEntity.notFound().build();
        }

        return userService.getUserWithAuthoritiesByLogin(login)
            .map(AdminUserDTO::new)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * {@code DELETE  /admins/:login} : delete the "login" Admin User.
     *
     * @param login the login of the user to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{login}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String login) {
        LOG.debug("REST request to delete Admin User: {}", login);

        // Check if user has ADMIN role before deleting
        boolean hasAdminRole = userService.getUserWithAuthoritiesByLogin(login)
            .map(user -> user.getAuthorities().stream()
                .anyMatch(authority -> AuthoritiesConstants.ADMIN.equals(authority.getName())))
            .orElse(false);

        if (!hasAdminRole) {
            throw new BadRequestAlertException("User is not an admin", ENTITY_NAME, "notadmin");
        }

        userService.deleteUser(login);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createAlert(applicationName, "userManagement.deleted", login))
            .build();
    }
}
