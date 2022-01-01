const utils = require('./utils.js');
const bignum = require('bignum');
const blake = require('blakejs');

function LenHex(n) {
	if (n < 0xFD) {
		return Buffer.from([n]);
	} else if (n <= 0xFFFF) {
		const buf_n = Buffer.allocUnsafe(2);
    	buf_n.writeUInt16LE(n);
		return Buffer.from([0xfd,buf_n[0],buf_n[1]]);
	} else if (n <= 0xFFFFFFFF) {
		const buf_n = Buffer.allocUnsafe(4);
    	buf_n.writeUInt32LE(n);
		return Buffer.concat([new Uint8Array([0xfe]),buf_n]);
	} else {
		const buf_n = Buffer.allocUnsafe(8);
    	buf_n.writeBigUInt64LE(BigInt(n));
		return Buffer.concat([new Uint8Array([0xff]),buf_n]);
	}
}


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
        vout.writeUInt8(vin[i].out);
        vin_data = Buffer.concat([vin_data,txid,vout]);
    }
    const to = utils.Addr2Hex(sendto);


    const nAmount = Buffer.allocUnsafe(8);
    nAmount.writeBigInt64LE(BigInt(amount *  1000000));

    
    const nTxfee = Buffer.allocUnsafe(8);
    nTxfee.writeBigInt64LE(BigInt(txfee *  1000000));

    const vchdata = Buffer.from(data,'hex');

    const vchdata_n = LenHex(vchdata.length);

    const tx_data = Buffer.concat([nVersion,nType,nTimeStamp,nLockUntil,hashAnchor,vin_data,to,nAmount,nTxfee,vchdata_n, vchdata]);

    const sigh_hash = blake.blake2b(tx_data,null,32);
    
    sigh_hash.reverse();
    return {"tx_hash" : Buffer.concat([sigh_hash]).toString('hex'),
            "tx_hex" : tx_data.toString('hex')};

}

module.exports = {
    GetTx: GetTx
};