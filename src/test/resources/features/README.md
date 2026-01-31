# User Stories

This directory contains user stories written in Gherkin format for the Abstradex partner management system.

## Overview

Abstradex is a rolodex application for managing business partners (customers, suppliers, etc.) along with their addresses, contacts, and tags.

## User Stories

### Core Features

1. **[authentication.feature](authentication.feature)** - User authentication and authorization using OAuth2/OIDC
2. **[partner-management.feature](partner-management.feature)** - Create, read, update, and delete partners (both natural persons and legal entities)
3. **[address-management.feature](address-management.feature)** - Manage physical addresses with verification status
4. **[tag-management.feature](tag-management.feature)** - Create and manage tags for categorizing partners
5. **[partner-contact-management.feature](partner-contact-management.feature)** - Manage contact details (email, phone, etc.) for partners

### Relationship Management

6. **[partner-address-linking.feature](partner-address-linking.feature)** - Link addresses to partners with type (BILLING/SHIPPING) and primary designation
7. **[partner-tag-assignment.feature](partner-tag-assignment.feature)** - Assign tags to partners for categorization and filtering

## API Endpoints

The user stories are based on the following REST API structure:

### Partner Management
- `GET /api/partner` - List/search partners
- `GET /api/partner/{id}` - Get partner by ID
- `POST /api/partner` - Create partner
- `PUT /api/partner` - Update partner
- `DELETE /api/partner/{id}` - Delete partner

### Address Management
- `GET /api/address` - List/search addresses
- `GET /api/address/{id}` - Get address by ID
- `POST /api/address` - Create address
- `DELETE /api/address/{id}` - Delete address
- `GET /api/address/countries` - Get list of valid countries

### Partner-Address Linking
- `GET /api/partner/{partnerId}/address` - Get addresses for partner
- `POST /api/partner/{partnerId}/address?addressId={addressId}` - Link address to partner
- `DELETE /api/partner/{partnerId}/address/{id}` - Remove address from partner

### Partner-Contact Management
- `GET /api/partner/{partnerId}/contact` - Get contacts for partner
- `GET /api/partner/{partnerId}/contact/type/{contactType}` - Get contacts by type
- `GET /api/partner/{partnerId}/contact/{id}` - Get contact by ID
- `POST /api/partner/{partnerId}/contact` - Add contact to partner
- `PUT /api/partner/{partnerId}/contact/{id}` - Update contact
- `DELETE /api/partner/{partnerId}/contact/{id}` - Remove contact from partner

### Tag Management
- `GET /api/tag` - List/search tags
- `GET /api/tag/{id}` - Get tag by ID
- `POST /api/tag` - Create tag
- `PUT /api/tag/{id}` - Update tag
- `DELETE /api/tag/{id}` - Delete tag

### Partner-Tag Assignment
- `GET /api/partner/{partnerId}/tag` - Get tags for partner
- `POST /api/partner/{partnerId}/tag/{tagId}` - Assign tag to partner
- `DELETE /api/partner/{partnerId}/tag/{tagId}` - Remove tag from partner

## Partner Types

The system supports two types of partners:

### Natural Person
- Individual people with fields like:
  - First Name, Middle Name, Last Name
  - Title (Mr., Mrs., Dr., etc.)
  - Date of Birth
  - Tax ID
  - Preferred Language

### Legal Entity
- Companies and organizations with fields like:
  - Legal Name, Trading Name
  - Registration Number
  - Tax ID
  - Legal Form (LLC, Corporation, etc.)
  - Incorporation Date
  - Jurisdiction

## Security

All endpoints require authentication with the `USER` role. The system uses:
- OAuth2/OpenID Connect for authentication
- Backend for Frontend (BFF) pattern
- HTTP-only cookies for session management
- Role-based access control (RBAC)

## Testing

These user stories serve as the basis for:
- End-to-end tests using Playwright (see `/e2e-tests`)
- Integration tests using Quarkus Test
- API contract validation

## Format

All user stories follow the Gherkin format with:
- **Feature**: High-level description
- **User Story**: As a [user], I want [goal], So that [benefit]
- **Acceptance Criteria**: List of requirements
- **Background**: Common preconditions (optional)
- **Scenario**: Specific test cases with Given-When-Then steps
