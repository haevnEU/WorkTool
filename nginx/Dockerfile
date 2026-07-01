FROM nginx:1.25-alpine

# install openssl for cert generation
RUN apk add --no-cache openssl

# create directories for certs
RUN mkdir -p /etc/ssl/private /etc/ssl/certs

# generate a self-signed certificate (valid 365 days) for CN=localhost
# adjust -subj if you need a different CN
RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key \
    -out /etc/ssl/certs/selfsigned.crt \
    -subj "/CN=localhost" \
 && chmod 600 /etc/ssl/private/selfsigned.key

# copy the nginx config from the build context (same directory)
COPY nginx.conf /etc/nginx/nginx.conf

# expose ports (match your docker-compose if needed)
EXPOSE 80 443 8081 8443

# run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]