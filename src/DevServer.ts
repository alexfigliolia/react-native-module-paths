import type { EventEmitter } from "stream";
import { Logger } from "./Logger";
import { ModuleServer } from "./ModuleServer";
import { NgrokServer } from "./NGrokServer";
import { Options } from "./Options";
import type { IOptions } from "./types";

export class DevServer extends Options {
  private exiting = false;
  readonly CP: NgrokServer;
  readonly Server: ModuleServer;
  constructor(options: IOptions) {
    super(options);
    this.CP = new NgrokServer(options);
    this.Server = new ModuleServer(options);
    this.tearDown = this.tearDown.bind(this);
  }

  public async run() {
    this.bindToExit(process);
    this.bindToExit(this.CP.process);
    try {
      this.CP.start();
      this.Server.start();
      await this.CP.handler;
    } catch (error) {
      this.tearDown();
    }
  }

  private bindToExit<Process extends EventEmitter>(currentProcess: Process) {
    currentProcess.on("exit", this.tearDown);
    currentProcess.on("SIGINT", this.tearDown);
    currentProcess.on("SIGTERM", this.tearDown);
  }

  private tearDown() {
    if (!this.exiting) {
      Logger.info("Tearing down");
      this.exiting = true;
      this.Server.destroy();
      this.CP.destroy();
    }
  }
}
