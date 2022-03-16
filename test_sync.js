const mysql = require('mysql');

// 创建数据池
/*
const pool  = mysql.createPool({
    host     : '127.0.0.1',   // 数据库地址
    user     : 'btca',    // 数据库用户
    password : '1234qwer',   // 数据库密码
    database : 'btca'  // 选中数据库
  });
*/

const conn = mysql.createConnection({
    host     : '127.0.0.1',   // 数据库地址
    user     : 'btca',    // 数据库用户
    password : '1234qwer',   // 数据库密码
    database : 'btca'  // 选中数据库
});

conn.connect();

function query( sql, values ) {
    // 返回一个 Promise
    return new Promise(( resolve, reject ) => {
        /*
      pool.getConnection(function(err, connection) {
        if (err) {
          reject( err )
        } else {
          connection.query(sql, values, ( err, rows) => {
  
            if ( err ) {
              reject( err )
            } else {
              resolve( 'rows' )
            }
            // 结束会话
            connection.release()
            
          })
        }
      })*/
      conn.query(sql,  (error, results, fields) => {
        resolve(results);
        reject(error);
        //if (error) throw error
        // connected!
      });
    })
}

async function test()
{
    let rows = await query('select id,data from Tx limit 1');
    let json = JSON.stringify(rows);
    console.log(json);
    //pool.end();
    conn.end();
}
test();

