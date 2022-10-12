# Redis

## Redis Data Types

- Strings
- Lists
- Sets
- Hashes:stored user data object
- Sorted Sets

## Function

### List

- LPUSH: 将数据添加到数组的头
- LRANGE: 从数组的头获取数据
- LINDEX: 根据Index获取数据
- LLEN: 获取数组的长度
- LREM: 删除 element
- LSET: 根据下标设置 element
- RPUSH: 尾部添加数据

## Sorted Sets

- ZADD: 添加一个或多个数据
- ZCARD: 获取Set中的数据个数
- ZCOUNT:  命令用于计算有序集合中指定(介于最大和最小)分数区间的成员数量。 集合中最大的成员数为 232 - 1 (4294967295, 每个集合可存储40多亿个成员)。
- ZRANGE: 获取在指定范围内的有序集合中的成员
- ZREM: 删除在指定范围内的有序集合中的成员

## Hashes

- HSET: 设置哈希值
- HEGET: 根据key获取值
- HGETALL: 获取指定key下所有的成员
- HINCRBY: 给指定的key上的值增加指定的数
- HMGET: 获取所有给定字段的值

