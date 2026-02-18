
import dotenv from 'dotenv';
dotenv.config();

async function resetSchema() {
    console.log('Resetting database schema to align with Node.js backend...');

    try {
        const { default: sql } = await import('../api/db.js');

        // Drop tables that are incompatible or need recreation
        await sql`DROP TABLE IF EXISTS enquiries CASCADE`;
        await sql`DROP TABLE IF EXISTS rent_requests CASCADE`;
        await sql`DROP TABLE IF EXISTS property_amenities CASCADE`;
        await sql`DROP TABLE IF EXISTS property_images CASCADE`;
        await sql`DROP TABLE IF EXISTS properties CASCADE`;
        await sql`DROP TABLE IF EXISTS wishlist CASCADE`;
        await sql`DROP TABLE IF EXISTS complaints CASCADE`;

        // Optional: Drop builders if it exists from old schema (users table handles builders now)
        await sql`DROP TABLE IF EXISTS builders CASCADE`;

        console.log('Old tables dropped successfully.');
        console.log('Please restart the server (npm run server) to re-initialize the tables with the correct schema.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting schema:', error);
        process.exit(1);
    }
}

resetSchema();
