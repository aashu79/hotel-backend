import chalk from "chalk";

const ENV = process.env.NODE_ENV || "development";

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level: string, message: string, meta?: any) {
  let base = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    base += ` | ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  info: (message: string, meta?: any) => {
    if (ENV === "production") {
      // Blue for info
      console.log(chalk.blue(formatMessage("info", message, meta)));
    } else {
      console.log(`[INFO] ${message}`, meta || "");
    }
  },
  warn: (message: string, meta?: any) => {
    if (ENV === "production") {
      // Yellow for warning
      console.warn(chalk.yellow(formatMessage("warn", message, meta)));
    } else {
      console.warn(`[WARN] ${message}`, meta || "");
    }
  },
  error: (message: string, meta?: any) => {
    if (ENV === "production") {
      // Red for error
      console.error(chalk.red(formatMessage("error", message, meta)));
    } else {
      console.error(`[ERROR] ${message}`, meta || "");
    }
  },
  debug: (message: string, meta?: any) => {
    if (ENV !== "production") {
      // Only log debug in non-production
      console.debug(`[DEBUG] ${message}`, meta || "");
    }
  },
};
