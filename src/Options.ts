import { existsSync } from "fs";
import path from "path";
import { parseArgs } from "node:util";
import type { CLIOptions, IOptions } from "./types";
import { Logger } from "./Logger";

export class Options implements IOptions {
  port: number;
  format: boolean;
  path: string;
  constructor(options: IOptions) {
    this.port = options.port;
    this.path = options.path;
    this.format = options.format;
  }

  public all(): IOptions {
    return {
      port: this.port,
      path: this.path,
      format: this.format,
    };
  }

  public static parse() {
    const { values } = parseArgs({
      options: {
        port: {
          type: "string",
          short: "p",
          default: this.defaultOptions.port,
        },
        format: {
          type: "boolean",
          short: "f",
          default: this.defaultOptions.format,
        },
        path: {
          type: "string",
          short: "p",
          default: this.defaultOptions.path,
        },
      },
      strict: false,
    });
    const options = this.validate(values as CLIOptions);
    return new Options(options);
  }

  public static defaultOptions = {
    port: "4321",
    format: true,
    path: path.join(process.cwd(), "modulePaths.js"),
  };

  private static validate(options: CLIOptions): IOptions {
    const port = this.validatePort(options.port);
    const filePath = this.validateFilePath(options.path);
    return { port, path: filePath, format: options.format };
  }

  private static validatePort(input: string) {
    const port = parseInt(input);
    if (isNaN(port) || port < 0 || port > 65535) {
      Logger.error(
        "The port you've specified is invalid. Valid ports are integers ranging from 0-65535",
      );
      process.exit(0);
    }
    return port;
  }

  private static validateFilePath(filePath: string) {
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }
    if (!existsSync(filePath)) {
      Logger.error(
        "I could not find your modulePaths file. Here's where I looked:",
      );
      Logger.indented(filePath);
      process.exit(0);
    }
    return filePath;
  }
}
