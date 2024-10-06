import path from "path";
import { ChildProcess } from "@figliolia/child-process";

export class Jest {
  public static async run() {
    const Jest = this.runTests();
    return Jest.handler;
  }

  private static runTests() {
    const args = process.argv.slice(2);
    return new ChildProcess("jest" + args.join(" "), {
      stdio: "inherit",
      cwd: path.resolve(),
    });
  }
}
