// scripts/init-db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  TIDB_HOST,
  TIDB_USER,
  TIDB_PASSWORD,
  TIDB_DATABASE
} = process.env;

async function initDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    const connection = await mysql.createConnection({
      host: TIDB_HOST,
      user: TIDB_USER,
      password: TIDB_PASSWORD,
      database: TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log('✅ Connected to database');

    // Create events table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        user_login VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_created_at DATETIME NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        language VARCHAR(50),
        additions INT DEFAULT 0,
        deletions INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_date (user_login, event_created_at),
        INDEX idx_repo (repo_name),
        INDEX idx_language (language)
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Events table created/verified');

    // Verify table structure
    const [columns] = await connection.query('DESCRIBE events');
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    await connection.end();
    console.log('\n✨ Database initialization complete!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initDatabase();
