package com.buildex.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", folder, "resource_type", "auto"));
        return uploadResult.get("secure_url").toString();
    }

    public String uploadImage(MultipartFile file) throws IOException {
        return uploadFile(file, "properties/images");
    }

    public String uploadBrochure(MultipartFile file) throws IOException {
        return uploadFile(file, "properties/brochures");
    }

    public String uploadPanorama(MultipartFile file) throws IOException {
        return uploadFile(file, "properties/panorama");
    }

    public String uploadPdf(byte[] fileBytes, String fileName) throws IOException {
        // Remove .pdf extension from fileName since Cloudinary will add it when resource_type is raw
        String publicId = fileName.endsWith(".pdf") ? fileName.substring(0, fileName.length() - 4) : fileName;
        
        Map uploadResult = cloudinary.uploader().upload(fileBytes,
                ObjectUtils.asMap("folder", "payments/receipts",
                        "resource_type", "raw",
                        "public_id", publicId));
        return uploadResult.get("secure_url").toString();
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
