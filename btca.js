const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const request = require('request')
const lib = require('./lib.js')

const app = express();
const url = 'http://127.0.0.1:9904';
//const url = "http://159.138.123.135:9904"
const conn = mysql.createConnection({
  host: '127.0.0.1',
  //host: '159.138.123.135',
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
  console.log("createtransaction:",type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  const ret = lib.GetTx(type,time,lockuntil,anchor,vin,sendto,amount,txfee,data);
  res.json(ret);
});

app.get('/releationByUpper/:upper', function(req, res, next) {
  console.log("releationByUpper:",req.params.upper);
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
  console.log("releationByLower:",req.params.lower);
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


app.get('/listunspent/:fork/:addr', function(req, res, next) {
  console.log("listunspent:",req.params.fork,req.params.addr);
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':1,'method':'listunspent','jsonrpc':'2.0','params':{'fork':req.params.fork,'address': req.params.addr,'max':0 }}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);    
      }
    });
});

app.get('/sendrawtransaction/:hex', function(req, res, next) {
  console.log("sendrawtransaction:",req.params.hex);
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':3,'method':'sendrawtransaction','jsonrpc':'2.0','params':{'txdata': req.params.hex}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);     
      }
    });
});

app.get('/listfork', function(req, res, next) {
  console.log("listfork.");
  request(
    {
      url: url,
      method: 'POST',
      json: true,
      body:{'id':3,'method':'listfork','jsonrpc':'2.0','params':{}}
    },
    function(error, response, body) {
      if (body.error) {
        res.json(body.error);
      } else {
        res.json(body.result);     
      }
    });
});

app.get('/transctions/:addr', function(req, res, next) {
  console.log("transctions.",req.params.addr);
  let sql = `select t.txid, t.block_hash, t.form as \`from\`, t.\`to\`, format(t.amount,4) as amount,
  format(t.free,4) as fee,
  (case when t.form =? and left(t.\`to\`,4)<>'20w0' then 2  
        when t.\`to\` =? and left(t.form,4)<>'20w0' then 4 end) as flag,
b.height,FROM_UNIXTIME(b.time,'%m-%d %H:%i:%s') as time
from Tx t join Block b on b.\`hash\` = t.block_hash
where (\`to\`=? or form=?) order by t.id desc limit 10`
  let params = [req.params.addr,req.params.addr,req.params.addr,req.params.addr];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  });
});

app.get('/Info',function(req,res,next) {
  let sql='select max_coin_number,current_coin_numner,wallet_number,max_coin_count from Info limit 1';
  conn.query(sql,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  })
});

app.get('/Rank',function(req,res,next) {
  let sql='select yield,balance,ranking from Rank';
  conn.query(sql,function(err,result) {
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  })
});


app.get('/BlockList/:page/:showNumber/:date',function(req,res,next) {
  let startNumber=(Number(req.params.page)-1) * Number(req.params.showNumber);
  let endNumber =startNumber  + Number(req.params.showNumber);
  let sql ="select id,height, reward_address,reward_money, FROM_UNIXTIME(time,'%Y-%m-%d %H:%i:%s') as time,hash, type from Block   where date(FROM_UNIXTIME(time)) = ? order by id desc limit ? , ?";
  let params =[req.params.date, startNumber , Number(req.params.showNumber)];
  conn.query(sql,params,function(err,result) {
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    let blockTotal='';
    let countSql='select count(id) as count from Block where date(FROM_UNIXTIME(time)) = ?'; 
    let countParams=[req.params.date];
    conn.query(countSql,countParams,function(err,totalResult){
      if(err){
        return "0";
      }
      let blockString=JSON.stringify(totalResult); 
      let blockTotal = Number(JSON.parse(blockString)[0].count);     
      let remainder =blockTotal % Number(req.params.showNumber);    
      let pageNumber=Math.floor(blockTotal / Number(req.params.showNumber));
      if (remainder >0){
        pageNumber++;
      }
     console.log('blockTotal', blockTotal);
     console.log('pageNumber', pageNumber);
      res.send(JSON.parse('{"blockTotal":'+blockTotal+',"pageNumber":'+pageNumber+',"blockList":'+dataString+'}'));
    })
  })
});

app.get('/BlockStatistics/:year/:month',function(req,res,next){
  let sql ="select  time , count(id) as count , sum(reward_money) as money from "
            +"(select id, FROM_UNIXTIME(time,'%Y-%m-%d') as time , reward_money  from Block "
            +"where year(FROM_UNIXTIME(time)) =? and month(FROM_UNIXTIME(time))=?) a group by time  order by time desc ";
  let params=[req.params.year, req.params.month];
  conn.query(sql,params,function(err,result){
    if(err){
      res.json({'error':err});
      return;
    }
    let dataString =JSON.stringify(result);
    res.send(JSON.parse(dataString));
  })
});
