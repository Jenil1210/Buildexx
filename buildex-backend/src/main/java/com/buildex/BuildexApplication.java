package com.buildex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@org.springframework.cache.annotation.EnableCaching
public class BuildexApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuildexApplication.class, args);
    }
}