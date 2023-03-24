const fs = require('fs');
const http = require('http');

/**
 * Import functions from db interface
 */
// const {
//   connectDB,
//   getCntOfUserFromDB,
//   storeCntOfUserIntoDB,
// } = require('./db');

/**
 * Connect to MySQL before use it
 */
// connectDB();

// const HOSTNAME = '127.0.0.1';
const HOSTNAME = '192.168.178.63';
const PORT = 3000;

const server = http.createServer((req, res) => {
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

server.on('request', (req, res) => {
  const { headers, method, url } = req;

  const reqUrlArr = url.split('?');
  const reqPath = reqUrlArr[0];
  const reqQuery = reqUrlArr[1];
  let reqQueryObj = null;
  let name = '';
  let count = 0;
  if (reqQuery) {
    reqQueryObj = parseEqArrToJson(reqQuery);
    name = reqQueryObj.name;
    count = reqQueryObj.count;
  }

  let body = null;

  if (method === 'GET') {
    if (reqPath === '/index' || reqPath === '/') {
      fs.readFile('./index.html', (err, html) => {
        if (err) throw err;
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();
      })
    }

    if (reqPath === '/counter' && name) {
      getCnt(name).then((data) => {
        body = data;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = { headers, method, url, body };
        res.end(JSON.stringify(responseBody));
      });
    }
  }

  if (method === 'PATCH') {
    if (reqPath === '/counter' && name) {
      updateCnt(name, count).then((data) => {
        body = data;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = { headers, method, url, body };
        res.end(JSON.stringify(responseBody));
      });
    }
  }

  process.on('uncaughtException', function (err) {
    res.statusCode = 500;
    body = err;
    const responseBody = { headers, method, url, body };
    res.end(JSON.stringify(responseBody));
  })
})

async function getCnt(name) {
  return getCntOfUserFromFile(name);
  /**
   * Get count from DB
   */
  // const res = await getCntOfUserFromDB(name);
  // if (res && res.length) return res[0];
  // else return 0;
}

/**
 * If name exists already, updte its count,
 * if not, insert a new one
 * @param {string} name 
 * @param {number} cnt 
 * @returns 
 */
async function updateCnt(name, cnt) {
  return storeCntOfUserIntoFile(name, cnt);
  /**
   * Updte count in DB
   */
  // const res = await storeCntOfUserIntoDB(name, cnt);
  // if (res) return res;
  // throw new Error('update count in DB failed');
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
