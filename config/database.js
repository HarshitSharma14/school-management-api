import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

const connectionPool = mysql.createPool(databaseConfig);

async function testDatabaseConnection() {
    try {
        console.log('🔄 Connecting to TiDB Cloud...');
        const connection = await connectionPool.getConnection();

        // Test basic connection first
        const [basicTest] = await connection.execute('SELECT 1 as test');
        console.log('✅ Basic connection successful');

        // Test if database exists
        const [databases] = await connection.execute('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === process.env.DB_NAME);

        if (!dbExists) {
            console.log('⚠️  Database does not exist. Creating it...');
            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
            console.log('✅ Database created successfully');
        }

        // Use the database
        await connection.execute(`USE ${process.env.DB_NAME}`);

        // Test if schools table exists
        try {
            const [tables] = await connection.execute('SHOW TABLES');
            const tableExists = tables.some(table =>
                Object.values(table)[0] === 'schools'
            );

            if (!tableExists) {
                console.log('⚠️  Schools table does not exist. Please create it manually in TiDB Console.');
                console.log('💡 Go to TiDB Cloud Console and run the table creation SQL');
                connection.release();
                return false;
            }

            // Test if table has data
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM schools');
            console.log(`📚 Found ${count[0].count} schools in database`);

        } catch (tableError) {
            console.log('⚠️  Schools table does not exist or is inaccessible');
            console.log('💡 Please create the schools table in TiDB Cloud Console');
            connection.release();
            return false;
        }

        console.log('✅ Successfully connected to TiDB Cloud!');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        console.log(`🌐 Host: ${process.env.DB_HOST}`);

        connection.release();
        return true;

    } catch (error) {
        console.error('❌ TiDB Cloud connection failed:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔑 Access denied. Check your username and password in .env file');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🌐 Host not found. Check your DB_HOST in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🚫 Connection refused. Check your DB_HOST and DB_PORT in .env file');
        }

        console.error('💡 Troubleshooting steps:');
        console.error('   1. Check your .env file has correct TiDB Cloud credentials');
        console.error('   2. Verify your TiDB Cloud cluster is running');
        console.error('   3. Create the schools table using TiDB Cloud Console');

        return false;
    }
}

export { connectionPool as pool, testDatabaseConnection as testConnection };