export interface Config {
  jwtSecret: string;
}

export function getConfig(): Config {
  if (!process.env.JWT_SECRET) {
    throw new Error();
  }

  return {
    jwtSecret: process.env.JWT_SECRET ?? "",
  };
}
