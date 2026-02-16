package com.ermn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ErmnApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErmnApplication.class, args);
    }
}
