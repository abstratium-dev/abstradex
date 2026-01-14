# User Manual

## Installation

It is intended that this component be run using docker.
It supports MySql and will soon also support postgresql and MS SQL Server.

You need to add a database/schema and a user to the database manually.

### Create the Database, User and Grant Permissions

#### MySQL

This component requires a MySQL database. Create a database and user with the following steps:

1. **Connect to MySQL** as root or admin user:

(change `<password>` to your password)

```bash
docker run -it --rm --network abstratium mysql mysql -h abstratium-mysql --port 3306 -u root -p<password>

DROP USER IF EXISTS 'abstradex'@'%';

CREATE USER 'abstradex'@'%' IDENTIFIED BY '<password>';

DROP DATABASE IF EXISTS abstradex;

CREATE DATABASE abstradex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON abstradex.* TO abstradex@'%'; -- on own database

FLUSH PRIVILEGES;

EXIT;
```

This project will automatically create all necessary tables and any initial data when it first connects to the database.

New versions will update the database as needed.

### Generate Secrets

Generate the required secrets for the application.

1. **Generate Cookie Encryption Secret** (32+ characters recommended):
   ```bash
   openssl rand -base64 32
   ```
   Use this output for `COOKIE_ENCRYPTION_SECRET`.

2. **Generate CSRF Token Signature Key** (64+ characters recommended):
   ```bash
   openssl rand -base64 64
   ```
   Use this output for `CSRF_TOKEN_SIGNATURE_KEY`.

### Pull and Run the Docker Container

1. **Pull the latest image** from GitHub Container Registry:
   ```bash
   docker pull ghcr.io/abstratium-dev/abstradex:latest
   ```

2. **Run the container**:

   ```bash
   docker run -d \
     --name abstradex \
     --network abstratium \
     -p 127.0.0.1:41080:8080 \
     -p 127.0.0.1:9002:9002 \
     -e QUARKUS_DATASOURCE_JDBC_URL="jdbc:mysql://abstratium-mysql:3306/abstradex" \
     -e QUARKUS_DATASOURCE_USERNAME="abstradex" \
     -e QUARKUS_DATASOURCE_PASSWORD="YOUR_SECURE_PASSWORD" \
     -e COOKIE_ENCRYPTION_SECRET="YOUR_COOKIE_ENCRYPTION_SECRET" \
     -e CSRF_TOKEN_SIGNATURE_KEY="YOUR_CSRF_TOKEN_SIGNATURE_KEY" \
     ghcr.io/abstratium-dev/abstratium-abstradex:latest
   ```

   **Required Environment Variables:**
   - `QUARKUS_DATASOURCE_JDBC_URL`: Database connection URL (format: `jdbc:mysql://<host>:<port>/<database>`)
   - `QUARKUS_DATASOURCE_USERNAME`: Database username
   - `QUARKUS_DATASOURCE_PASSWORD`: Database password (use strong, unique password)
   - `COOKIE_ENCRYPTION_SECRET`: Cookie encryption secret (min 32 chars, generate with `openssl rand -base64 32`)
   - `CSRF_TOKEN_SIGNATURE_KEY`: CSRF token signature key (min 32 chars, generate with `openssl rand -base64 64`)
   
   **Optional Environment Variables:**
   - `QUARKUS_OIDC_AUTH_SERVER_URL`: OIDC server URL (default: http://abstratium-abstrauth:8080/realms/abstratium)
   - `QUARKUS_OIDC_CLIENT_ID`: OAuth2 client ID (default: abstradex)
   - `QUARKUS_OIDC_CREDENTIALS_SECRET`: OAuth2 client secret

3. **Verify the container is running**:
   ```bash
   docker ps
   docker logs abstradex
   curl http://localhost:41080/m/health
   curl http://localhost:41080/m/info
   ```

4. **Access the application**:
   - Main application: http://localhost:41080
   - Management interface: http://localhost:9002/m/info

### Prerequisites

Before installation, ensure you have:

- **Docker** installed and running
- **MySQL 8.0+** database server
- **Network connectivity** between Docker container and MySQL
- **OpenSSL** for generating JWT keys
- **GitHub account** (if pulling from GitHub Container Registry)
- **nginx** or similar for reverse proxying and terminating TLS

## Initial Onboarding

None

## Account and Role Management

This component requires that users can authenticate using `abstratium-abstrauth`. That requires that an administrator signs into `abstratium-abstrauth` first to create the oauth2 client. Use the `client_id` and `client_secret` to set the values of the environment variables above, so that users can sign in.

## Partner Management

Abstradex provides a centralized system for managing your business partners:

- **Contact Directory**: Store and organize customer and supplier information
- **Search and Filter**: Quickly find partners by name, type, or other criteria
- **Secure Access**: Role-based access control ensures data privacy
- **Integration Ready**: REST API for integration with other systems

## Monitoring and Health Checks

This project provides several endpoints for monitoring:

- **Health Check**: `http://localhost:9002/m/health`
  - Returns application health status
  - Includes database connectivity check

- **Info Endpoint**: `http://localhost:9002/m/info`
  - Returns build information, version, and configuration
  - Useful for verifying deployment

## Troubleshooting

### Container won't start

1. Check Docker logs: `docker logs abstratium-abstradex`
2. Verify environment variables are set correctly
3. Ensure database is accessible from container
4. Check network connectivity: `docker network inspect abstratium`

### Database connection errors

1. Verify MySQL is running: `mysql -u abstradex -p -h abstratium-mysql`
2. Check firewall rules allow connection on port 3306
3. Verify database user has correct permissions
4. Check JDBC URL format is correct

### JWT token errors

1. Verify keys are correctly base64-encoded
2. Ensure public key matches private key
3. Check key length is at least 2048 bits
4. Verify no extra whitespace in environment variables

## Security Best Practices

1. **Never use default/test keys in production**
2. **Store secrets in secure secret management systems** (e.g., HashiCorp Vault, AWS Secrets Manager)
3. **Use strong, unique passwords** for database and admin accounts
4. **Enable HTTPS** in production (configure reverse proxy)
5. **Regularly update** the Docker image to get security patches
6. **Monitor logs** for suspicious activity
7. **Backup database regularly**
8. **Limit network access** to database and management interface
9. **Rotate JWT keys periodically** (requires user re-authentication)
10. **Keep `ALLOW_SIGNUP=false`** unless you need public registration

### Additional Resources

- [Quarkus Documentation](https://quarkus.io/guides/)
- [Angular Documentation](https://angular.io/docs)
- [Abstracore Repository](https://github.com/abstratium-dev/abstracore)

