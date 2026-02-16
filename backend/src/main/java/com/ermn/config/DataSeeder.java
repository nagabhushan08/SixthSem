package com.ermn.config;

import com.ermn.model.entity.*;
import com.ermn.model.enums.*;
import com.ermn.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BedInventoryRepository bedInventoryRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final BloodBankRepository bloodBankRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      HospitalRepository hospitalRepository,
                      BedInventoryRepository bedInventoryRepository,
                      AmbulanceRepository ambulanceRepository,
                      BloodBankRepository bloodBankRepository,
                      BloodInventoryRepository bloodInventoryRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.bedInventoryRepository = bedInventoryRepository;
        this.ambulanceRepository = ambulanceRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // 1. Seed Super Admin
        User admin = User.builder()
                .fullName("Super Admin")
                .email("admin@ermn.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .phone("0000000000")
                .role(Role.SUPER_ADMIN)
                .build();
        userRepository.save(admin);

        // 2. Seed Hospitals
        seedHospital("City General Hospital", "MG Road, Bangalore", "12.9716", "77.5946", "hospital1@ermn.com");
        seedHospital("St. Mary's Medical Center", "Indiranagar, Bangalore", "12.9784", "77.6408", "hospital2@ermn.com");
        seedHospital("Apollo Health City", "Bannerghatta Road, Bangalore", "12.8959", "77.5983", "hospital3@ermn.com");

        // 3. Seed Ambulances
        seedAmbulance("KA-01-AM-1234", "12.9716", "77.5946", "driver1@ermn.com");
        seedAmbulance("KA-05-EM-5678", "12.9345", "77.6101", "driver2@ermn.com");
        seedAmbulance("KA-03-HL-9012", "12.9912", "77.5843", "driver3@ermn.com");

        // 4. Seed Blood Banks
        seedBloodBank("Red Cross Blood Bank", "Shivajinagar, Bangalore", "12.9856", "77.5968", "blood1@ermn.com");
        seedBloodBank("Rotary Blood Center", "Jayanagar, Bangalore", "12.9250", "77.5938", "blood2@ermn.com");
    }

    private void seedHospital(String name, String address, String lat, String lon, String email) {
        User hospitalAdmin = User.builder()
                .fullName(name + " Admin")
                .email(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .phone("111111111" + (int)(Math.random() * 9))
                .role(Role.HOSPITAL_ADMIN)
                .build();
        userRepository.save(hospitalAdmin);

        Hospital hospital = Hospital.builder()
                .name(name)
                .address(address)
                .latitude(new BigDecimal(lat))
                .longitude(new BigDecimal(lon))
                .phone("080-1234567" + (int)(Math.random() * 9))
                .admin(hospitalAdmin)
                .build();
        hospitalRepository.save(hospital);

        // Seed Bed Inventory
        Arrays.stream(BedType.values()).forEach(type -> {
            BedInventory inventory = BedInventory.builder()
                    .hospital(hospital)
                    .bedType(type)
                    .totalCapacity(50)
                    .availableCount((int)(Math.random() * 40) + 10)
                    .build();
            bedInventoryRepository.save(inventory);
        });
    }

    private void seedAmbulance(String vehicleNumber, String lat, String lon, String email) {
        User driver = User.builder()
                .fullName("Driver " + vehicleNumber)
                .email(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .phone("222222222" + (int)(Math.random() * 9))
                .role(Role.AMBULANCE_DRIVER)
                .build();
        userRepository.save(driver);

        Ambulance ambulance = Ambulance.builder()
                .driver(driver)
                .vehicleNumber(vehicleNumber)
                .isAvailable(true)
                .isApproved(true)
                .currentLatitude(new BigDecimal(lat))
                .currentLongitude(new BigDecimal(lon))
                .build();
        ambulanceRepository.save(ambulance);
    }

    private void seedBloodBank(String name, String address, String lat, String lon, String email) {
        User bloodBankAdmin = User.builder()
                .fullName(name + " Admin")
                .email(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .phone("333333333" + (int)(Math.random() * 9))
                .role(Role.BLOOD_BANK_ADMIN)
                .build();
        userRepository.save(bloodBankAdmin);

        BloodBank bloodBank = BloodBank.builder()
                .name(name)
                .address(address)
                .latitude(new BigDecimal(lat))
                .longitude(new BigDecimal(lon))
                .phone("080-9876543" + (int)(Math.random() * 9))
                .admin(bloodBankAdmin)
                .build();
        bloodBankRepository.save(bloodBank);

        // Seed Blood Inventory
        Arrays.stream(BloodGroup.values()).forEach(group -> {
            BloodInventory inventory = BloodInventory.builder()
                    .bloodBank(bloodBank)
                    .bloodGroup(group)
                    .quantityUnits((int)(Math.random() * 20) + 5)
                    .isEmergencyShortage(Math.random() > 0.8)
                    .build();
            bloodInventoryRepository.save(inventory);
        });
    }
}
