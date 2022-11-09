import {DoneCallback,Job} from "bull";
import Logger from 'bunyan'
import {config} from "@root/config";
import {authService} from "@service/db/auth.service";

//TODO authWorker 日志
const log:Logger = config.createLogger('authWorker')

class AuthWorker {
  async addAuthUserToDB(job:Job,done:DoneCallback):Promise<void> {
    try{
    const {value} = job.data

    //TODO 将数据存到数据库中
    job.progress(100) // progress表示工作的进度
    await authService.createAuthUser(value)
      done(null,job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const authWorker:AuthWorker = new AuthWorker()
