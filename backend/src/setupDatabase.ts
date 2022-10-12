import mongoose from "mongoose";
import Logger from "bunyan";
import {config} from '@root/config';

export default () => {
    const log: Logger = config.createLogger('setupDataBase')

    const connect = () => mongoose.connect(config.DATABASE_URL)
        .then(() => {
            log.info('successfully connect to mongodb')
        })
        .catch(() => {
            log.error('something wrong with the mongodb')
            return process.exit(1)
        })
    connect()
    //如果断开连接会重写请求重新连接
    mongoose.connection.on('disconnected',connect)
}
