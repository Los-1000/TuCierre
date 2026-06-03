# Backend Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete `tu-cierre-backend` with JWT auth, full CRUD endpoints, WebSocket real-time support, and dashboard stats — replacing all Supabase functionality.

**Architecture:** Spring Boot 4 / Java 21. Spring Security + JJWT 0.12 for auth. JWT travels as httpOnly cookie (`access_token`) + fallback `Authorization: Bearer` header. STOMP over SockJS at `/ws` for real-time. All new endpoints under `/api/**` except auth at `/auth/**`.

**Tech Stack:** Spring Boot 4.0.6, Spring Security, JJWT 0.12.6, Spring WebSocket (STOMP/SockJS), PostgreSQL via JPA, Lombok, Java 21 records for DTOs.

**Working directory:** `C:\Users\cefd2\Downloads\NotaryOs\tu-cierre-backend`

---

## File Map

**New files:**
- `src/main/java/com/bzetab/tucierre/security/JwtUtil.java`
- `src/main/java/com/bzetab/tucierre/security/JwtAuthFilter.java`
- `src/main/java/com/bzetab/tucierre/security/UserDetailsServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/security/SecurityConfig.java`
- `src/main/java/com/bzetab/tucierre/config/WebSocketConfig.java`
- `src/main/java/com/bzetab/tucierre/controller/AuthController.java`
- `src/main/java/com/bzetab/tucierre/controller/DashboardController.java`
- `src/main/java/com/bzetab/tucierre/controller/MessageController.java`
- `src/main/java/com/bzetab/tucierre/model/Message.java`
- `src/main/java/com/bzetab/tucierre/repository/MessageRepository.java`
- `src/main/java/com/bzetab/tucierre/service/AuthService.java`
- `src/main/java/com/bzetab/tucierre/service/DashboardService.java`
- `src/main/java/com/bzetab/tucierre/service/MessageService.java`
- `src/main/java/com/bzetab/tucierre/service/impl/AuthServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/service/impl/DashboardServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/service/impl/MessageServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/dto/request/LoginRequest.java`
- `src/main/java/com/bzetab/tucierre/dto/request/SignupRequest.java`
- `src/main/java/com/bzetab/tucierre/dto/request/MessageRequest.java`
- `src/main/java/com/bzetab/tucierre/dto/response/AuthResponse.java`
- `src/main/java/com/bzetab/tucierre/dto/response/DashboardStatsResponse.java`
- `src/main/java/com/bzetab/tucierre/dto/response/MessageResponse.java`
- `src/main/java/com/bzetab/tucierre/dto/response/TramiteListItemResponse.java`

**Modified files:**
- `pom.xml` — add security, jjwt, websocket deps
- `src/main/resources/application.properties` — add JWT config, CORS
- `src/main/java/com/bzetab/tucierre/model/enums/StatusTramite.java` — add CANCELADO
- `src/main/java/com/bzetab/tucierre/repository/BrokerRepository.java` — add findByEmail, findByIsAdmin
- `src/main/java/com/bzetab/tucierre/repository/TramiteRepository.java` — add list queries
- `src/main/java/com/bzetab/tucierre/repository/PriceMatchRepository.java` — add findByBrokerId
- `src/main/java/com/bzetab/tucierre/service/BrokerService.java`
- `src/main/java/com/bzetab/tucierre/service/impl/BrokerServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/service/TramiteService.java`
- `src/main/java/com/bzetab/tucierre/service/impl/TramiteServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/service/PriceMatchService.java`
- `src/main/java/com/bzetab/tucierre/service/impl/PriceMatchServiceImpl.java`
- `src/main/java/com/bzetab/tucierre/controller/BrokerController.java`
- `src/main/java/com/bzetab/tucierre/controller/TramiteController.java`
- `src/main/java/com/bzetab/tucierre/controller/PriceMatchController.java`

---

## Task 1: Maven Dependencies + Configuration

**Files:**
- Modify: `pom.xml`
- Modify: `src/main/resources/application.properties`
- Modify: `src/main/java/com/bzetab/tucierre/model/enums/StatusTramite.java`

- [ ] **Step 1: Add dependencies to pom.xml**

Inside the `<dependencies>` block, add after the last existing dependency:

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JJWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

- [ ] **Step 2: Update application.properties**

Replace the full file with:

