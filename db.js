const mysql = require("mysql2/promise");
 
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
 
    //  Usa a variável de ambiente DB_SSL_CA em vez do arquivo ca.pem
    ssl: process.env.DB_SSL_CA ? {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA
    } : {
        rejectUnauthorized: false // fallback para desenvolvimento local
    },
 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
 
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Conectado ao banco de dados Aiven MySQL");
        conn.release();
    } catch (err) {
        console.error("Erro ao conectar ao banco:", err);
        process.exit(1);
    }
})();
 
module.exports = pool;