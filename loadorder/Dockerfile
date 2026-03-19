FROM nginx:alpine

# Copy app files
COPY index.html /usr/share/nginx/html/index.html
RUN chmod 644 /usr/share/nginx/html/index.html

# Nginx config on port 3165 (host network mode)
RUN printf 'server {\n\
    listen 3165;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    add_header X-Content-Type-Options nosniff;\n\
    add_header X-Frame-Options SAMEORIGIN;\n\
    add_header Cache-Control "no-store, must-revalidate";\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3165
