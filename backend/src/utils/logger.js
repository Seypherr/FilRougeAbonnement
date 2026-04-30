const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} ${message}${details}`;
};

export const logger = {
  info: (message, meta) => console.info(formatMessage("info", message, meta)),
  warn: (message, meta) => console.warn(formatMessage("warn", message, meta)),
  error: (message, meta) => console.error(formatMessage("error", message, meta))
};
