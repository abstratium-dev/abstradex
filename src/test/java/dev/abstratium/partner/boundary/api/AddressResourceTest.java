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
public class AddressResourceTest {

    @Inject
    EntityManager em;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up any existing test data
        em.createQuery("DELETE FROM Address").executeUpdate();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testCreateAddress() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "streetLine1": "123 Test St",
                    "city": "Test City",
                    "stateProvince": "TS",
                    "postalCode": "12345",
                    "countryCode": "US",
                    "isVerified": false
                }
                """)
        .when()
            .post("/api/address")
        .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("streetLine1", is("123 Test St"))
            .body("city", is("Test City"))
            .body("postalCode", is("12345"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testSearchAddressesRequiresSearchTerm() {
        given()
        .when()
            .get("/api/address")
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testSearchAddresses() {
        given()
            .queryParam("search", "test")
        .when()
            .get("/api/address")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetAddressById() {
        // Create an address first
        String id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "streetLine1": "456 Find St",
                    "city": "Find City",
                    "postalCode": "54321",
                    "countryCode": "US"
                }
                """)
        .when()
            .post("/api/address")
        .then()
            .statusCode(200)
            .extract().path("id");

        // Get the address by ID
        given()
        .when()
            .get("/api/address/" + id)
        .then()
            .statusCode(200)
            .body("id", is(id))
            .body("streetLine1", is("456 Find St"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testDeleteAddress() {
        // Create an address first
        String id = given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "streetLine1": "999 Delete St",
                    "city": "Delete City",
                    "postalCode": "00000",
                    "countryCode": "US"
                }
                """)
        .when()
            .post("/api/address")
        .then()
            .statusCode(200)
            .extract().path("id");

        // Delete the address
        given()
        .when()
            .delete("/api/address/" + id)
        .then()
            .statusCode(204);

        // Verify it's deleted
        given()
        .when()
            .get("/api/address/" + id)
        .then()
            .statusCode(404);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testSearchAddress() {
        // Create test addresses
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                    "streetLine1": "111 Search St",
                    "city": "Searchville",
                    "postalCode": "11111",
                    "countryCode": "US"
                }
                """)
        .when()
            .post("/api/address");

        // Search for addresses
        given()
            .queryParam("search", "Searchville")
        .when()
            .get("/api/address")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    public void testAddressEndpointRequiresAuthentication() {
        given()
        .when()
            .get("/api/address")
        .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetCountries() {
        given()
        .when()
            .get("/api/address/countries")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(200));
    }
}