```properties
spring.application.name=TuCierreBackend

# Database
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT — generate with: openssl rand -base64 64
jwt.secret=${JWT_SECRET:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBkZXZlbG9wbWVudCBvbmx5IQ==}
jwt.access-expiry-ms=900000
jwt.refresh-expiry-ms=604800000

# CORS
cors.allowed-origins=http://localhost:3000
```

- [ ] **Step 3: Add CANCELADO to StatusTramite enum**

Replace the full file:

```java
package com.bzetab.tucierre.model.enums;

public enum StatusTramite {
    COTIZADO,
    SOLICITADO,
    DOCS_PENDIENTES,
    EN_REVISION,
    EN_FIRMA,
    EN_REGISTRO,
    COMPLETADO,
    CANCELADO
}
```

- [ ] **Step 4: Verify project compiles**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS with no errors.

- [ ] **Step 5: Commit**

```bash
git add pom.xml src/main/resources/application.properties src/main/java/com/bzetab/tucierre/model/enums/StatusTramite.java
git commit -m "chore: add security/jwt/websocket deps, CANCELADO status"
```

---

## Task 2: JWT Infrastructure

**Files:**
- Create: `src/main/java/com/bzetab/tucierre/security/JwtUtil.java`
- Create: `src/main/java/com/bzetab/tucierre/security/UserDetailsServiceImpl.java`
- Modify: `src/main/java/com/bzetab/tucierre/repository/BrokerRepository.java`

- [ ] **Step 1: Add findByEmail to BrokerRepository**

```java
package com.bzetab.tucierre.repository;

import com.bzetab.tucierre.model.Broker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerRepository extends JpaRepository<Broker, Long> {
    Optional<Broker> findByIdDocumentNumber(String idDocumentNumber);
    Optional<Broker> findByEmail(String email);
    List<Broker> findByIsAdmin(Boolean isAdmin);
}
```

Note: This requires `isAdmin` field on `Broker`. Add it in Step 2.

- [ ] **Step 2: Add isAdmin field to Broker model**

Open `src/main/java/com/bzetab/tucierre/model/Broker.java`. After the `email` field, add:

```java
    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private Boolean isAdmin = false;
```

- [ ] **Step 3: Create JwtUtil**

```java
package com.bzetab.tucierre.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiry-ms}")
    private long accessExpiryMs;

    @Value("${jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    public String generateAccessToken(String email) {
        return buildToken(email, accessExpiryMs);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, refreshExpiryMs);
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(signingKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String buildToken(String subject, long expiryMs) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(signingKey())
                .compact();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
```

- [ ] **Step 4: Create UserDetailsServiceImpl**

```java
package com.bzetab.tucierre.security;

import com.bzetab.tucierre.repository.BrokerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final BrokerRepository brokerRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return brokerRepository.findByEmail(email)
                .map(broker -> User.withUsername(broker.getEmail())
                        .password(broker.getPassword())
                        .roles(Boolean.TRUE.equals(broker.getIsAdmin()) ? "ADMIN" : "BROKER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Broker not found: " + email));
    }
}
```

- [ ] **Step 5: Verify compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: JWT utility and UserDetailsService"
```

---

## Task 3: Security Filter + Config

**Files:**
- Create: `src/main/java/com/bzetab/tucierre/security/JwtAuthFilter.java`
- Create: `src/main/java/com/bzetab/tucierre/security/SecurityConfig.java`

- [ ] **Step 1: Create JwtAuthFilter**

```java
package com.bzetab.tucierre.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = extractToken(request);
        if (token != null && jwtUtil.isValid(token)) {
            String email = jwtUtil.extractEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) return cookie.getValue();
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        return null;
    }
}
```

- [ ] **Step 2: Create SecurityConfig**

```java
package com.bzetab.tucierre.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/ws/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

- [ ] **Step 3: Compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/security/
git commit -m "feat: JWT auth filter and Spring Security config"
```

---

## Task 4: Auth Endpoints (Login / Signup / Refresh / Logout)

**Files:**
- Create: `src/main/java/com/bzetab/tucierre/dto/request/LoginRequest.java`
- Create: `src/main/java/com/bzetab/tucierre/dto/request/SignupRequest.java`
- Create: `src/main/java/com/bzetab/tucierre/dto/response/AuthResponse.java`
- Create: `src/main/java/com/bzetab/tucierre/service/AuthService.java`
- Create: `src/main/java/com/bzetab/tucierre/service/impl/AuthServiceImpl.java`
- Create: `src/main/java/com/bzetab/tucierre/controller/AuthController.java`

- [ ] **Step 1: Create DTOs**

`LoginRequest.java`:
```java
package com.bzetab.tucierre.dto.request;

