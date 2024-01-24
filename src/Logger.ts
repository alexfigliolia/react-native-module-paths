import Chalk from "chalk";

export class Logger {
  public static BLUE = Chalk.blueBright.bold;

  public static indented(msg: string) {
    console.log(" ".repeat(5), msg);
  }

  public static info(msg: string) {
    console.log(Chalk.blueBright.bold("RN Module Paths: "), msg);
  }

  public static error(msg: string) {
    console.log(Chalk.redBright.bold("RN Module Paths: "), msg);
  }
}
