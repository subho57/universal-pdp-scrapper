/* eslint-disable no-console */
export class Logger {
  constructor(private readonly name: string) {}

  info(message: string, ...args: any) {
    console.log(`[${this.name}] ${message}:`, ...args);
  }

  error(message: string, ...args: any) {
    console.error(`[${this.name}] ${message}:`, ...args);
  }

  warn(message: string, ...args: any) {
    console.warn(`[${this.name}] ${message}:`, ...args);
  }

  debug(message: string, ...args: any) {
    console.debug(`[${this.name}] ${message}:`, ...args);
  }

  trace(message: string, ...args: any) {
    console.trace(`[${this.name}] ${message}:`, ...args);
  }
}
