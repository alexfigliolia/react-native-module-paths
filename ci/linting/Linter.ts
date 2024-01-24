import { ChildProcess } from "@figliolia/child-process";

export class Linter extends ChildProcess {
  public static async run() {
    await this.typeCheck();
    await this.runOxtail();
    await this.runEslint();
  }

  private static typeCheck() {
    return this.wrapCommand("yarn tsc --noemit");
  }

  private static runOxtail() {
    return this.wrapCommand("yarn dlx oxlint@latest -A all --fix");
  }

  private static runEslint() {
    return this.wrapCommand("yarn eslint ./ --fix");
  }
}
