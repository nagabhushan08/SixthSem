CREATE TABLE IF NOT EXISTS ambulances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    driver_id BIGINT UNIQUE NOT NULL,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_updated_location TIMESTAMP NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_is_available (is_available),
    INDEX idx_is_approved (is_approved),
    INDEX idx_location (current_latitude, current_longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