public record LoginRequest(String email, String password) {}
```

`SignupRequest.java`:
```java
package com.bzetab.tucierre.dto.request;

public record SignupRequest(
        String fullName,
        String email,
        String password,
        String cellphone,
        String tierName,
        String referralCode
) {}
```

`AuthResponse.java`:
```java
package com.bzetab.tucierre.dto.response;

public record AuthResponse(Long id, String email, String fullName, String tierName, Boolean isAdmin) {}
```

- [ ] **Step 2: Create AuthService interface**

```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.request.LoginRequest;
import com.bzetab.tucierre.dto.request.SignupRequest;
import com.bzetab.tucierre.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse signup(SignupRequest request);
    String refreshAccessToken(String refreshToken);
    String generateRefreshToken(String email);
}
```

- [ ] **Step 3: Create AuthServiceImpl**

```java
package com.bzetab.tucierre.service.impl;

import com.bzetab.tucierre.dto.request.LoginRequest;
import com.bzetab.tucierre.dto.request.SignupRequest;
import com.bzetab.tucierre.dto.response.AuthResponse;
import com.bzetab.tucierre.model.Broker;
import com.bzetab.tucierre.model.Tier;
import com.bzetab.tucierre.repository.BrokerRepository;
import com.bzetab.tucierre.security.JwtUtil;
import com.bzetab.tucierre.service.AuthService;
import com.bzetab.tucierre.service.TierService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final BrokerRepository brokerRepository;
    private final TierService tierService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {
        Broker broker = brokerRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (broker.getPassword() == null) {
            throw new BadCredentialsException("PASSWORD_RESET_REQUIRED");
        }

        if (!passwordEncoder.matches(request.password(), broker.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return toResponse(broker);
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        if (brokerRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        Tier tier = tierService.getTierByName(request.tierName() != null ? request.tierName() : "bronce");

        Broker broker = brokerRepository.save(Broker.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .cellphone(request.cellphone())
                .tier(tier)
                .typeIdDocument(false)
                .idDocumentNumber("")
                .isAdmin(false)
                .build());

        return toResponse(broker);
    }

    @Override
    public String refreshAccessToken(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        return jwtUtil.generateAccessToken(jwtUtil.extractEmail(refreshToken));
    }

    @Override
    public String generateRefreshToken(String email) {
        return jwtUtil.generateRefreshToken(email);
    }

    private AuthResponse toResponse(Broker broker) {
        return new AuthResponse(
                broker.getId(),
                broker.getEmail(),
                broker.getFullName(),
                broker.getTier().getName(),
                broker.getIsAdmin()
        );
    }
}
```

- [ ] **Step 4: Create AuthController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.request.LoginRequest;
import com.bzetab.tucierre.dto.request.SignupRequest;
import com.bzetab.tucierre.dto.response.AuthResponse;
import com.bzetab.tucierre.security.JwtUtil;
import com.bzetab.tucierre.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        setTokenCookies(response, auth.email());
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.signup(request);
        setTokenCookies(response, auth.email());
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractCookie(request, "refresh_token");
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        addCookie(response, "access_token", newAccessToken, 900);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");
        return ResponseEntity.noContent().build();
    }

    private void setTokenCookies(HttpServletResponse response, String email) {
        addCookie(response, "access_token", jwtUtil.generateAccessToken(email), 900);
        addCookie(response, "refresh_token", authService.generateRefreshToken(email), 604800);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) throw new IllegalArgumentException("No cookies");
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cookie not found: " + name));
    }
}
```

- [ ] **Step 5: Compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 6: Start server and test login (requires DB running)**

```bash
./mvnw spring-boot:run &
sleep 5
curl -s -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Broker","email":"test@test.com","password":"Test1234!","tierName":"bronce"}' | python -m json.tool
```

Expected: JSON with `id`, `email`, `fullName`, `tierName`.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: auth endpoints (login, signup, refresh, logout) with JWT cookies"
```

---

## Task 5: Broker GET Endpoints

**Files:**
- Modify: `src/main/java/com/bzetab/tucierre/service/BrokerService.java`
- Modify: `src/main/java/com/bzetab/tucierre/service/impl/BrokerServiceImpl.java`
- Modify: `src/main/java/com/bzetab/tucierre/controller/BrokerController.java`

- [ ] **Step 1: Update BrokerService interface**

```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.request.BrokerRequest;
import com.bzetab.tucierre.dto.response.BrokerResponse;
import com.bzetab.tucierre.model.Broker;

import java.util.List;

public interface BrokerService {
    BrokerResponse createBroker(BrokerRequest brokerRequest);
    Broker getBrokerByIdDocumentNumber(String idDocumentNumber);
    Broker getBrokerByEmail(String email);
    Broker getBrokerById(Long id);
    List<Broker> getNotaries();
}
```

- [ ] **Step 2: Update BrokerServiceImpl**

```java
package com.bzetab.tucierre.service.impl;

import com.bzetab.tucierre.dto.request.BrokerRequest;
import com.bzetab.tucierre.dto.response.BrokerResponse;
import com.bzetab.tucierre.model.Broker;
import com.bzetab.tucierre.model.Tier;
import com.bzetab.tucierre.repository.BrokerRepository;
import com.bzetab.tucierre.service.BrokerService;
import com.bzetab.tucierre.service.TierService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrokerServiceImpl implements BrokerService {

    private final BrokerRepository brokerRepository;
    private final TierService tierService;

    public BrokerServiceImpl(BrokerRepository brokerRepository, TierService tierService) {
        this.brokerRepository = brokerRepository;
        this.tierService = tierService;
    }

    @Override
    public BrokerResponse createBroker(BrokerRequest brokerRequest) {
        Tier tierFound = tierService.getTierByName(brokerRequest.tierName());
        Broker brokerSaved = brokerRepository.save(Broker.builder()
                .fullName(brokerRequest.fullName())
                .typeIdDocument(brokerRequest.typeIdDocument())
                .idDocumentNumber(brokerRequest.idDocumentNumber())
                .tier(tierFound)
                .isAdmin(false)
                .build());
        return new BrokerResponse(brokerSaved.getId(), brokerSaved.getFullName(),
                brokerSaved.getTypeIdDocument(), brokerSaved.getIdDocumentNumber(), brokerSaved.getCreatedAt());
    }

    @Override
    public Broker getBrokerByIdDocumentNumber(String idDocumentNumber) {
        return brokerRepository.findByIdDocumentNumber(idDocumentNumber)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + idDocumentNumber));
    }

    @Override
    public Broker getBrokerByEmail(String email) {
        return brokerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + email));
    }

    @Override
    public Broker getBrokerById(Long id) {
        return brokerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + id));
    }

    @Override
    public List<Broker> getNotaries() {
        return brokerRepository.findByIsAdmin(true);
    }
}
```

- [ ] **Step 3: Update BrokerController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.request.BrokerRequest;
import com.bzetab.tucierre.dto.response.BrokerResponse;
import com.bzetab.tucierre.model.Broker;
import com.bzetab.tucierre.service.BrokerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brokers")
@RequiredArgsConstructor
public class BrokerController {

    private final BrokerService brokerService;

    @PostMapping
    public ResponseEntity<BrokerResponse> createBroker(@RequestBody BrokerRequest brokerRequest) {
        return ResponseEntity.ok(brokerService.createBroker(brokerRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<Broker> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(brokerService.getBrokerByEmail(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Broker> getById(@PathVariable Long id) {
        return ResponseEntity.ok(brokerService.getBrokerById(id));
    }

    @GetMapping("/notaries")
    public ResponseEntity<List<Broker>> getNotaries() {
        return ResponseEntity.ok(brokerService.getNotaries());
    }
}
```

