import * as express from 'express';
// eslint-disable-next-line no-unused-vars
import { Server } from 'http';

export default class WebServer {
  web = express();

  port: number = 80;

  server: Server;

  createWebServer(htmlLink: string): void {
    this.web.use(express.static(`${htmlLink}/..`));

    this.web.get('/', (request, response) => {
      response.sendFile(htmlLink);
    });

    this.server = this.web.listen(this.port);
  }

  closeWebServer(): void {
    this.server.close();
  }
}
