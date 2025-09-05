// Lightweight logger wrapper to centralize logging and avoid direct console usage
// Logging is enabled for debug when process.env.DEBUG is truthy.
export const logger = {
  debug: (...args: unknown[]) => {
    if (process.env.DEBUG) {
      // keep debug-level output opt-in
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
