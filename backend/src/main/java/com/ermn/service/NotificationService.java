package com.ermn.service;

import com.ermn.model.entity.BloodBank;
import com.ermn.model.entity.Notification;
import com.ermn.model.entity.User;
import com.ermn.model.enums.BloodGroup;
import com.ermn.model.enums.NotificationType;
import com.ermn.model.enums.Role;
import com.ermn.repository.NotificationRepository;
import com.ermn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public void createBloodShortageNotification(BloodBank bloodBank, BloodGroup bloodGroup) {
        // Notify all super admins
        List<User> superAdmins = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.SUPER_ADMIN && user.getIsActive())
                .collect(java.util.stream.Collectors.toList());

        String message = String.format("Emergency blood shortage: %s at %s has less than threshold units",
                bloodGroup, bloodBank.getName());

        for (User admin : superAdmins) {
            Notification notification = Notification.builder()
                    .user(admin)
                    .title("Blood Shortage Alert")
                    .message(message)
                    .type(NotificationType.BLOOD_SHORTAGE)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
    }

    public List<com.ermn.model.dto.response.NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to mark this notification as read");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationRepository.markAllAsReadByUser(user);
    }

    private com.ermn.model.dto.response.NotificationResponse mapToNotificationResponse(Notification notification) {
        return com.ermn.model.dto.response.NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
