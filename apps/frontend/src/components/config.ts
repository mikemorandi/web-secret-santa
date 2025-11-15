// Use runtime config from window object if available (for production Docker environment)
// Otherwise fall back to build-time environment variables (for development)
export const API_BASEPATH = (window as any).VUE_APP_API_BASEPATH || process.env.VUE_APP_API_BASEPATH
