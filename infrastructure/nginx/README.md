# Nginx Reverse Proxy

Production Nginx config for Minecraft Platform.

## Files

- `nginx.conf` - Main configuration
- `proxy_params.conf` - Common proxy parameters
- `conf.d/` - Server block overrides

## Features

- HTTP/2 with TLS 1.3
- Gzip compression
- Rate limiting (per IP and per endpoint)
- Connection limits
- WebSocket support
- Static asset caching
- 50 MB max upload size

## Usage

```bash
# Mount this directory into the Nginx container
docker run -d \
  --name nginx \
  -p 80:80 -p 443:443 \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  -v ./proxy_params.conf:/etc/nginx/proxy_params.conf:ro \
  -v ./conf.d/:/etc/nginx/conf.d/:ro \
  -v ./certs/:/etc/nginx/certs/:ro \
  nginx:alpine
```

## TLS

Use certbot with the webroot plugin for Let's Encrypt:

```bash
certbot certonly --webroot -w /var/www/certbot \
  -d minecraftplatform.com \
  -d api.minecraftplatform.com \
  -d admin.minecraftplatform.com \
  -d docs.minecraftplatform.com
```

Then add a TLS server block in `conf.d/tls.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name minecraftplatform.com api.minecraftplatform.com
                admin.minecraftplatform.com docs.minecraftplatform.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```
