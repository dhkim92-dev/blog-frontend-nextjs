import "server-only";

const DEFAULT_DEVELOPMENT_BACKEND_API_HOST = "http://localhost:8080";
const DEFAULT_DEVELOPMENT_FRONTEND_HOST = "http://localhost:3000";

function getHost(variableName: string, developmentDefault: string) {
  const configuredHost = process.env[variableName]?.trim();

  if (configuredHost) {
    return configuredHost.endsWith("/")
      ? configuredHost.slice(0, -1)
      : configuredHost;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${variableName} must be configured in production.`);
  }

  return developmentDefault;
}

export function getBackendApiHost() {
  return getHost(
    "DHKIM92_NEXTJS_BACKEND_API_HOST",
    DEFAULT_DEVELOPMENT_BACKEND_API_HOST,
  );
}

export function getFrontendHost() {
  return getHost(
    "DHKIM92_NEXTJS_FRONTEND_HOST",
    DEFAULT_DEVELOPMENT_FRONTEND_HOST,
  );
}

export function getFrontendCookieDomain() {
  return new URL(getFrontendHost()).hostname;
}
