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
        given()
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
            .body("updatedAt", notNullValue());
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testGetAllPartners() {
        given()
            .when()
            .get("/api/partner")
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
