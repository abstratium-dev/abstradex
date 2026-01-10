# abstracore

**abstracore** is the master blueprint for abstratium applications. Built on the Quarkus subatomic Java stack, Quinoa for seamless integration, and Angular for the frontend, it serves as the upstream source for all specific project forks.

## 📦 Tech Stack

Runtime: Quarkus (Java)

Frontend UI: Angular (via Quinoa)

API Layer: REST / GraphQL

Auth: Integrated with Abstrauth

Data: Designed for MySql compatibility

## 🛠️ Getting Started

1. Creating a New Project from Abstracore

To start a new project (e.g., abstradex) using this core:

Create a new empty repository on your Git server.

Clone Abstracore and point it to your new origin:

Bash

git clone https://github.com/your-org/abstracore.git your-new-project
cd your-new-project
git remote rename origin upstream
git remote add origin https://github.com/your-org/your-new-project.git
git push -u origin main
2. Pulling Baseline Updates
When Abstracore is updated with new features or security patches, pull those changes into your project fork:

Bash

# Ensure you are on your main branch
git checkout main

# Fetch the latest baseline code
git fetch upstream

# Merge baseline changes into your project
git merge upstream/main --allow-unrelated-histories
[!IMPORTANT] Avoid modifying the /core or /baseline directories in your project forks. Keep your custom logic in /app or specific feature packages to minimize merge conflicts during updates.

## 🏗️ Project Structure

src/main/java/...: Core logic, security filters, and Abstrauth integration.

src/main/webui: The Angular application (managed by Quinoa).

docker/: Standardized deployment configurations.

scripts/: Automation for syncing with Abstracore.

## 🚀 Development Mode

Run the following command to start Quarkus in Dev Mode with the Angular live-reload server:

```bash
./mvnw quarkus:dev
```

Backend: http://localhost:8080

Frontend: Automatically proxied by Quinoa

Dev UI: http://localhost:8080/q/dev

## 📝 Governance

This is a Living Blueprint. If you develop a feature in a specific project (like a new logging service or UI utility) that would benefit all Abstratium apps, please back-port it to Abstracore via a Pull Request.


------------------------


## Key Features

- **Backend For Frontend (BFF) Architecture** - All clients MUST be confidential clients using a backend to handle OAuth flows
- **JWT-based authentication** - Tokens signed with PS256 using public/private key pairs for stateless verification
- **HTTP-only encrypted cookies** - Tokens never exposed to JavaScript for maximum security
- **Federated login** - Users can authenticate via Google OAuth or native credentials
- **Multi-tenancy** - Single server instance serves multiple client applications with role-based access control (RBAC)
- **Self-hosted admin UI** - Angular-based management interface secured by Abstrauth itself using BFF pattern
- **Security hardened** - PKCE required, confidential clients only, HTTP-only cookies, CSRF protection, rate limiting, CSP headers
- **Low footprint** - uses as little as 64MB RAM and a small amount of CPU for typical workloads, idles at near zero CPU, achieved by being built as a native image (GraalVM)
- **Based on Quarkus and Angular** - industry standard frameworks

**Security Architecture:**
- Tokens are stored in encrypted HTTP-only cookies (never accessible to JavaScript)
- PKCE is REQUIRED for all authorization requests
- Only confidential clients are supported (public clients are rejected)
- Compliant with [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-26)

Abstrauth uses itself as an authorization server for users signing into the admin UI, demonstrating the BFF pattern in practice.

## Security

🔒 **Found a security vulnerability?** Please read our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

For information about the security implementation and features, see [SECURITY_DESIGN.md](docs/security/SECURITY_DESIGN.md).

## Documentation

- [User Guide](USER_GUIDE.md)
- [OAuth 2.0 Authorization Flows](docs/oauth/FLOWS.md)
- [Federated Login](docs/oauth/FEDERATED_LOGIN.md)
- [Database](docs/DATABASE.md)
- [Native Image Build](docs/NATIVE_IMAGE_BUILD.md)
- [Why do I need to implement a BFF?](decisions/BFF.md)

## Running the Application

See [User Guide](USER_GUIDE.md)

## Development and Testing

See [Development and Testing](docs/DEVELOPMENT_AND_TESTING.md)

## TODO

See [TODO.md](TODO.md)


## Aesthetics

### favicon

https://favicon.io/favicon-generator/ - text based

Text: a
Background: rounded
Font Family: Leckerli One
Font Variant: Regular 400 Normal
Font Size: 110
Font Color: #FFFFFF
Background Color: #5c6bc0

