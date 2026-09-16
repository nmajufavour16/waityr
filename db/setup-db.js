const fs = require('fs');
const { Client } = require('pg');

async function runSchema() {
  // Use the connection string from the environment
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  // Strip sslmode=require from the URL so it doesn't override our custom SSL settings
  const cleanConnectionString = connectionString.replace('?sslmode=require', '');

  const client = new Client({
    connectionString: cleanConnectionString,
    ssl: { rejectUnauthorized: false } // Required for Aiven/Neon connections
  });

  try {
    console.log('Connecting to remote database...');
    await client.connect();

    console.log('Reading schema.sql...');
    const schema = fs.readFileSync('schema.sql', 'utf8');

    console.log('Executing schema...');
    await client.query(schema);

    console.log('✅ Success! Tables have been created on the remote database.');
  } catch (err) {
    console.error('❌ Failed to run migrations:', err);
  } finally {
    await client.end();
  }
}

runSchema();
