package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.LoginRequest;
import com.ermn.model.dto.request.RefreshTokenRequest;
import com.ermn.model.dto.request.RegisterRequest;
import com.ermn.model.dto.response.AuthResponse;
import com.ermn.model.dto.response.UserResponse;
import com.ermn.model.entity.User;
import com.ermn.repository.UserRepository;
import com.ermn.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                      UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), request.getPassword());
        authentication = authenticationManager.authenticate(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("User not found"));

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String email;
        try {
            email = tokenProvider.getUsernameFromToken(request.getRefreshToken());
        } catch (Exception e) {
            throw new CustomException("Invalid or expired refresh token");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));
        if (!user.getIsActive()) {
            throw new CustomException("User account is deactivated");
        }
        var userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        String accessToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(authentication);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
