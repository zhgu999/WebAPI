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


app.post('/createtransaction', function(req, res, next) {

  const type = req.body.type;
  const time = req.body.time;
  const lockuntil = req.body.lockuntil;
  const anchor = req.body.anchor;
  const vin = req.body.vin;
  const sendto = req.body.sendto;
  const amount = req.body.amount;
  const txfee = req.body.txfee;
  const data = req.body.data;

  const ret = lib.GetTx(type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  res.json(ret);
});

app.get('/releationByUpper/:upper', function(req, res, next) {
  let sql = 'select * from Relation where upper =?';
  let params = [req.params.upper];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/releationByLower/:lower', function(req, res, next) {
  let sql = 'select * from Relation where lower =?';
  let params = [req.params.lower];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

let server = app.listen(9906, function() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('http://%s:%s', host, port);
});