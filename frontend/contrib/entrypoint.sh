#!/bin/sh

# Create a JS file with environment variables
echo "Generating runtime config with environment variables"
mkdir -p /usr/share/nginx/html/config

cat > /usr/share/nginx/html/config/runtime-config.js << EOF
window.VUE_APP_API_BASEPATH = "${VUE_APP_API_BASEPATH}";
EOF

echo "Starting Nginx"
nginx -g 'daemon off;'