- [ ] **Step 4: Compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: broker GET endpoints (me, by-id, notaries)"
```

---

## Task 6: Tramite List / Get / Update / Cancel Endpoints

**Files:**
- Modify: `src/main/java/com/bzetab/tucierre/repository/TramiteRepository.java`
- Create: `src/main/java/com/bzetab/tucierre/dto/response/TramiteListItemResponse.java`
- Modify: `src/main/java/com/bzetab/tucierre/service/TramiteService.java`
- Modify: `src/main/java/com/bzetab/tucierre/service/impl/TramiteServiceImpl.java`
- Modify: `src/main/java/com/bzetab/tucierre/controller/TramiteController.java`

- [ ] **Step 1: Update TramiteRepository**

```java
package com.bzetab.tucierre.repository;

import com.bzetab.tucierre.model.Tramite;
import com.bzetab.tucierre.model.enums.StatusTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TramiteRepository extends JpaRepository<Tramite, Long> {
    List<Tramite> findByBrokerIdOrderByCreatedAtDesc(Long brokerId);
    List<Tramite> findByBrokerIdAndStatusTramiteOrderByCreatedAtDesc(Long brokerId, StatusTramite status);
}
```

- [ ] **Step 2: Create TramiteListItemResponse**

```java
package com.bzetab.tucierre.dto.response;

