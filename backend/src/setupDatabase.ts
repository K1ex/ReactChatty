import mongoose from "mongoose";
import {config} from "./config";

export default () => {
    const connect = () => mongoose.connect(config.DATABASE_URL)
        .then(() => {
            console.log('successfully connect to mongodb')
        })
        .catch(() => {
            console.log('something wrong with the mongodb')
            return process.exit(1)
        })
    connect()
    //如果断开连接会重写请求重新连接
    mongoose.connection.on('disconnected',connect)
}
