#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
url = "http://127.0.0.1:1234/createtransaction"


#Address = '1549pyzf8dhx7r4x40k5j80f12btkpqfprjp134bcgcrjn963nzsx57xb'
#PubKey = 'f3afc3a42a31836c9111acc4f65d3bf512e10124cb04a4137c7a6ce87d6f1329'
#Secret = '141a6728ded4f83f767ea770e3582be497c5088fcc3b9ca248751887534f5197'

#Address = 1d3x7mhq2h0cx027g4qvvt69szcj406g9ybdpkkaad50t3290fe76eqny
#pubkey = 8e7b2089a141694acd69dbf2091a4024fb3919bdf725f008d01988e2467afa68
#Secret = fd0d93cfd8712f0b39165b6fcd854851ca6060e47480439861f0df3d66d074ae


#61bfed8b076154cda82a39143426285929f4ce16929ac8fa2fbcbfa3ef7b8907

transaction = {
            "txid" : "61bfed8b076154cda82a39143426285929f4ce16929ac8fa2fbcbfa3ef7b8907",
            "version" : 1,
            "type" : "token",
            "time" : 1639968139,
            "nonce" : 1,
            "from" : "1549pyzf8dhx7r4x40k5j80f12btkpqfprjp134bcgcrjn963nzsx57xb",
            "to" : "1d3x7mhq2h0cx027g4qvvt69szcj406g9ybdpkkaad50t3290fe76eqny",
            "amount" : "100.0000000000",
            "gaslimit" : 10000,
            "gasprice" : "0.0000010000",
            "gasused" : 10000,
            "txfee" : "0.0100000000",
            "data" : "",
            "sig" : "7a01c933b1fc058b7aafc0524cf58d5c768f75e25518ba9144300658755e6078b14c69260cfa27832c9aae81c5e22653341013ebda23900ef1525afa34164f04",
            "fork" : "000000005ca59758a6a09be1d0cc8ed77b2dcb27a7ee3e47fccf6e5e29c079e6",
            "height" : 24,
            "blockhash" : "000000180a7651573eb60ffb47aadafb0d5ebd473ae8c22fe720ba235d02d961",
            "confirmations" : 2,
            "serialization" : "010000008bedbf61e679c0295e6ecffc473eeea727cb2d7bd78eccd0e19ba0a65897a55c0000000001000000000000000129136f7de86c7a7c13a404cb2401e112f53b5df6c4ac11916c83312aa4c3aff30168fa7a46e28819d008f025f7bd1939fb24401a09f2db69cd4a6941a189207b8e0010a5d4e80000000000000000000000000000000000000000000000000000001027000000000000000000000000000000000000000000000000000000000000102700000000000000000000000000000000000000000000000000000000000000407a01c933b1fc058b7aafc0524cf58d5c768f75e25518ba9144300658755e6078b14c69260cfa27832c9aae81c5e22653341013ebda23900ef1525afa34164f04"
       
    }

response = requests.post(url,json=transaction)

obj = json.loads(response.text)
assert(obj["tx_hex"] == transaction["serialization"][:len(obj["tx_hex"])])