package dev.abstratium.partner.boundary.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class ContactDetailResourceTest {

    @Inject
    EntityManager em;

    private String partnerId;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up any existing test data
        em.createQuery("DELETE FROM ContactDetail").executeUpdate();
        em.createQuery("DELETE FROM NaturalPerson").executeUpdate();
        em.createQuery("DELETE FROM LegalEntity").executeUpdate();
        em.createQuery("DELETE FROM Partner").executeUpdate();

        // Create a test partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(9002L);
        em.persist(partner);
        em.flush();
        partnerId = partner.getId();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddContactToPartner() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "test@example.com",
                    "label": "Work",
                    "isPrimary": true,
                    "isVerified": false
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/contact")
        .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("contactType", is("EMAIL"))
            .body("contactValue", is("test@example.com"))
            .body("label", is("Work"))
            .body("isPrimary", is(true))
            .body("isVerified", is(false));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetPartnerContacts() {
        // First add a contact to the partner
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "PHONE",
                    "contactValue": "+1234567890",
                    "isPrimary": false,
                    "isVerified": true
                }
                """)
            .post("/api/partner/" + partnerId + "/contact");

        // Then get all contacts for the partner
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetPartnerContactsByType() {
        // Add multiple contacts of different types
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "email1@example.com",
                    "isPrimary": true
                }
                """)
            .post("/api/partner/" + partnerId + "/contact");

        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "PHONE",
                    "contactValue": "+1111111111",
                    "isPrimary": false
                }
                """)
            .post("/api/partner/" + partnerId + "/contact");

        // Get only EMAIL contacts
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact/type/EMAIL")
        .then()
            .statusCode(200)
            .body("size()", is(1))
            .body("[0].contactType", is("EMAIL"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetContactById() {
        // Create a contact first
        String contactId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "MOBILE",
                    "contactValue": "+9876543210",
                    "label": "Personal"
                }
                """)
            .post("/api/partner/" + partnerId + "/contact")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Get the contact by ID
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact/" + contactId)
        .then()
            .statusCode(200)
            .body("id", is(contactId))
            .body("contactType", is("MOBILE"))
            .body("contactValue", is("+9876543210"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetContactByIdNotFound() {
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact/nonexistent-id")
        .then()
            .statusCode(404);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testUpdateContact() {
        // Create a contact first
        String contactId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "old@example.com",
                    "label": "Work",
                    "isPrimary": false,
                    "isVerified": false
                }
                """)
            .post("/api/partner/" + partnerId + "/contact")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Update the contact
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "new@example.com",
                    "label": "Personal",
                    "isPrimary": true,
                    "isVerified": true
                }
                """)
        .when()
            .put("/api/partner/" + partnerId + "/contact/" + contactId)
        .then()
            .statusCode(200)
            .body("id", is(contactId))
            .body("contactValue", is("new@example.com"))
            .body("label", is("Personal"))
            .body("isPrimary", is(true))
            .body("isVerified", is(true));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testRemoveContactFromPartner() {
        // First add a contact to the partner
        String contactId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "FAX",
                    "contactValue": "+1234567890"
                }
                """)
            .post("/api/partner/" + partnerId + "/contact")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Then remove it
        given()
        .when()
            .delete("/api/partner/" + partnerId + "/contact/" + contactId)
        .then()
            .statusCode(204);

        // Verify it's gone
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact/" + contactId)
        .then()
            .statusCode(404);
    }

    @Test
    public void testUnauthorizedAccess() {
        // Test without authentication - OIDC redirects to login (302)
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "test@example.com"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/contact")
        .then()
            .statusCode(302);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {"WRONG_ROLE"})
    public void testForbiddenAccess() {
        // Test with wrong role
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "test@example.com"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/contact")
        .then()
            .statusCode(403);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddContactWithInvalidPartner() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "test@example.com"
                }
                """)
        .when()
            .post("/api/partner/invalid-partner-id/contact")
        .then()
            .statusCode(500); // Should fail with IllegalArgumentException
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testUpdateContactWithInvalidId() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "test@example.com"
                }
                """)
        .when()
            .put("/api/partner/" + partnerId + "/contact/invalid-contact-id")
        .then()
            .statusCode(500); // Should fail with IllegalArgumentException
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testMultiplePrimaryContactsOfSameType() {
        // Add first primary email
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "first@example.com",
                    "isPrimary": true
                }
                """)
            .post("/api/partner/" + partnerId + "/contact")
            .then()
            .statusCode(200);

        // Add second primary email - should unset the first
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "contactType": "EMAIL",
                    "contactValue": "second@example.com",
                    "isPrimary": true
                }
                """)
            .post("/api/partner/" + partnerId + "/contact")
            .then()
            .statusCode(200);

        // Verify only one primary EMAIL contact exists
        given()
        .when()
            .get("/api/partner/" + partnerId + "/contact/type/EMAIL")
        .then()
            .statusCode(200)
            .body("size()", is(2))
            .body("findAll { it.isPrimary == true }.size()", is(1));
    }
}
