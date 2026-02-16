CREATE TABLE IF NOT EXISTS blood_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blood_bank_id BIGINT NOT NULL,
    blood_group ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    quantity_units INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 10,
    is_emergency_shortage BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE,
    UNIQUE KEY uk_blood_bank_group (blood_bank_id, blood_group),
    INDEX idx_blood_bank_group (blood_bank_id, blood_group),
    INDEX idx_emergency_shortage (is_emergency_shortage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
