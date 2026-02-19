FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

RUN echo 'server { \
    listen 3113; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/html text/css application/javascript; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3113
