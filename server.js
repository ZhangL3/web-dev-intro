const fs = require('fs');
const http = require('http');
const mySql = require('mysql');

const HOSTNAME = '127.0.0.1';
const PORT = 3000;
const MYSQL_USER = 'dbadmin';
const MYSQL_PASSWORD = 'sqladmin';
const DATABASE = 'webdevintro';

const db = mySql.createConnection({
  host: HOSTNAME,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
})

const server = http.createServer();

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

server.on('request', (req, res) => {
  const { headers, method, url } = req;

  const reqUrlArr = url.split('?');
  const reqQuery = reqUrlArr[1];
  let reqQueryObj = null;
  let name = '';
  let count = 0;
  if (reqQuery) {
    reqQueryObj = parseEqArrToJson(reqQuery);
    name = reqQueryObj.name;
    count = reqQueryObj.count;
  }

  let storedData = '';
  let body = null;

  if (method === 'GET') {
    if (name) {
      getCnt(name).then((data) => {
        body = data;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = { headers, method, url, body };
        res.end(JSON.stringify(responseBody));
      });
    }
  }

  if (method === 'POST') {
    if (name) {
      updateCnt(name, count).then((data) => {
        body = data;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = { headers, method, url, body };
        res.end(JSON.stringify(responseBody));
      });
    }
  }

  res.on('error', (err) => {
      console.error(err);
  });

})

async function getCnt(name) {
  // return getCntOfUserFromFile(name);
  const res = await getCntOfUserFromDB(name);
  if (res && res.length) return res[0];
  return null;
}

async function updateCnt(name, cnt) {
  // return storeCntOfUserIntoFile(name, cnt);
  return storeCntOfUserIntoDB(name, cnt);
}

function parseEqArrToJson(eqArr) {
  const obj = {};
  const arr = eqArr.split('&');
  arr.forEach(q => {
    const sp = q.split('=');
    obj[sp[0]] = sp[0] == 'count' ? +sp[1] : sp[1];
  });
  return obj;
}

function getAllCountFromFile() {
  const storedData = fs.readFileSync('./counter.txt', {
    encoding: 'utf-8',
  });
  if (!storedData.length) return null;
  return JSON.parse(storedData);
}

function getCntOfUserFromFile(userName) {
  if (!userName || !userName.length) return null;
  const storedDataArr = getAllCountFromFile();
  return storedDataArr.filter(v => v.name === userName)[0] || null;
}

async function getCntOfUserFromDB(userName) {
  const query = `SELECT * FROM user_count WHERE user_name = '${userName}'`;
  return runQuery(query);
}

function storeCntOfUserIntoFile(name, count) {
    if (!name || !name.length) return null;
    const storedDataArr = getAllCountFromFile();
    const indOfUser = storedDataArr.findIndex(i => i.name === name);
    if (indOfUser < 0) {
      storedDataArr.push({ name, count });
    } else {
      storedDataArr[indOfUser].count = count;
    }
    try {
      fs.writeFileSync('./counter.txt', JSON.stringify(storedDataArr));
      return { name, count };
    } catch (error) {
      console.log('error: ', error);
    }
}

async function storeCntOfUserIntoDB(name, count) {
  const query = `update user_count set count = ${count} where user_name = '${name}';`;
  const res = await runQuery(query);
  if (res) return res.affectedRows;
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