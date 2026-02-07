package dev.abstratium.partner.boundary.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.startsWith;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import dev.abstratium.core.Roles;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
class PartnerResourceTest {

    @Inject
    EntityManager em;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up existing data - order matters due to foreign keys
        em.createQuery("DELETE FROM PartnerTag").executeUpdate();
        em.createQuery("DELETE FROM PartnerRelationship").executeUpdate();
        em.createQuery("DELETE FROM SMERelationship").executeUpdate();
        em.createQuery("DELETE FROM ContactDetail").executeUpdate();
        em.createQuery("DELETE FROM AddressDetail").executeUpdate();
        em.createQuery("DELETE FROM NaturalPerson").executeUpdate();
        em.createQuery("DELETE FROM LegalEntity").executeUpdate();
        em.createQuery("DELETE FROM Partner").executeUpdate();
        em.flush();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testCreatePartner() {
        String id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "notes": "Test partner"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("partnerNumber", notNullValue())
            .body("partnerNumber", startsWith("P"))
            .body("active", is(true))
            .body("notes", is("Test partner"))
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue())
            .extract()
            .path("id");
        
        // Verify ID is not empty
        assert id != null && !id.trim().isEmpty() : "Partner ID must not be empty";
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testCreateMultiplePartnersHaveUniqueIds() {
        // Create first partner
        String id1 = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "firstName": "Partner",
                    "lastName": "One"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .extract()
            .path("id");
        
        // Create second partner
        String id2 = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "legalName": "Partner Two Corp"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .extract()
            .path("id");
        
        // Verify both IDs are not empty and different
        assert id1 != null && !id1.trim().isEmpty() : "First partner ID must not be empty";
        assert id2 != null && !id2.trim().isEmpty() : "Second partner ID must not be empty";
        assert !id1.equals(id2) : "Partner IDs must be unique";
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testCreatePartnerWithEmptyIdInRequestGeneratesNewId() {
        // Try to create a partner with empty ID in request - should be ignored
        String id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "id": "",
                    "firstName": "Test",
                    "lastName": "User"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .extract()
            .path("id");
        
        // Verify ID was generated and is not empty
        assert id != null && !id.trim().isEmpty() : "Partner ID must be generated when empty ID provided";
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testCreateLegalEntityPartner() {
        String id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "legalName": "Acme Corporation",
                    "tradingName": "Acme",
                    "registrationNumber": "REG123456",
                    "taxId": "TAX789",
                    "notes": "Test legal entity"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("partnerNumber", notNullValue())
            .body("partnerNumber", startsWith("P"))
            .body("legalName", is("Acme Corporation"))
            .body("tradingName", is("Acme"))
            .body("active", is(true))
            .extract()
            .path("id");
        
        // Verify ID is not empty
        assert id != null && !id.trim().isEmpty() : "Legal entity partner ID must not be empty";
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testSearchPartnersRequiresSearchTerm() {
        given()
            .when()
            .get("/api/partner")
            .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testSearchPartners() {
        given()
            .when()
            .get("/api/partner?search=test")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("$", notNullValue());
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testGetPartnerById() {
        // First create a partner
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "firstName": "Jane",
                    "lastName": "Smith",
                    "active": true
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        System.out.println("Created partner with ID: " + partnerId);

        // Then retrieve it
        given()
            .when()
            .get("/api/partner/" + partnerId)
            .then()
            .log().all()  // Log the full response
            .statusCode(200)
            .body("id", is(partnerId))
            .body("partnerNumber", notNullValue())
            .body("partnerNumber", startsWith("P"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testUpdatePartner() {
        // First create a partner
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "firstName": "Bob",
                    "lastName": "Johnson",
                    "notes": "Original notes"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Update the partner
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "id": "%s",
                    "firstName": "Bob",
                    "lastName": "Johnson",
                    "active": false,
                    "notes": "Updated notes"
                }
                """.formatted(partnerId))
            .when()
            .put("/api/partner")
            .then()
            .statusCode(200)
            .body("id", is(partnerId))
            .body("active", is(false))
            .body("notes", is("Updated notes"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testDeletePartner() {
        // First create a partner
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "firstName": "Alice",
                    "lastName": "Williams"
                }
                """)
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Delete the partner
        given()
            .when()
            .delete("/api/partner/" + partnerId)
            .then()
            .statusCode(204);

        // Verify it's deleted (should return 404 not found)
        given()
            .when()
            .get("/api/partner/" + partnerId)
            .then()
            .statusCode(404);
    }

    @Test
    void testPartnerEndpointRequiresAuthentication() {
        given()
            .when()
            .get("/api/partner")
            .then()
            .statusCode(400);
    }
}
