const fs = require('fs');
const http = require('http');

const HOSTNAME = '127.0.0.1';
const PORT = 3000;

const server = http.createServer();

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

server.on('request', (req, res) => {
  const { headers, method, url } = req;

  const reqUrlArr = url.split('?');
  const reqQuery = reqUrlArr[1];
  let reqQueryObj = null;
  if (reqQuery) {
    reqQueryObj = parseEqArrToJson(reqQuery);
    console.log('reqQueryObj: ', reqQueryObj);
  }

  let storedData = '';
  let body = null;

  if (method === 'GET') {
    storedData = fs.readFileSync('./counter.txt', {
      encoding: 'utf-8',
    });
    console.log('data: ', storedData);
    if (reqQueryObj) {
      body = JSON.parse(storedData).filter(v => v.name === reqQueryObj.name)[0];
    } else {
      body = null;
    }
  }

  res.on('error', (err) => {
      console.error(err);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  const responseBody = { headers, method, url, body };
  console.log('responseBody: ', responseBody);
  res.end(JSON.stringify(responseBody));
})

function parseEqArrToJson(eqArr) {
  console.log('eqArr: ', eqArr);
  const obj = {};
  const arr = eqArr.split('&');
  arr.forEach(q => {
    const sp = q.split('=');
    obj[sp[0]] = sp[0] == 'count' ? +sp[1] : sp[1];
  });
  return obj;
}