import { DevServer } from "./DevServer";
import { Options } from "./Options";

(async () => {
  const options = Options.parse();
  const Server = new DevServer(options);
  await Server.run();
})().catch(console.log);
