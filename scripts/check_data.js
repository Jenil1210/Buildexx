
import sql from '../api/db.js';

async function checkData() {
    try {
        const users = await sql`SELECT count(*) FROM users`;
        const properties = await sql`SELECT count(*), status FROM properties GROUP BY status`;
        const allProps = await sql`SELECT id, title, status FROM properties`;

        console.log('--- Database Status ---');
        console.log(`Users count: ${users[0].count}`);
        console.log('Properties distribution:');
        if (properties.length === 0) {
            console.log('  (No properties found)');
        } else {
            properties.forEach(row => {
                console.log(`  - Status '${row.status}': ${row.count}`);
            });
        }

        console.log('\nList of Properties:');
        allProps.forEach(p => {
            console.log(`  ID: ${p.id} | Title: ${p.title} | Status: ${p.status}`);
        });

    } catch (error) {
        console.error('Error querying database:', error);
    }
}

checkData();
