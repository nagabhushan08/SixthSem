CREATE TABLE IF NOT EXISTS bed_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    bed_type ENUM('ICU', 'GENERAL', 'EMERGENCY') NOT NULL,
    total_capacity INT NOT NULL,
    available_count INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    UNIQUE KEY uk_hospital_bed_type (hospital_id, bed_type),
    INDEX idx_hospital_bed_type (hospital_id, bed_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
