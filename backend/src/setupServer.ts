import {Application, json, urlencoded} from 'express'
import http from 'http' //没有从http中解构出httpServer的原因：当设置socket,socketIO还有一个方法名为server会发生冲突
import cors from 'cors'
import hpp from 'hpp'
import helmet from 'helmet'
import compression from 'compression'
import cookieSession from 'cookie-session'
import 'express-async-errors'
import {config} from "./config";
import {Server} from  'socket.io'
import {createClient} from 'redis'
import {createAdapter} from '@socket.io/redis-adapter'
const SERVER_PORT = 5000

export class ChattyServer {
    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public start(): void {
        this.securityMiddleware(this.app)
        this.standardMiddleware(this.app)
        this.routeMiddleware(this.app)
        this.globalErrorHandler(this.app)
        this.startServer(this.app)
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
                maxAge: 24 * 7 * 60 * 60 * 1000,
                secure: config.NODE_ENV !== 'development'
            })
        )

        app.use(hpp())
        app.use(helmet())
        app.use(cors(
            {
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['POST', 'PUT', 'DELETE', 'GET', 'OPTIONS']
            }
        ))

    }

    private standardMiddleware(app: Application): void {
        app.use(compression())

        app.use(json({
            limit: '50mb'
        }))
        app.use(urlencoded({
            extended:true
        }))

    }

    private routeMiddleware(app: Application): void {
    }

    private globalErrorHandler(app: Application): void {
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer:http.Server = new http.Server(app)
            const socketIO:Server = await this.createSocketID(httpServer)
            this.startHTTPServer(httpServer)
            this.socketIOConnection(socketIO)
        } catch (error) {
            console.log(error)
        }
    }

    private async createSocketID(httpServer: http.Server): Promise<Server> {
        const io:Server = new Server(httpServer,{
            cors : {
                origin:config.CLIENT_URL,
                methods:['GET','PUT','DELETE','POST','OPTIONS']
            }
        })
        const pubClient = createClient({url:config.REDIS_HOST})
        const subClient = pubClient.duplicate()
        await Promise.all([pubClient.connect(),subClient.connect()])
        io.adapter(createAdapter(pubClient,subClient))
        return io
    }

    private startHTTPServer(httpServer: http.Server): void {
        console.log(`Server start process:${process.pid}`)
        httpServer.listen(SERVER_PORT,() => {
            console.log(SERVER_PORT)
        })
    }

    private socketIOConnection(io:Server):void {

    }

}
