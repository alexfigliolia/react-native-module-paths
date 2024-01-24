export interface IOptions {
  port: number;
  format: boolean;
  path: string;
}

export interface CLIOptions {
  port: string;
  format: boolean;
  path: string;
}

export type RNRequire = typeof require & {
  getModules: () => Record<string, any>;
};
