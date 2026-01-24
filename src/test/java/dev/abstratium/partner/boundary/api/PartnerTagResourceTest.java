package dev.abstratium.partner.boundary.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.Tag;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class PartnerTagResourceTest {

    @Inject
    EntityManager em;

    private String partnerId;
    private String tagId;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up any existing test data
        em.createQuery("DELETE FROM PartnerTag").executeUpdate();
        em.createQuery("DELETE FROM Tag").executeUpdate();
        em.createQuery("DELETE FROM NaturalPerson").executeUpdate();
        em.createQuery("DELETE FROM LegalEntity").executeUpdate();
        em.createQuery("DELETE FROM Partner").executeUpdate();

        // Create a test partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(9003L);
        em.persist(partner);
        em.flush();
        partnerId = partner.getId();

        // Create a test tag
        Tag tag = new Tag();
        tag.setTagName("Test Tag");
        tag.setColorHex("#3B82F6");
        tag.setDescription("Test tag for testing");
        em.persist(tag);
        em.flush();
        tagId = tag.getId();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddTagToPartner() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
        .then()
            .statusCode(201)
            .body("id", notNullValue());
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetPartnerTags() {
        // First add a tag to the partner
        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tagId);

        // Then get all tags for the partner
        given()
        .when()
            .get("/api/partner/" + partnerId + "/tag")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1))
            .body("[0].tagName", is("Test Tag"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testRemoveTagFromPartner() {
        // First add a tag to the partner
        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
            .then()
            .statusCode(201);

        // Then remove it
        given()
        .when()
            .delete("/api/partner/" + partnerId + "/tag/" + tagId)
        .then()
            .statusCode(204);

        // Verify it's gone
        given()
        .when()
            .get("/api/partner/" + partnerId + "/tag")
        .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddDuplicateTagToPartner() {
        // Add tag first time
        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
            .then()
            .statusCode(201);

        // Try to add same tag again
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddTagWithInvalidPartner() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/invalid-partner-id/tag/" + tagId)
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddTagWithInvalidTag() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/" + partnerId + "/tag/invalid-tag-id")
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testRemoveNonexistentTagFromPartner() {
        given()
        .when()
            .delete("/api/partner/" + partnerId + "/tag/nonexistent-tag-id")
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testMultipleTagsOnPartner() {
        // Create additional tags using the API
        String tag2Id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Second Tag",
                    "colorHex": "#FF5733"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        String tag3Id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Third Tag",
                    "colorHex": "#33FF57"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Add all tags to partner
        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
            .then()
            .statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tag2Id)
            .then()
            .statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .post("/api/partner/" + partnerId + "/tag/" + tag3Id)
            .then()
            .statusCode(201);

        // Verify all tags are present
        given()
        .when()
            .get("/api/partner/" + partnerId + "/tag")
        .then()
            .statusCode(200)
            .body("size()", is(3));
    }

    @Test
    public void testUnauthorizedAccess() {
        // Test without authentication - OIDC redirects to login (302)
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
        .then()
            .statusCode(302);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {"WRONG_ROLE"})
    public void testForbiddenAccess() {
        // Test with wrong role
        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/partner/" + partnerId + "/tag/" + tagId)
        .then()
            .statusCode(403);
    }
}
