import * as express from 'express';
// eslint-disable-next-line no-unused-vars
import { createServer, Server } from 'http';
import * as socketIO from 'socket.io';
import { get_private_ip } from 'network';

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

    this.app.get('/localIp', async (request, response) => {
      const ip = await WebServer.getLocalIpAddress();
      if (ip) response.send(`http://${ip}`);
      else response.status(404).send('Local IP not found');
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

  private static getLocalIpAddress(): Promise<string | undefined> {
    return new Promise((resolve) => {
      get_private_ip((error, ip) => {
        if (error) resolve(undefined);
        else resolve(ip as string);
      });
    });
  }
}
