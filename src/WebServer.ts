import * as express from 'express';
// eslint-disable-next-line no-unused-vars
import { createServer, Server } from 'http';
import * as socketIO from 'socket.io';

export default class WebServer {
  port: number = 80;

  private app: express.Application;

  private server: Server;

  private io: SocketIO.Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
  }

  createWebServer(remoteHtmlLink: string, remoteIframeLink: string, localHtmlLink: string): void {
    this.io = socketIO(this.server);

    this.app.use(express.static(`${remoteIframeLink}/..`));

    this.app.get('/', (request, response) => {
      response.sendFile(remoteIframeLink);
    });

    this.app.get('/remote', (request, response) => {
      response.sendFile(remoteHtmlLink);
    });

    this.app.get('/localPath', (request, respose) => {
      respose.send(localHtmlLink);
    });

    this.server.listen(this.port);

    this.io.on('connect', (socket: SocketIO.Socket) => {
      socket.on('message', (data) => {
        this.io.emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  closeWebServer(): void {
    this.server.close();
  }
}
