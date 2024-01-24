import path from "path";
import { readFile, writeFile } from "fs/promises";
import { ChildProcess } from "@figliolia/child-process";
import type { CancelFN } from "@figliolia/task-queue";
import { TaskQueue } from "@figliolia/task-queue";
import type { IOptions } from "./types";
import { Logger } from "./Logger";

export class NgrokServer extends ChildProcess {
  private retries = 5;
  private cancel?: CancelFN;
  static TaskQueue = new TaskQueue();
  static LoaderPath = path.resolve(__dirname, "RNModulePaths.ts");
  constructor(options: IOptions) {
    super(`ngrok http ${options.port}`, {
      stdio: "ignore",
    });
  }

  public start() {
    this.cancel = NgrokServer.TaskQueue.deferTask(() => {
      void this.grepDestination();
    }, 1000);
  }

  public destroy() {
    this.cancel?.();
    this.process.kill();
  }

  private async grepDestination() {
    const { stdout } = await NgrokServer.execute(
      "curl http://localhost:4040/api/tunnels/",
    );
    const result = JSON.parse(stdout);
    const URL = result?.tunnels?.[0]?.public_url;
    if (!URL || typeof URL !== "string") {
      this.retry();
    }
    await this.insertDestination(URL);
    try {
      await NgrokServer.execute(
        `npx prettier '${NgrokServer.LoaderPath}' --write`,
      );
    } catch (error) {
      // silence
    }
  }

  private retry() {
    if (this.retries === 0) {
      Logger.error(
        "Failed to find Ngrok URL. Please make sure you've set up your account at: https://ngrok.com",
      );
      this.destroy();
    }
    this.retries--;
    return this.start();
  }

  private async insertDestination(URL: string) {
    const file = (await readFile(NgrokServer.LoaderPath)).toString();
    const lines = file.split("\n");
    let lineNumber = 0;
    for (const line of lines) {
      let found = false;
      const current = line.trim();
      if (current.startsWith("static DESTINATION")) {
        found = true;
        lines[lineNumber] = `static DESTINATION = "${URL}/modules";`;
      } else if (current.startsWith("RNModulePaths.DESTINATION =")) {
        found = true;
        lines[lineNumber] = `static DESTINATION = "${URL}/modules";`;
      }
      if (found) {
        const nextLine = lineNumber + 1;
        if (lines[nextLine].trim().endsWith('modules";')) {
          lines.splice(nextLine, 1);
        }
        return writeFile(NgrokServer.LoaderPath, lines.join("\n"));
      }
      lineNumber++;
    }
    Logger.error(
      "Internal error. If you're seeing this message, please reinstall react-native-module-paths",
    );
    this.destroy();
  }
}