import com.bzetab.tucierre.model.enums.StatusTramite;

import java.time.LocalDateTime;

public record TramiteListItemResponse(
        Long id,
        String referenceCode,
        String tramiteType,
        StatusTramite status,
        Double finalFee,
        LocalDateTime createdAt
) {}
```

- [ ] **Step 3: Update TramiteService interface**

```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.request.TramiteRequest;
import com.bzetab.tucierre.dto.response.TramiteListItemResponse;
import com.bzetab.tucierre.dto.response.TramiteResponse;
import com.bzetab.tucierre.model.enums.StatusTramite;

import java.util.List;

public interface TramiteService {
    TramiteResponse registerTramite(TramiteRequest tramiteRequest);
    TramiteResponse getTramiteById(Long id);
    List<TramiteListItemResponse> getTramitesByBrokerEmail(String email, StatusTramite status);
    TramiteResponse updateStatus(Long id, StatusTramite newStatus, String requesterEmail);
    void cancelTramite(Long id, String requesterEmail);
}
```

- [ ] **Step 4: Update TramiteServiceImpl — add new methods**

Add these methods to the existing `TramiteServiceImpl` class (keep `registerTramite`, `calculateFees`, `createTramite` unchanged):

```java
    @Override
    public TramiteResponse getTramiteById(Long id) {
        Tramite t = tramiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tramite not found: " + id));
        return toFullResponse(t);
    }

    @Override
    public List<TramiteListItemResponse> getTramitesByBrokerEmail(String email, StatusTramite status) {
        Long brokerId = brokerService.getBrokerByEmail(email).getId();
        List<Tramite> tramites = status != null
                ? tramiteRepository.findByBrokerIdAndStatusTramiteOrderByCreatedAtDesc(brokerId, status)
                : tramiteRepository.findByBrokerIdOrderByCreatedAtDesc(brokerId);
        return tramites.stream().map(t -> new TramiteListItemResponse(
                t.getId(),
                "TC-" + t.getCreatedAt().getYear() + "-" + String.format("%03d", t.getId()),
                t.getTramiteType().getName(),
                t.getStatusTramite(),
                t.getFinalFee(),
                t.getCreatedAt()
        )).toList();
    }

    @Override
    public TramiteResponse updateStatus(Long id, StatusTramite newStatus, String requesterEmail) {
        Tramite t = tramiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tramite not found: " + id));
        t.setStatusTramite(newStatus);
        return toFullResponse(tramiteRepository.save(t));
    }

    @Override
    public void cancelTramite(Long id, String requesterEmail) {
        Tramite t = tramiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tramite not found: " + id));
        if (!t.getBroker().getEmail().equals(requesterEmail)) {
            throw new SecurityException("Not authorized to cancel this tramite");
        }
        t.setStatusTramite(StatusTramite.CANCELADO);
        tramiteRepository.save(t);
    }

    private TramiteResponse toFullResponse(Tramite t) {
        List<TramiteParty> parties = tramitePartyService.getPartiesByTramiteId(t.getId());
        List<PartyWithRoleResponse> partyResponses = parties.stream()
                .map(tp -> new PartyWithRoleResponse(
                        tp.getParty().getFullName(),
                        tp.getParty().getTypeIdDocument(),
                        tp.getParty().getIdDocumentNumber(),
                        tp.getRole(),
                        tp.getIdDocumentFileCopy()
                )).toList();
        return new TramiteResponse(
                t.getStatusTramite(), t.getIdNotary(),
                t.getBroker().getIdDocumentNumber(),
                t.getTramiteType().getName(),
                t.getPropertyAddress(), t.getPropertyDistrictAddress(),
                t.getQuotedPriceProperty(), t.getBaseFee(),
                0.0, t.getFinalFee(), t.getCreatedAt(), partyResponses
        );
    }
