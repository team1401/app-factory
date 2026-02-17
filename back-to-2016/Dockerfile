FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy all static files
COPY index.html .
COPY app.js .
COPY style.css .

# Custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
