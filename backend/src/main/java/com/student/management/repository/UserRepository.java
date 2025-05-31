package com.student.management.repository;

import com.student.management.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findOneByActivationKey(String activationKey);
    List<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);
    Optional<User> findOneByResetKey(String resetKey);
    Optional<User> findOneByEmailIgnoreCase(String email);
    Optional<User> findOneByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    Page<User> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);

    /**
     * Find all user logins with a specific authority.
     * This query doesn't fetch the authorities collection, making it pagination-friendly.
     *
     * @param authority the authority name to filter by
     * @param pageable the pagination information
     * @return page of user IDs with the specified authority
     */
    @Query("SELECT DISTINCT u.id FROM User u JOIN u.authorities a WHERE a.name = :authority AND u.activated = true")
    Page<Long> findAllIdsByAuthority(@Param("authority") String authority, Pageable pageable);

    /**
     * Find all users by their IDs and eagerly load their authorities.
     * This method is used after pagination to avoid collection fetch join issues.
     *
     * @param ids the IDs of users to fetch
     * @return list of users with their authorities eagerly loaded
     */
    @EntityGraph(attributePaths = "authorities")
    @Query("SELECT u FROM User u WHERE u.id IN :ids")
    List<User> findAllWithAuthoritiesByIdIn(@Param("ids") Set<Long> ids);

    /**
     * Check if a user has a specific authority.
     *
     * @param login the login of the user
     * @param authority the authority name
     * @return true if the user has the authority, false otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u JOIN u.authorities a WHERE u.login = :login AND a.name = :authority")
    boolean hasAuthority(@Param("login") String login, @Param("authority") String authority);
}
