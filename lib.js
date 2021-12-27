const utils = require('./utils.js');
const bignum = require('bignum');
const blake = require('blakejs');

function GetTx(type,ts,lockuntil,anchor,vin,sendto,amount,txfee,data) {
    const nVersion = Buffer.allocUnsafe(2);
    nVersion.writeUInt16LE(1);

    const nType = Buffer.allocUnsafe(2);
    if (type == "token") {
        nType.writeUInt16LE(0);
    } else  if (type == "defi-relation") {
        nType.writeUInt16LE(2);
    }

    const nTimeStamp = Buffer.allocUnsafe(4);
    nTimeStamp.writeUInt32LE(ts);


    const nLockUntil = Buffer.allocUnsafe(4);
    nLockUntil.writeUInt32LE(lockuntil);

    const hashAnchor = Buffer.from(anchor,'hex');
    hashAnchor.reverse();


    const input_size = Buffer.allocUnsafe(1);
    input_size.writeUInt8(vin.length);
    let vin_data = Buffer.concat([input_size]);
    for (let i = 0; i < vin.length; i++) {
        let txid = Buffer.from(vin[i].txid,'hex');
        txid.reverse();
        const vout = Buffer.allocUnsafe(1);
        vout.writeUInt8(vin[i].vout);
        vin_data = Buffer.concat([vin_data,txid,vout]);
    }
    const to = utils.Addr2Hex(sendto);


    const nAmount = Buffer.allocUnsafe(8);
    nAmount.writeBigInt64LE(BigInt(amount *  1000000));

    
    const nTxfee = Buffer.allocUnsafe(8);
    nTxfee.writeBigInt64LE(BigInt(txfee *  1000000));

    const hex_data = Buffer.from(data,'hex');

    const tx_data = Buffer.concat([nVersion,nType,nTimeStamp,nLockUntil,hashAnchor,vin_data,to,nAmount,nTxfee,hex_data]);

    const sigh_hash = blake.blake2b(tx_data,null,32);
    sigh_hash.reverse();
    return {"tx_hash" : Buffer.concat([sigh_hash]).toString('hex'),
            "tx_hex" : tx_data.toString('hex')};

}

module.exports = {
    GetTx: GetTx
};