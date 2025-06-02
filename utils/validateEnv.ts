const requiredEnvVars = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_APP_VERSION",
] as const;

export const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};
