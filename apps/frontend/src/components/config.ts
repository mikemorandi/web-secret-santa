// Use runtime config from window object if available (for production Docker environment)
// Otherwise fall back to build-time environment variables (for development)
interface WindowWithConfig extends Window {
  VUE_APP_API_BASEPATH?: string;
}

export const API_BASEPATH = (window as WindowWithConfig).VUE_APP_API_BASEPATH || process.env.VUE_APP_API_BASEPATH
