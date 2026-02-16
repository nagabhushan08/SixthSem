package com.ermn.model.dto.response;

import com.ermn.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
