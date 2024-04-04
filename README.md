# React Native Module Paths
A utility for synchronizing your RAM Bundle's preloaded module paths in real time.

When working with React Native RAM Bundles, your metro config consumes your preloaded module paths to optimize your production build. 

The process of manually synchronizing the module paths during development became a bit tedious - and difficult to properly verify for large teams.

Using this package, you can spin up a simple CLI that will update your module paths each time a new critical file is added, removed, or renamed.

## Installation
```bash
yarn add react-native-module-paths
# or 
npm i -D react-native-module-paths

npm link
```

### Curl
```bash
# Mac
brew install curl
# Linux 
sudo apt-get install curl
# Windows
choco install curl
```

### Ngrok
Next, sign up for a free account at `https://ngrok.com` then click on "Set Up and Installation". 

Ngrok is going to ensure that any physical device you may be testing your code on can send your preloaded module paths back to your local repository.

Your setup steps should look like the following:
```bash
brew install ngrok
# or for Windows
choco install ngrok
# Then add your auth token using the CLI
ngrok config add-authtoken <your-token>
# Your token can be found here: "https://dashboard.ngrok.com/get-started/setup/"
```
With ngrok setup, you can now spin up the `react-native-module-paths` CLI when developing your app:

```bash
npx react-native-module-paths
```

With this running, anytime you add, delete, or rename a critical file in your application it'll appear in your `modulePaths.js` file!


### CLI Options
#### `--port | -p`
An option to override the default port number (4321)
#### `--path | -w`
 A path to your `modulePaths.js` file. It will default to `process.cwd()/modulePaths.js`
#### `--format | -f`
Whether or not to format your module paths file for legibility when it's updated. This options defaults to true and runs `prettier` directly on the file.

### Dev Loop Tips
When using this package, my development setup for React Native projects looks like the following:

```typescript
// DevServer.ts
import { ChildProcess } from "@figliolia/child-process";

export class DevServer extends ChildProcess {
  static CPs: ChildProcess[] = [];

  public static async run() {
    this.bindToExit();
    this.CPs = [
      new ChildProcess("npx react-native-module-paths"),
      new ChildProcess("npx react-native start"),
    ];
    try {
      this.bindExits(this.CPs.map(CP => CP.process));
      await Promise.all(this.CPs.map(CP => CP.handler));
    } catch (error) {
      this.tearDown();
    }
  }

  private static bindToExit() {
    process.on("SIGINT", () => {
      this.tearDown();
    });
  }

  private static tearDown() {
    this.CPs.forEach(CP => CP.process.kill());
    this.CPs = [];
  }
}

(async () => {
  await DevServer().run();
})().catch(console.log);
```

I can then simply run `ts-node DevServer.ts` to run both `react-native` and `react-native-module-paths` CLI's at once without having to spin up two shells. 

I'll often create `devloop` scripts such as this one so that I can easily add more tools into my workflow without flooding my package.json's scripts object.

Happy hacking :)