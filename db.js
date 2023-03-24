const HOSTNAME = '127.0.0.1';
const MYSQL_USER = 'dbadmin';
const MYSQL_PASSWORD = 'sqladmin';
const DATABASE = 'webdevintro';

let mySql = null;
let db = null;

function connectDB() {
  mySql = require('mysql');
  db = mySql.createConnection({
    host: HOSTNAME,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: DATABASE,
  });

  db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected!");
  })
}

async function runQuery(query) {
  return new Promise((resolve, reject) => {
    db.query(
      query,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    )
  })
}

async function getCntOfUserFromDB(userName) {
  const query = `SELECT * FROM user_count WHERE user_name = '${userName}'`;
  return await runQuery(query);
}

async function storeCntOfUserIntoDB(name, count) {
  const query = `INSERT INTO user_count (user_name, count) VALUES ('${name}', ${count}) ON DUPLICATE KEY UPDATE count=${count};`;
  const res = await runQuery(query);
  if (res) return res.affectedRows;
}

module.exports = {
  connectDB,
  getCntOfUserFromDB,
  storeCntOfUserIntoDB,
};