```

Also add `getPartiesByTramiteId` to `TramitePartyService` interface and `TramitePartyServiceImpl`:

In `TramitePartyService.java` add:
```java
List<TramiteParty> getPartiesByTramiteId(Long tramiteId);
```

In `TramitePartyServiceImpl.java` add:
```java
@Override
public List<TramiteParty> getPartiesByTramiteId(Long tramiteId) {
    return tramitePartyRepository.findByTramiteId(tramiteId);
}
```

In `TramitePartyRepository.java` add:
```java
List<TramiteParty> findByTramiteId(Long tramiteId);
```

- [ ] **Step 5: Update TramiteController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.request.TramiteRequest;
import com.bzetab.tucierre.dto.response.TramiteListItemResponse;
import com.bzetab.tucierre.dto.response.TramiteResponse;
import com.bzetab.tucierre.model.enums.StatusTramite;
import com.bzetab.tucierre.service.TramiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tramites")
@RequiredArgsConstructor
public class TramiteController {

    private final TramiteService tramiteService;

    @PostMapping
    public ResponseEntity<TramiteResponse> createTramite(@RequestBody TramiteRequest tramiteRequest) {
        return ResponseEntity.ok(tramiteService.registerTramite(tramiteRequest));
    }

    @GetMapping
    public ResponseEntity<List<TramiteListItemResponse>> listTramites(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) StatusTramite status) {
        return ResponseEntity.ok(tramiteService.getTramitesByBrokerEmail(userDetails.getUsername(), status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TramiteResponse> getTramite(@PathVariable Long id) {
        return ResponseEntity.ok(tramiteService.getTramiteById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TramiteResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        StatusTramite newStatus = StatusTramite.valueOf(body.get("status"));
        return ResponseEntity.ok(tramiteService.updateStatus(id, newStatus, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelTramite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        tramiteService.cancelTramite(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 6: Compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: tramite list/get/update-status/cancel endpoints"
```

---

## Task 7: Dashboard Stats Endpoint

**Files:**
- Create: `src/main/java/com/bzetab/tucierre/dto/response/DashboardStatsResponse.java`
- Create: `src/main/java/com/bzetab/tucierre/service/DashboardService.java`
- Create: `src/main/java/com/bzetab/tucierre/service/impl/DashboardServiceImpl.java`
- Create: `src/main/java/com/bzetab/tucierre/controller/DashboardController.java`

- [ ] **Step 1: Create DashboardStatsResponse**

```java
package com.bzetab.tucierre.dto.response;

public record DashboardStatsResponse(
        long activeTramites,
        long completedThisMonth,
        double totalManagedValue,
        double totalSavings,
        double commissionThisMonth,
        int tierProgressCount,
        String tierName
) {}
```

- [ ] **Step 2: Create DashboardService interface**

```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getStats(String email);
}
```

- [ ] **Step 3: Create DashboardServiceImpl**

```java
package com.bzetab.tucierre.service.impl;

import com.bzetab.tucierre.dto.response.DashboardStatsResponse;
import com.bzetab.tucierre.model.Broker;
import com.bzetab.tucierre.model.Tramite;
import com.bzetab.tucierre.model.enums.StatusTramite;
import com.bzetab.tucierre.repository.TramiteRepository;
import com.bzetab.tucierre.service.BrokerService;
import com.bzetab.tucierre.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final BrokerService brokerService;
    private final TramiteRepository tramiteRepository;

    @Override
    public DashboardStatsResponse getStats(String email) {
        Broker broker = brokerService.getBrokerByEmail(email);
        List<Tramite> all = tramiteRepository.findByBrokerIdOrderByCreatedAtDesc(broker.getId());

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        long active = all.stream()
                .filter(t -> t.getStatusTramite() != StatusTramite.COMPLETADO
                        && t.getStatusTramite() != StatusTramite.CANCELADO)
                .count();

        List<Tramite> completedThisMonth = all.stream()
                .filter(t -> t.getStatusTramite() == StatusTramite.COMPLETADO
                        && t.getCreatedAt().isAfter(startOfMonth))
                .toList();

        double totalValue = all.stream().mapToDouble(t -> t.getQuotedPriceProperty() != null ? t.getQuotedPriceProperty() : 0).sum();

        // Savings = sum of (baseFee - finalFee) for completed tramites
        double savings = all.stream()
                .filter(t -> t.getStatusTramite() == StatusTramite.COMPLETADO)
                .mapToDouble(t -> (t.getBaseFee() != null && t.getFinalFee() != null)
                        ? t.getBaseFee() - t.getFinalFee() : 0)
                .sum();

        double commission = completedThisMonth.stream()
                .mapToDouble(t -> t.getFinalFee() != null ? t.getFinalFee() : 0)
                .sum();

        return new DashboardStatsResponse(
                active,
                completedThisMonth.size(),
                totalValue,
                savings,
                commission,
                completedThisMonth.size(),
                broker.getTier().getName()
        );
    }
}
```

