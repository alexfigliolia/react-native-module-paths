import type { RNRequire } from "./types";

export class RNModulePaths {
  static DESTINATION = "";

  public static registerAssets() {
    const loadedModules = this.parseLoaded();
    const Axios = require("axios").default;
    void Axios.post(this.DESTINATION, JSON.stringify(loadedModules.sort()));
  }

  private static parseLoaded() {
    const require = this.validate();
    const modules = require.getModules();
    const moduleIds = Object.keys(modules);
    const loadedModuleNames = this.filter(modules, moduleIds, true);
    const waitingModuleNames = this.filter(modules, moduleIds, false);
    console.log(
      "loaded:",
      loadedModuleNames.length,
      "waiting:",
      waitingModuleNames.length,
      "\n",
    );
    return loadedModuleNames;
  }

  private static filter(
    map: Record<string, any>,
    moduleList: string[],
    initialized = true,
  ) {
    const result: string[] = [];
    for (const modulePath of moduleList) {
      if (!!map[modulePath].isInitialized === initialized) {
        result.push(map[modulePath].verboseName);
      }
    }
    return result;
  }

  private static validate() {
    if (!("getModules" in require)) {
      throw new Error(
        "'react-native-module-paths' can only be used in React Native environments",
      );
    }
    return require as RNRequire;
  }
}
