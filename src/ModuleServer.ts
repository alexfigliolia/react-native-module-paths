import http from "http";
import type {
  ServerResponse,
  IncomingMessage,
  Server as HTTPServer,
} from "http";
import { writeFile } from "fs/promises";
import { ChildProcess } from "@figliolia/child-process";
import { Logger } from "./Logger";
import { Options } from "./Options";

export class ModuleServer extends Options {
  private server: HTTPServer | null = null;
  public static readonly HOST = "localhost";

  public start() {
    this.server = this.createModuleServer();
    return this;
  }

  public destroy() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  private createModuleServer() {
    const server = http.createServer(this.handler.bind(this));
    server.listen(this.port, ModuleServer.HOST, () => {
      Logger.info("Listening for Preloaded Module Paths");
      Logger.info(
        `As you make changes to your app, your ${Logger.BLUE(
          "modulePaths",
        )} file will update automatically!`,
      );
    });
    return server;
  }

  private handler(req: IncomingMessage, res: ServerResponse) {
    if (req.url !== "/modules" || req.method !== "POST") {
      res.writeHead(400);
      return res.end();
    }
    this.bindBodyListener(req);
    res.writeHead(200);
    res.end();
  }

  private bindBodyListener(request: IncomingMessage) {
    let body = "";
    request.on("data", data => {
      body += data;
      if (body.length > 1e6) {
        request.socket.destroy();
      }
    });
    request.on("end", () => {
      void writeFile(this.path, `module.exports = ${body}`).then(() => {
        if (this.format) {
          void this.formatFile();
        }
      });
    });
  }

  private async formatFile() {
    return ChildProcess.execute(`npx prettier '${this.path}' --write`);
  }
}
