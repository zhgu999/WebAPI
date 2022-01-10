drop table if exists `coinNumber`;
create table `coinNumber`(

`max_coin_number` varchar(255) null,   -- 总发行币数量
`current_coin_numner` varchar(255) null, -- 到现在已经产出多少币
`wallet_number` varchar(255) null , -- 全网钱包数量
`max_coin_count` varchar(255) null  -- 最佳挖矿持币个数
)
-- insert into coinNumber(max_coin_number,current_coin_numner,wallet_number,max_coin_count) values('10','100','1000','1000');