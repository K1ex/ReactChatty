import {Application, json, NextFunction, urlencoded} from 'express'
import http from 'http' //没有从http中解构出httpServer的原因：当设置socket,socketIO还有一个方法名为server会发生冲突
import cors from 'cors'
import hpp from 'hpp'
import helmet from 'helmet'
import compression from 'compression'
import cookieSession from 'cookie-session'
import 'express-async-errors'
import {Server} from 'socket.io'
import {createClient} from 'redis'
import {createAdapter} from '@socket.io/redis-adapter'
import applicationRoutes from '@root/route'
import HTTP_STATUS from "http-status-codes";
import Logger from 'bunyan'
import {CustomError, IErrorResponse} from '@global/helpers/error-handler';
import {config} from '@root/config';

const SERVER_PORT = 5000
const log:Logger = config.createLogger('server')
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
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

    private routeMiddleware(app: Application): void {
        applicationRoutes(app)
    }

  private globalErrorHandler(app: Application): void {
    // @ts-ignore
    app.all('*', (req: Request, res: Response) => {
      // @ts-ignore
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    // @ts-ignore
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        // @ts-ignore
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer:http.Server = new http.Server(app)
            const socketIO:Server = await this.createSocketID(httpServer)
            this.startHTTPServer(httpServer)
            this.socketIOConnection(socketIO)
        } catch (error) {
            log.error(error)
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
        log.info(`Server start with process:${process.pid}`)
        httpServer.listen(SERVER_PORT,() => {
            log.info('Server start at port: '+SERVER_PORT)
        })
    }

    private socketIOConnection(io:Server):void {
      log.info('socketIOConnections')
    }

}
