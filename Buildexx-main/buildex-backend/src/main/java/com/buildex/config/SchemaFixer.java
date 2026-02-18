package com.buildex.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// @Component  // Temporarily disabled due to database connection issues
@Order(1) // Run before DataSeeder
public class SchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Running Schema Fixer...");

        try {
            // 0. Consolidated Migrations from BuildexApplication
            jdbcTemplate.execute("UPDATE properties SET availability_status = UPPER(availability_status) WHERE availability_status IS NOT NULL");
            jdbcTemplate.execute("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_availability_status_check");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_property_city ON properties(city)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_property_area ON properties(area)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_property_is_verified ON properties(is_verified)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_property_purpose ON properties(purpose)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_property_type ON properties(property_type)");

            // 1. Fix Property Amenities (Remove duplicates)
            jdbcTemplate.execute(
                    "DELETE FROM property_amenities a USING property_amenities b WHERE a.ctid < b.ctid AND a.property_id = b.property_id AND a.amenity = b.amenity");

            // 2. Fix Property Images (Only re-sequence if needed to avoid locks)
            Integer nullCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM property_images WHERE image_order IS NULL", Integer.class);
            if (nullCount != null && nullCount > 0) {
                System.out.println("Fixing NULL image_orders...");
                jdbcTemplate.execute("UPDATE property_images SET image_order = 0 WHERE image_order IS NULL");
            }

            // Check for potential primary key conflicts (duplicates in property_id, image_order)
            Integer duplicateCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM (SELECT property_id, image_order FROM property_images WHERE image_order IS NOT NULL GROUP BY property_id, image_order HAVING COUNT(*) > 1) as dups", 
                Integer.class);
            
            if (duplicateCount != null && duplicateCount > 0) {
                System.out.println("Detected " + duplicateCount + " image_order conflicts. Re-sequencing...");
                // Wrap in a high offset update to prevent PK violations during re-ranking
                jdbcTemplate.execute("UPDATE property_images SET image_order = image_order + 1000 WHERE image_order IS NOT NULL");
                jdbcTemplate.execute(
                    "WITH ranked_images AS (SELECT ctid, ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY image_url, ctid) - 1 as new_order FROM property_images) " +
                    "UPDATE property_images SET image_order = ranked_images.new_order FROM ranked_images WHERE property_images.ctid = ranked_images.ctid");
            }

            // 3. Add Indexes for junction tables and foreign keys to speed up loading
            System.out.println("Adding performance indexes...");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_img_id ON property_images(property_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_amen_id ON property_amenities(property_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_pano_id ON property_panorama_images(property_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_prop_builder_id ON properties(builder_id)");

            // 4. Fix Withdrawals table (New project missing columns)
            System.out.println("Checking for missing columns in withdrawals table...");
            jdbcTemplate.execute("ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(19, 2)");
            jdbcTemplate.execute(
                    "ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            jdbcTemplate.execute(
                    "ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS payout_amount DECIMAL(19, 2)");

            // 5. Fix broken Stonehenge panorama URLs (Migration from broken Wikimedia to Pannellum)
            System.out.println("Migrating broken panorama URLs...");
            jdbcTemplate.execute(
                    "UPDATE property_panorama_images SET panorama_image_url = 'https://pannellum.org/images/alma.jpg' " +
                    "WHERE panorama_image_url LIKE '%Stonehenge_360_degree_panorama.jpg%'");

            // 6. Fix Payments table (Ensure all columns exist)
            System.out.println("Checking for missing columns in payments table...");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(19, 2)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(19, 2)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR'");

            System.out.println("Schema Fixer completed successfully.");
        } catch (Exception e) {
            System.err.println("Schema Fixer encountered an error (might be already fixed): " + e.getMessage());
            // Consume error to allow startup
        }
    }
}
