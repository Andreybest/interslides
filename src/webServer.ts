import * as express from 'express';
// eslint-disable-next-line no-unused-vars
import { Server } from 'http';

export default class WebServer {
  web = express();

  port: number = 80;

  server: Server;

  createWebServer(remoteHtmlLink: string, localHtmlLink: string): void {
    this.web.use(express.static(`${remoteHtmlLink}/..`));

    this.web.get('/', (request, response) => {
      response.sendFile(remoteHtmlLink);
    });

    this.web.get('/localPath', (request, respose) => {
      respose.send(localHtmlLink);
    });

    this.server = this.web.listen(this.port);
  }

  closeWebServer(): void {
    this.server.close();
  }
}
