export {
  config,
  envConfig,
  default,
  type EnvConfig,
  type EnvConfigFlat,
} from './env.config';

// Simple validation function - returns config as-is
// You can add Zod validation here if needed
export const validateEnv = (config: Record<string, unknown>) => config;
