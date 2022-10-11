import express,{Express} from 'express'
import {ChattyServer} from "./setupServer";
import databaseConntection from './setupDatabase'
import {config} from "./config";

/**
 * @name entryPoint to this application
 * */
class Application {
    public initialize():void {
        this.loadConfig()
        databaseConntection()
        const app:Express = express();
        const server:ChattyServer = new ChattyServer(app)
        server.start()
    }

    private loadConfig():void {
        config.validateConfig()
    }
}

const application: Application = new Application()
application.initialize()
