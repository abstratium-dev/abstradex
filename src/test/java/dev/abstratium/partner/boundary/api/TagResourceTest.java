package dev.abstratium.partner.boundary.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

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
public class TagResourceTest {

    @Inject
    EntityManager em;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up any existing test data
        em.createQuery("DELETE FROM PartnerTag").executeUpdate();
        em.createQuery("DELETE FROM Tag").executeUpdate();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testCreateTag() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "VIP Customer",
                    "colorHex": "#FF5733",
                    "description": "Very important customer"
                }
                """)
        .when()
            .post("/api/tag")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("tagName", is("VIP Customer"))
            .body("colorHex", is("#FF5733"))
            .body("description", is("Very important customer"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testCreateTagWithDuplicateName() {
        // Create first tag
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Duplicate Tag",
                    "colorHex": "#FF5733"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201);

        // Try to create second tag with same name
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Duplicate Tag",
                    "colorHex": "#00FF00"
                }
                """)
        .when()
            .post("/api/tag")
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetAllTags() {
        // Create a tag first
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Test Tag",
                    "colorHex": "#3B82F6"
                }
                """)
            .post("/api/tag");

        // Get all tags
        given()
        .when()
            .get("/api/tag")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testSearchTags() {
        // Create tags
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Premium Customer",
                    "colorHex": "#FFD700"
                }
                """)
            .post("/api/tag");

        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Regular Customer",
                    "colorHex": "#C0C0C0"
                }
                """)
            .post("/api/tag");

        // Search for tags containing "Premium"
        given()
            .queryParam("search", "Premium")
        .when()
            .get("/api/tag")
        .then()
            .statusCode(200)
            .body("size()", is(1))
            .body("[0].tagName", is("Premium Customer"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetTagById() {
        // Create a tag first
        String tagId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Special Tag",
                    "colorHex": "#9C27B0"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Get the tag by ID
        given()
        .when()
            .get("/api/tag/" + tagId)
        .then()
            .statusCode(200)
            .body("id", is(tagId))
            .body("tagName", is("Special Tag"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetTagByIdNotFound() {
        given()
        .when()
            .get("/api/tag/nonexistent-id")
        .then()
            .statusCode(404);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testUpdateTag() {
        // Create a tag first
        String tagId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Old Tag Name",
                    "colorHex": "#000000",
                    "description": "Old description"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Update the tag
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "New Tag Name",
                    "colorHex": "#FFFFFF",
                    "description": "New description"
                }
                """)
        .when()
            .put("/api/tag/" + tagId)
        .then()
            .statusCode(200)
            .body("id", is(tagId))
            .body("tagName", is("New Tag Name"))
            .body("colorHex", is("#FFFFFF"))
            .body("description", is("New description"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testDeleteTag() {
        // Create a tag first
        String tagId = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "tagName": "Tag to Delete",
                    "colorHex": "#FF0000"
                }
                """)
            .post("/api/tag")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Delete the tag
        given()
        .when()
            .delete("/api/tag/" + tagId)
        .then()
            .statusCode(204);

        // Verify it's gone
        given()
        .when()
            .get("/api/tag/" + tagId)
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
                    "tagName": "Test Tag",
                    "colorHex": "#3B82F6"
                }
                """)
        .when()
            .post("/api/tag")
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
                    "tagName": "Test Tag",
                    "colorHex": "#3B82F6"
                }
                """)
        .when()
            .post("/api/tag")
        .then()
            .statusCode(403);
    }
}
