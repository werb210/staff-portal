export function bootstrapAzureEnv() {
  const required = [
    'PORT',
    'NODE_ENV',
    'AZURE_STORAGE_ACCOUNT',
    'AZURE_STORAGE_ACCESS_KEY',
    'AZURE_STORAGE_CONTAINER',
    'JWT_SECRET',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }

  return {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV!,
    SERVER_VERSION: process.env.SERVER_VERSION || 'dev',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
    AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT!,
    AZURE_STORAGE_ACCESS_KEY: process.env.AZURE_STORAGE_ACCESS_KEY!,
    AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB: {
      host: process.env.POSTGRES_HOST!,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      database: process.env.POSTGRES_DB!,
    },
  };
}
