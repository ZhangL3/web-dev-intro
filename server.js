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
  console.log('!!!!! method: ', method);
  console.log('!!!!! url: ', url);

  const reqUrlArr = url.split('?');
  const reqQuery = reqUrlArr[1];
  let reqQueryObj = null;
  let name = '';
  let count = 0;
  if (reqQuery) {
    reqQueryObj = parseEqArrToJson(reqQuery);
    console.log('reqQueryObj: ', reqQueryObj);
    name = reqQueryObj.name;
    count = reqQueryObj.count;
  }

  let storedData = '';
  let body = null;

  if (method === 'GET') {
    if (name) {
      body = getCntOfUserFromFile(name);
      getCntOfUserFromDB(name).then((res) => {
        console.log('res: ', res);
      });
    }
  }

  if (method === 'POST') {
    if (name) {
      body = storeCntOfUserIntoFile(name, count);
    }
  }

  res.on('error', (err) => {
      console.error(err);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  const responseBody = { headers, method, url, body };
  res.end(JSON.stringify(responseBody));
})

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

function getCntOfUserFromDB(userName) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM user_count WHERE user_name = ${userName}`,
      (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve(result);
      }
    )
    
  })
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
