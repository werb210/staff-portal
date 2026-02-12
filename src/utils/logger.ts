type LogLevel = "info" | "warn" | "error" | "debug";

const isProduction = import.meta.env.PROD;

const shouldLog = (level: LogLevel) => {
  if (!isProduction) return true;
  return level === "error";
};

const write = (level: LogLevel, message: string, metadata?: Record<string, unknown>) => {
  if (!shouldLog(level)) return;
  if (level === "error") {
    console.error(message, metadata ?? {});
    return;
  }
  if (level === "warn") {
    console.warn(message, metadata ?? {});
    return;
  }
  if (level === "debug") {
    console.debug(message, metadata ?? {});
    return;
  }
  console.info(message, metadata ?? {});
};

export const logger = {
  info: (message: string, metadata?: Record<string, unknown>) => write("info", message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => write("warn", message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => write("error", message, metadata),
  debug: (message: string, metadata?: Record<string, unknown>) => write("debug", message, metadata)
};
