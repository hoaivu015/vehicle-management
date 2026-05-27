import pino from 'pino';

export const logger = pino({
  browser: {
    asObject: true,
    disabled: import.meta.env.PROD,
  },
  level: import.meta.env.PROD ? 'info' : 'trace',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
