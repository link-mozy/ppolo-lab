FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site /usr/share/nginx/html
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} +

EXPOSE 28080
