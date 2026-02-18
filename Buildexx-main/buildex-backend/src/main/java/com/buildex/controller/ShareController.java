package com.buildex.controller;

import com.buildex.entity.Property;
import com.buildex.service.PropertyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller; // Use @Controller for serving HTML, not RestController
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Optional;

@Controller
@RequestMapping("/share")
public class ShareController {

    private final PropertyService propertyService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public ShareController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/property/{id}")
    @ResponseBody
    public String shareProperty(@PathVariable Long id) {
        Optional<Property> propertyOpt = propertyService.getPropertyById(id);

        if (propertyOpt.isEmpty()) {
            return "<html><body><h1>Property Not Found</h1></body></html>";
        }

        Property property = propertyOpt.get();

        // Construct absolute image URL
        // If image URL is relative or needs prefix, handle it here.
        // Assuming imageUrls contains full URLs or we need a base URL.
        String imageUrl = "";
        if (property.getGalleryImages() != null && !property.getGalleryImages().isEmpty()) {
            imageUrl = property.getGalleryImages().get(0);
        } else {
            // Fallback image
            imageUrl = "https://placehold.co/600x400?text=Buildex+Property";
        }

        String title = property.getTitle() != null ? property.getTitle() : "Property on Buildex";
        String description = property.getDescription() != null
                ? property.getDescription().substring(0, Math.min(property.getDescription().length(), 200)) + "..."
                : "Check out this amazing property on Buildex!";

        // Clean up description for HTML meta tag (remove quotes, newlines)
        description = description.replace("\"", "'").replace("\n", " ");
        title = title.replace("\"", "'");

        // The frontend URL where the user should actually go
        String targetUrl = frontendUrl + "/property/" + id;

        return String.format(
                """
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">

                            <!-- Open Graph / Facebook -->
                            <meta property="og:type" content="website" />
                            <meta property="og:url" content="%s" />
                            <meta property="og:title" content="%s" />
                            <meta property="og:description" content="%s" />
                            <meta property="og:image" content="%s" />

                            <!-- Twitter -->
                            <meta property="twitter:card" content="summary_large_image" />
                            <meta property="twitter:url" content="%s" />
                            <meta property="twitter:title" content="%s" />
                            <meta property="twitter:description" content="%s" />
                            <meta property="twitter:image" content="%s" />

                            <title>%s</title>

                            <style>
                                body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
                                .loader { border: 5px solid #f3f3f3; border-top: 5px solid #C8A24A; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                                @keyframes spin { 0%% { transform: rotate(0deg); } 100%% { transform: rotate(360deg); } }
                            </style>

                            <script>
                                // Redirect immediately
                                window.location.href = '%s';
                            </script>
                        </head>
                        <body>
                            <div class="loader"></div>
                            <h2>Redirecting to Property...</h2>
                            <p>If you are not redirected automatically, <a href="%s">click here</a>.</p>
                        </body>
                        </html>
                        """,
                targetUrl, title, description, imageUrl, // OG
                targetUrl, title, description, imageUrl, // Twitter
                title,
                targetUrl, targetUrl // Script & Link
        );
    }
}
