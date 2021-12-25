
const lib = require('./lib.js')

let transaction = {
        "txid" : "61c0565fc9007d4447261aaf8351eecce9ad676df2db15450d31e23c6fa983ab",
        "version" : 1,
        "type" : "token",
        "time" : 1639994975,
        "nonce" : 2,
        "from" : "1549pyzf8dhx7r4x40k5j80f12btkpqfprjp134bcgcrjn963nzsx57xb",
        "to" : "20w03ktww07hhdk88f4mjsq2z1a27cctwra9sx0dstbz0acn49q2asbm0",
        "amount" : "10.0000000000",
        "gaslimit" : 13700,
        "gasprice" : "0.0000010000",
        "gasused" : 13700,
        "txfee" : "0.0137000000",
        "data" : "0101014602050014005685b4acf185589b70267490415ca10ba993705338afcc4a6bd6e93b0191ba8db6735d7ae45f92841eaaa588a23f1a3be785076fd737ec1911bbd8e75700000000",
        "sig" : "c3ecfd3e88c66d806f9137cee67828e3b6c857eaddda15735eec8fabff3f5da3ceb240739a5d4eaff2a7b62523c12c6d1f6cc8f2b7fad4b03dda275ec84f5302",
        "fork" : "000000005ca59758a6a09be1d0cc8ed77b2dcb27a7ee3e47fccf6e5e29c079e6",
        "height" : 2274,
        "blockhash" : "000008e20ad5361998f53e2625ce620c1b8e649c666efd6cce928ff351a00b37",
        "confirmations" : 180,
        "serialization" : "010000005f56c061e679c0295e6ecffc473eeea727cb2d7bd78eccd0e19ba0a65897a55c0000000002000000000000000129136f7de86c7a7c13a404cb2401e112f53b5df6c4ac11916c83312aa4c3aff302070039eb9c01e316cd0879292cdc5f0a8476335cc2939e81b9d2fe0532a44dc400e8764817000000000000000000000000000000000000000000000000000000102700000000000000000000000000000000000000000000000000000000000084350000000000000000000000000000000000000000000000000000000000000101014602050014005685b4acf185589b70267490415ca10ba993705338afcc4a6bd6e93b0191ba8db6735d7ae45f92841eaaa588a23f1a3be785076fd737ec1911bbd8e7570000000040c3ecfd3e88c66d806f9137cee67828e3b6c857eaddda15735eec8fabff3f5da3ceb240739a5d4eaff2a7b62523c12c6d1f6cc8f2b7fad4b03dda275ec84f5302"
    }


let hex_ = "070002050014005685b4acf185589b70267490415ca10ba993705338afcc4a6bd6e93b0191ba8db6735d7ae45f92841eaaa588a23f1a3be785076fd737ec1911bbd8e75700000000";
let delegate = "20m01802pgptaswc5b2dq09kmj10ns88bn69q0msrnz64mtypx4xm5sff";
let owner = "1j6x8vdkkbnxe8qwjggfan9c8m8zhmez7gm3pznsqxgch3eyrwxby8eda";
let rewardmode = 0;
ret = lib.GetVote(delegate,owner,rewardmode);

let ts = transaction.time;
let fork = transaction.fork;
let nonce = transaction.nonce;
let from = transaction.from;
let to = ret.address;
let amount = transaction.amount;
let gasPrice = transaction.gasprice;
let gasLimit = transaction.gaslimit;
let ret1 = lib.GetTx(ts,fork,nonce,from,to,amount,gasPrice,gasLimit,ret.hex);

if (ret1.tx_hex == transaction.serialization.substring(0,ret1.tx_hex.length)) {
    console.log("OK");
} else {
    console.log("err");
}
