function Load(app,conn) {
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
    
}

module.exports = {
  Load: Load
};