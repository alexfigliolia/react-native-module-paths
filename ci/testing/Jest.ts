import path from "path";
import { ChildProcess } from "@figliolia/child-process";
import { Zombies } from "../cleanup";

export class Jest {
  public static async run() {
    try {
      const Jest = this.runTests();
      await Jest.handler;
    } finally {
      await Zombies.kill();
    }
  }

  private static runTests() {
    const args = process.argv.slice(2);
    return new ChildProcess("jest" + args.join(" "), {
      stdio: "inherit",
      cwd: path.resolve(),
    });
  }
}
