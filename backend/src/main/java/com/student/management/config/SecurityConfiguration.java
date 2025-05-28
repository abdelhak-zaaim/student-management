package com.student.management.config;

import com.student.management.security.AuthoritiesConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private final StudentManagementProperties studentManagementProperties;

    public SecurityConfiguration(StudentManagementProperties studentManagementProperties) {
        this.studentManagementProperties = studentManagementProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
        http
               // .cors(AbstractHttpConfigurer::disable)

               // .cors(withDefaults())
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz ->
                        // prettier-ignore
                        authz
                                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()

                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                .requestMatchers(mvc.pattern( "/api/authenticate")).permitAll()

                                .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/authenticate")).permitAll()
                                .requestMatchers(mvc.pattern("/api/register")).permitAll()
                                .requestMatchers(mvc.pattern("/api/activate")).permitAll()
                                .requestMatchers(mvc.pattern("/api/account/reset-password/init")).permitAll()
                                .requestMatchers(mvc.pattern("/api/account/reset-password/finish")).permitAll()
                                .requestMatchers(mvc.pattern("/api/account/reset-password/finish")).permitAll()
                                .requestMatchers(mvc.pattern("/api/students/**"), mvc.pattern("/api/professors/**"),
                                        mvc.pattern("/api/student-groups/**"), mvc.pattern("/api/subjects/**")).hasAnyAuthority(AuthoritiesConstants.PROFESSOR,AuthoritiesConstants.ADMIN)
                                .requestMatchers(mvc.pattern("/api/**")).authenticated()
                                .requestMatchers(mvc.pattern("/v3/api-docs/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                                .requestMatchers(mvc.pattern("/api/course-assignments/**")).hasAnyAuthority(AuthoritiesConstants.PROFESSOR,AuthoritiesConstants.ADMIN)
                                .requestMatchers(mvc.pattern("/management/health")).permitAll()
                                .requestMatchers(mvc.pattern("/management/health/**")).permitAll()
                                .requestMatchers(mvc.pattern("/management/info")).permitAll()
                                .requestMatchers(mvc.pattern("/management/prometheus")).permitAll()
                                .requestMatchers(mvc.pattern("/management/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions ->
                        exceptions
                                .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                                .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(withDefaults())
                        // Skip JWT verification for authentication endpoints
                        .bearerTokenResolver(request -> {
                            String path = request.getRequestURI();
                            if (path.equals("/api/authenticate") ||
                                    path.equals("/api/register") ||
                                    path.startsWith("/api/activate") ||
                                    path.startsWith("/api/account/reset-password")) {
                                return null;
                            }
                            return new org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver().resolve(request);
                        })
                );
        return http.build();
    }

    @Bean
    MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }


}
