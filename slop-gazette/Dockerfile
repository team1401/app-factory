FROM nginx:alpine

# Copy site files
COPY index.html /usr/share/nginx/html/index.html

# Simple nginx config
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/html text/css application/javascript; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    add_header X-Frame-Options SAMEORIGIN; \
    add_header X-Content-Type-Options nosniff; \
    add_header Referrer-Policy same-origin; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