- [ ] **Step 4: Create DashboardController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.response.DashboardStatsResponse;
import com.bzetab.tucierre.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getStats(userDetails.getUsername()));
    }
}
```

- [ ] **Step 5: Compile and commit**

```bash
./mvnw compile -q
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: dashboard stats endpoint"
```

---

## Task 8: Messages + WebSocket

**Files:**
- Create: `src/main/java/com/bzetab/tucierre/model/Message.java`
- Create: `src/main/java/com/bzetab/tucierre/repository/MessageRepository.java`
- Create: `src/main/java/com/bzetab/tucierre/dto/request/MessageRequest.java`
- Create: `src/main/java/com/bzetab/tucierre/dto/response/MessageResponse.java`
- Create: `src/main/java/com/bzetab/tucierre/service/MessageService.java`
- Create: `src/main/java/com/bzetab/tucierre/service/impl/MessageServiceImpl.java`
- Create: `src/main/java/com/bzetab/tucierre/config/WebSocketConfig.java`
- Create: `src/main/java/com/bzetab/tucierre/controller/MessageController.java`

- [ ] **Step 1: Create Message model**

```java
package com.bzetab.tucierre.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tramite_id", nullable = false)
    private Tramite tramite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_id", nullable = false)
    private Broker sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

- [ ] **Step 2: Create MessageRepository**

```java
package com.bzetab.tucierre.repository;

import com.bzetab.tucierre.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTramiteIdOrderByCreatedAtAsc(Long tramiteId);
}
```

- [ ] **Step 3: Create DTOs**

`MessageRequest.java`:
```java
package com.bzetab.tucierre.dto.request;

public record MessageRequest(String content) {}
```

`MessageResponse.java`:
```java
package com.bzetab.tucierre.dto.response;

import java.time.LocalDateTime;

public record MessageResponse(
        Long id, Long tramiteId, Long senderId,
        String senderName, String content, LocalDateTime createdAt
) {}
```

- [ ] **Step 4: Create WebSocketConfig**

```java
package com.bzetab.tucierre.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

- [ ] **Step 5: Create MessageService + Impl**

`MessageService.java`:
```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.request.MessageRequest;
import com.bzetab.tucierre.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    List<MessageResponse> getMessages(Long tramiteId);
    MessageResponse sendMessage(Long tramiteId, String senderEmail, MessageRequest request);
}
```

`MessageServiceImpl.java`:
```java
package com.bzetab.tucierre.service.impl;

