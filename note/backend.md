# lib

```markdown
    "@types/express": "^4.17.14",
    "cookie-session": "^2.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-async-errors": 用来捕获异步方法所产生的异常,调用globalErrorHandler来处理产生的异常
    "helmet": 是express的一个中间件，给请求头添加字段
    "hpp": "^0.2.3",
    "http-status-codes": 状态枚举
    "typescript": "^4.8.4"
```
## p16 3:40
import http from 'http' //没有从http中解构出httpServer的原因：当设置socket,socketIO还有一个方法名为server会发生冲突
