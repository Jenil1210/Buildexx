package com.buildex.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.buildex.entity.Property.Purpose;
import com.buildex.entity.Property.PropertyType;
import com.buildex.entity.Property.AvailabilityStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.util.StringUtils;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToPurposeConverter());
        registry.addConverter(new StringToPropertyTypeConverter());
        registry.addConverter(new StringToAvailabilityStatusConverter());
    }

    private static class StringToPurposeConverter implements Converter<String, Purpose> {
        @Override
        public Purpose convert(String source) {
            if (!StringUtils.hasText(source)) {
                return null;
            }
            return Purpose.valueOf(source.toUpperCase());
        }
    }

    private static class StringToPropertyTypeConverter implements Converter<String, PropertyType> {
        @Override
        public PropertyType convert(String source) {
            if (!StringUtils.hasText(source)) {
                return null;
            }
            // Handle specific mappings if needed (e.g. "Residential" -> RESIDENTIAL)
            // For now assume direct mapping to uppercase
            return PropertyType.valueOf(source.toUpperCase().replace(" ", "_"));
        }
    }

    private static class StringToAvailabilityStatusConverter implements Converter<String, AvailabilityStatus> {
        @Override
        public AvailabilityStatus convert(String source) {
            if (!StringUtils.hasText(source)) {
                return null;
            }
            return AvailabilityStatus.valueOf(source.toUpperCase());
        }
    }
}
