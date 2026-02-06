# Subdomain Hosting Guide for Shiwasha

This project supports dynamic subdomains (e.g., `vendor1.shiwasha.com`, `vendor2.shiwasha.com`). To make this work in your hosting environment, follow these steps.

## 1. DNS Configuration (Hostinger)
You need to point all potential subdomains to your server using a wildcard record.
*   **Log in** to your Hostinger hPanel.
*   Go to **Domains** -> Identify your domain -> **DNS / Nameservers**.
*   In the **Manage DNS records** section:
    *   **Type**: `A`
    *   **Name/Host**: `*` (This is the wildcard character)
    *   **Points to**: Your Server IP Address (e.g., `123.123.123.123`). 
        > [!TIP]
        > You can find your **Server IP** on the Hostinger hPanel Home page or under the **Hosting** -> **Plan Details** section. It is often labeled as "IPv4" or "Site IP".
    *   **TTL**: `3600` (default is fine).
*   **Click Add Record**.
*   **Main Domain**: Ensure you also have an `A` record with Name `@` pointing to the same IP address.

## 2. Server Configuration
Your web server (Nginx or Apache) must be configured to accept any subdomain and serve the Laravel `public` directory.

### For Apache (CPanel / Laragon)
In your VirtualHost configuration (or via CPanel "Subdomains" section by creating a wildcard subdomain `*`):
```apache
<VirtualHost *:80>
    ServerName shiwasha.com
    ServerAlias *.shiwasha.com
    DocumentRoot "/path/to/your/project/public"
    
    <Directory "/path/to/your/project/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### For Nginx (VPS)
```nginx
server {
    listen 80;
    server_name shiwasha.com *.shiwasha.com;
    root /path/to/your/project/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # ... remaining Laravel Nginx config ...
}
```

## 3. Laravel Environment (.env)
I have prepared a `.env.production` file for you. Ensure these key values are set:
*   `APP_URL=https://shiwasha.com/`
*   `SESSION_DOMAIN=.shiwasha.com`  <-- **CRITICAL**: The leading dot allows login sessions to work on both the main domain and all subdomains.

## 4. Database Setup
*   Ensure your database is created and the credentials are updated in `.env`.
*   Run the migrations: `php artisan migrate`.

## 5. Vendor Registration
When a vendor registers, they will choose a username, which becomes their subdomain.
*   Example: Username `silkpalace` -> `silkpalace.shiwasha.com`.
*   The system automatically handles the routing in `routes/vendor.php`.
