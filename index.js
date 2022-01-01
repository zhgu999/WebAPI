const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const request = require('request')
const lib = require('./lib.js')


const app = express();
const url = 'http://127.0.0.1:9904';
const conn = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'btca',
  password: '1234qwer',
  database: 'btca'
});

conn.connect();

app.use(express.static(__dirname + '/static', {index: 'help.html'}));
app.use(bodyParser.json());

app.get('/newblock/', function(req, res, next) {
  let sql = 'select * from Block where is_useful = 1 order by id desc limit 20';
  let params = [];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/newtx/', function(req, res, next) {
  let sql = 'select * from Tx order by id desc limit 20';
  let params = [];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/block/:hash', function(req, res, next) {
  let sql = 'select * from Block where hash = ?';
  if (req.params.hash.length < 64) {
    sql = 'select * from Block where is_useful = 1 and  height = ?';
  }
  let params = [req.params.hash];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

function check_mn(m,n){
  let regPos = /^\d+$/;
  if (regPos.test(m) && regPos.test(n)) {
    if (n - m <= 20) {
      return true;
    } 
  }
  return false;
}

app.get('/blocks/:m/:n', function(req, res, next) {
  if (check_mn(req.params.n,req.params.m) == false){
    res.json({'error': 'm n parameter error.'});
    return;
  }
  let sql =
      'select * from Block where is_useful = 1 and height between ? and ?';
  let params = [req.params.m, req.params.n];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/tx/:txid', function(req, res, next) {
  let sql = 'select * from Tx where txid = ?';
  let params = [req.params.txid];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/blocktx/:hash', function(req, res, next) {
  let sql = 'select * from Tx where block_hash = ?';
  let params = [req.params.hash];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/rankstat/:m/:n', function(req, res, next) {
  if (check_mn(req.params.n,req.params.m) == false){
    res.json({'error': 'm n parameter error.'});
    return;
  }
  let sql = 'select * from rankstat order by id asc limit ' + req.params.m +
      ',' + req.params.n;
  let params = [];
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/blockchain', function(req, res, next) {
  request(
      {
        url: url,
        method: 'POST',
        json: true,
        body: [
          {'id': 1, 'method': 'getforkheight', 'jsonrpc': '2.0', 'params': {}},
          {'id': 2, 'method': 'listdelegate', 'jsonrpc': '2.0', 'params': {}}
        ]
      },
      function(error, response, body) {
        if (error) {
          res.json({'error': error});
          return;
        }
        let vote = 0;
        for (let i = 0; i < body[1].result.length; i++) {
          vote += Number(body[1].result[i].votes);
        }
        res.json({
          'height': body[0].result,
          'total': 200000000 + lib.Total(body[0].result),
          'pledge': vote
        });
      });
});

app.get('/listdelegate', function(req, res, next) {
  request(
      {
        url: url,
        method: 'POST',
        json: true,
        body:
            {'id': 1, 'method': 'listdelegate', 'jsonrpc': '2.0', 'params': {}}
      },
      function(error, response, body) {
        for (let i = 0; i < body.result.length; i++){
          body.result[i].name = 'node' + i;
        }
        res.json(body.result);
      });
});

app.get('/address/:addr', function(req, res, next) {
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:
          {'id': 1, 'method': 'getbalance', 'jsonrpc': '2.0', 'params': {'address':req.params.addr}}
    },
    function(error, response, body) {
      res.json(body.result);
    });
});

app.get('/txlist/:t/:addr/:m/:n', function(req, res, next) {
  if (check_mn(req.params.n,req.params.m) == false){
    res.json({'error': 'm n parameter error.'});
    return;
  }
  let sql;
  let params;
  if (req.params.t == '1') {
    sql = 'select * from Tx where `to` = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '2') {
    sql = 'select * from Tx where `from` = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '3') {
    sql = 'select * from Tx where `to` = ? or `from` = ?  limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr,req.params.addr];
  } else if (req.params.t == '4') {
    sql = 'select * from Tx where client_in = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '5') {
    sql = 'select * from Tx where client_out = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '6') {
    sql = 'select * from Tx where client_in = ? or client_out = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr,req.params.addr];
  } else if (req.params.t == '7') {
    sql = 'select * from Tx where dpos_in = ? limit ' + req.params.m +
      ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '8') {
    sql = 'select * from Tx where dpos_out = ? limit ' + req.params.m +
    ',' + req.params.n;
    params = [req.params.addr];
  } else if (req.params.t == '9') {
    sql = 'select * from Tx where dpos_in = ? or dpos_out = ? limit ' + req.params.m +
    ',' + req.params.n;
    params = [req.params.addr,req.params.addr];
  } else {
    res.json({'error': 'type parameter error'});
  }
  conn.query(sql, params, function(err, result) {
    if (err) {
      res.json({'error': err});
      return;
    }
    let dataString = JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/sendtransaction/:hex', function(req, res, next) {
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:
          {'id': 1, 'method': 'sendtransaction', 'jsonrpc': '2.0', 'params': {'txdata':req.params.hex}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);
      }
    });
});

app.get('/makekeypair', function(req, res, next) {
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:
          {'id': 1, 'method': 'makekeypair', 'jsonrpc': '2.0', 'params': {}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);
      }
    });
});

app.get('/getpubkeyaddress/:pub', function(req, res, next) {
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:
          {'id': 1, 'method': 'getpubkeyaddress', 'jsonrpc': '2.0', 'params': {'pubkey':req.params.pub}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);
      }
    });
});

app.post('/createtransaction', function(req, res, next) {
  let ts = req.body.time;
  let fork = req.body.fork;
  let nonce = req.body.nonce;
  let from = req.body.from;
  let to = req.body.to;
  let amount = req.body.amount;
  let gasPrice = req.body.gasprice;
  let gasLimit = req.body.gaslimit;
  let data = req.body.data;
  let ret = lib.GetTx(ts,fork,nonce,from,to,amount,gasPrice,gasLimit,data);
  res.json(ret);
});

app.get('/getvotetemplateaddr/:delegate/:owner/:rewardmode', function(req, res, next) {
  let = ret = lib.GetVote(req.params.delegate,req.params.owner,req.params.rewardmode);
  res.json(ret);
});

let server = app.listen(1234, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
})