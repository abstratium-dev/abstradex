# abstradex

**abstradex** is a "rolodex" for your SME's partners (customers, suppliers, etc.). Built on the Quarkus subatomic Java stack, Quinoa for seamless integration, and Angular for the frontend, it provides a modern contact management system for small and medium enterprises.

## 📦 Tech Stack

Runtime: Quarkus (Java)

Frontend UI: Angular (via Quinoa)

API Layer: REST

Auth: Integrated with Abstrauth

Data: Designed for MySql compatibility

## 🛠️ Getting Started

This project is based on the Abstracore template. To sync with baseline updates from Abstracore:

```bash
# From the project root, run the sync script
bash scripts/sync-base.sh
```

⚠️ **IMPORTANT**: Avoid modifying the `/core` directory to minimize merge conflicts during updates. Keep custom logic in `/partner` or other feature packages.

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

Backend: http://localhost:8082

Frontend: Automatically proxied by Quinoa

Dev UI: http://localhost:8082/q/dev

## 📝 Governance

This project is based on Abstracore. If you develop a feature here (like a new logging service or UI utility) that would benefit all Abstratium apps, please consider back-porting it to Abstracore via a Pull Request.


------------------------


## Things to remember

- **Backend For Frontend (BFF) Architecture** - This service must act as a BFF if it has a UI. It is the BFF for that UI.
- **Native Builds** - This service must be built as a native image (GraalVM) for optimal performance and low footprint.
- **Low footprint** - uses as little as 64MB RAM and a small amount of CPU for typical workloads, idles at near zero CPU, achieved by being built as a native image (GraalVM)
- **Based on Quarkus and Angular** - industry standard frameworks

## Security

🔒 **Found a security vulnerability?** Please read our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

For information about the security implementation and features, see [SECURITY_DESIGN.md](docs/security/SECURITY_DESIGN.md).

## Documentation

- [User Guide](USER_GUIDE.md)
- [Database](docs/DATABASE.md)
- [Native Image Build](docs/NATIVE_IMAGE_BUILD.md)
- [Other documentation](docs)

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
