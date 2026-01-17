package dev.abstratium.partner.boundary.api;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.PartnerType;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
class PartnerResourceTest {

    @Inject
    EntityManager em;

    private String partnerTypeId;

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
        em.createQuery("DELETE FROM PartnerType").executeUpdate();
        em.flush();

        // Create a partner type for testing
        PartnerType partnerType = new PartnerType();
        partnerType.setTypeCode("NATURAL_PERSON");
        partnerType.setDescription("Natural Person");
        em.persist(partnerType);
        em.flush();
        partnerTypeId = partnerType.getId();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testCreatePartner() {
        String partnerNumber = "P-" + System.currentTimeMillis();
        
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "partnerNumber": "%s",
                    "partnerType": {"id": "%s"},
                    "active": true,
                    "notes": "Test partner"
                }
                """.formatted(partnerNumber, partnerTypeId))
            .when()
            .post("/api/partner")
            .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("partnerNumber", is(partnerNumber))
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
        String partnerNumber = "P-" + System.currentTimeMillis();
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "partnerNumber": "%s",
                    "partnerType": {"id": "%s"},
                    "active": true
                }
                """.formatted(partnerNumber, partnerTypeId))
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
            .body("partnerNumber", is(partnerNumber));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    void testUpdatePartner() {
        // First create a partner
        String partnerNumber = "P-" + System.currentTimeMillis();
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "partnerNumber": "%s",
                    "partnerType": {"id": "%s"},
                    "active": true,
                    "notes": "Original notes"
                }
                """.formatted(partnerNumber, partnerTypeId))
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
                    "partnerNumber": "%s",
                    "partnerType": {"id": "%s"},
                    "active": false,
                    "notes": "Updated notes"
                }
                """.formatted(partnerId, partnerNumber, partnerTypeId))
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
        String partnerNumber = "P-" + System.currentTimeMillis();
        String partnerId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "partnerNumber": "%s",
                    "partnerType": {"id": "%s"},
                    "active": true
                }
                """.formatted(partnerNumber, partnerTypeId))
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
