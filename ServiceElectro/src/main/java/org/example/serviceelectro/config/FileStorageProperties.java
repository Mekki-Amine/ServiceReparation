package org.example.serviceelectro.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
@Configuration
@ConfigurationProperties(prefix = "file")
@Getter
@Setter
public class FileStorageProperties {
    private String uploadDir = "./uploads";
    private long maxFileSize = 20485760; // 20MB par défaut
     private String[] allowedTypes = {
        "image/jpeg", 
        "image/png", 
        "image/jpg",
        "image/gif",
        "application/pdf"
    };
}