import com.bzetab.tucierre.dto.request.MessageRequest;
import com.bzetab.tucierre.dto.response.MessageResponse;
import com.bzetab.tucierre.model.Broker;
import com.bzetab.tucierre.model.Message;
import com.bzetab.tucierre.model.Tramite;
import com.bzetab.tucierre.repository.MessageRepository;
import com.bzetab.tucierre.repository.TramiteRepository;
import com.bzetab.tucierre.service.BrokerService;
import com.bzetab.tucierre.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final TramiteRepository tramiteRepository;
    private final BrokerService brokerService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<MessageResponse> getMessages(Long tramiteId) {
        return messageRepository.findByTramiteIdOrderByCreatedAtAsc(tramiteId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public MessageResponse sendMessage(Long tramiteId, String senderEmail, MessageRequest request) {
        Tramite tramite = tramiteRepository.findById(tramiteId)
                .orElseThrow(() -> new RuntimeException("Tramite not found: " + tramiteId));
        Broker sender = brokerService.getBrokerByEmail(senderEmail);

        Message saved = messageRepository.save(Message.builder()
                .tramite(tramite)
                .sender(sender)
                .content(request.content())
                .build());

        MessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/tramite/" + tramiteId + "/chat", response);
        return response;
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(m.getId(), m.getTramite().getId(),
                m.getSender().getId(), m.getSender().getFullName(),
                m.getContent(), m.getCreatedAt());
    }
}
```

- [ ] **Step 6: Create MessageController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.request.MessageRequest;
import com.bzetab.tucierre.dto.response.MessageResponse;
import com.bzetab.tucierre.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tramites/{tramiteId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long tramiteId) {
        return ResponseEntity.ok(messageService.getMessages(tramiteId));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long tramiteId,
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(messageService.sendMessage(tramiteId, userDetails.getUsername(), request));
    }
}
```

- [ ] **Step 7: Compile**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: messages REST + WebSocket STOMP at /ws"
```

---

## Task 9: Price Match Additional Endpoints

**Files:**
- Modify: `src/main/java/com/bzetab/tucierre/repository/PriceMatchRepository.java`
- Modify: `src/main/java/com/bzetab/tucierre/service/PriceMatchService.java`
- Modify: `src/main/java/com/bzetab/tucierre/service/impl/PriceMatchServiceImpl.java`
- Modify: `src/main/java/com/bzetab/tucierre/controller/PriceMatchController.java`

- [ ] **Step 1: Update PriceMatchRepository**

```java
package com.bzetab.tucierre.repository;

import com.bzetab.tucierre.model.PriceMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceMatchRepository extends JpaRepository<PriceMatch, Long> {
    List<PriceMatch> findByBrokerId(Long brokerId);
}
```

- [ ] **Step 2: Update PriceMatchService**

```java
package com.bzetab.tucierre.service;

import com.bzetab.tucierre.dto.request.PriceMatchRequest;
import com.bzetab.tucierre.dto.response.PriceMatchResponse;

import java.util.List;

public interface PriceMatchService {
    PriceMatchResponse registerPriceMatch(PriceMatchRequest request);
    List<PriceMatchResponse> getByBroker(String email);
    PriceMatchResponse approve(Long id);
    PriceMatchResponse reject(Long id);
}
```

- [ ] **Step 3: Read current PriceMatchServiceImpl to understand its structure, then add new methods**

Read `src/main/java/com/bzetab/tucierre/service/impl/PriceMatchServiceImpl.java` first.

Then add to the class:

```java
    @Override
    public List<PriceMatchResponse> getByBroker(String email) {
        Broker broker = brokerService.getBrokerByEmail(email);
        return priceMatchRepository.findByBrokerId(broker.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public PriceMatchResponse approve(Long id) {
        PriceMatch pm = priceMatchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PriceMatch not found: " + id));
        pm.setStatus(StatusPriceMatch.APPROVED);
        return toResponse(priceMatchRepository.save(pm));
    }

    @Override
    public PriceMatchResponse reject(Long id) {
        PriceMatch pm = priceMatchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PriceMatch not found: " + id));
        pm.setStatus(StatusPriceMatch.REJECTED);
        return toResponse(priceMatchRepository.save(pm));
    }
```

Also add `private PriceMatchResponse toResponse(PriceMatch pm)` if not already present — check the existing impl first and align with whatever `PriceMatchResponse` record already expects.

- [ ] **Step 4: Update PriceMatchController**

```java
package com.bzetab.tucierre.controller;

import com.bzetab.tucierre.dto.request.PriceMatchRequest;
import com.bzetab.tucierre.dto.response.PriceMatchResponse;
import com.bzetab.tucierre.service.PriceMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-match")
@RequiredArgsConstructor
public class PriceMatchController {

    private final PriceMatchService priceMatchService;

    @PostMapping
    public ResponseEntity<PriceMatchResponse> register(@RequestBody PriceMatchRequest request) {
        return ResponseEntity.ok(priceMatchService.registerPriceMatch(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PriceMatchResponse>> getMyPriceMatches(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(priceMatchService.getByBroker(userDetails.getUsername()));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<PriceMatchResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(priceMatchService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<PriceMatchResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(priceMatchService.reject(id));
    }
}
```

- [ ] **Step 5: Final compile + run**

```bash
./mvnw compile -q
./mvnw spring-boot:run
```

Expected: Server starts on port 8080. Check `http://localhost:8080/auth/login` returns 405 (Method Not Allowed on GET — means security is working, endpoint exists).

- [ ] **Step 6: Final commit**

```bash
git add src/main/java/com/bzetab/tucierre/
git commit -m "feat: price match list/approve/reject endpoints — backend complete"
```
