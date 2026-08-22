package com.example.demo.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final JwtAuthenticationEntryPoint entryPoint;

    public SecurityConfig(JwtAuthFilter jwtFilter, JwtAuthenticationEntryPoint entryPoint) {
        this.jwtFilter = jwtFilter;
        this.entryPoint = entryPoint;  
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/patients/register").permitAll()
                .requestMatchers(HttpMethod.POST,"/api/slots/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/doctors/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/slots/**").permitAll()
                
             // ⬇️ YE DOWNO LINES ADD KAREIN (Sahi URL path match karke) ⬇️
                .requestMatchers(HttpMethod.GET, "/api/location/**").permitAll() // Location fetch karna sabke liye open hoga
                .requestMatchers(HttpMethod.POST, "/api/location/**").hasRole("ADMIN") // Location set/update sirf Admin kar sake
                
                // Doctor endpoints
                .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/lab/**").permitAll()
                .requestMatchers("/api/visits/**").permitAll()
                .requestMatchers("/api/medicines/**").permitAll()
                .requestMatchers("/api/billing/**").permitAll()
                // Hospital-Staff
                .requestMatchers("/api/appointment-staff/**")
                .hasAnyRole("ADMIN","APPOINTMENT") 

                .requestMatchers("/api/pharmacy-staff/**")
                .hasAnyRole("ADMIN","PHARMACY")

                .requestMatchers("/api/billing-staff/**")
                .hasAnyRole("ADMIN","BILLING")
                                      
                // All other requests require authentication
                .anyRequest().authenticated()
            );

        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. Jo link KABHI NAHI BADLEGA (Main Link) use yahan dalo:
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",                                 // Local testing ke liye
            "https://hospital-management-system-2026.vercel.app"     // <-- Yeh tumhara hamesha fix rehne wala main link hai
        ));
        
        // 2. Jo links HAR BAAR BADALTE HAIN, unke liye yeh pattern dalo (Yahan '*' ka matlab hai kuch bhi dynamic text):
        configuration.setAllowedOriginPatterns(List.of(
            "https://hospital-management-system-2026-*.vercel.app"  // <-- Is '*' ki wajah se har naya link apne aap allow ho jayega!
        ));
        
        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
