const sql = require('mssql');
require('dotenv').config();

const cnx  = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        trustedConnection: false,
        enableArithAbort: true,
        encrypt: false
    }
};

exports.querySQL = async (query) => {
    try {
        let pool = await sql.connect(cnx);
        let result = await pool.request().query(query);
        return result.recordsets[0];
    } catch (error) {
        console.log(error)
    }
}

exports.insertSQL = async (query) => {
    try {
        let pool = await sql.connect(cnx);
        let result = await pool.request().query(query);
        return result;
    } catch (error) {
        console.log(error)
    }
}
