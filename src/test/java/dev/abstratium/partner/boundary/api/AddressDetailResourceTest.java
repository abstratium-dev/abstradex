package dev.abstratium.partner.boundary.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class AddressDetailResourceTest {

    @Inject
    EntityManager em;

    private String partnerId;
    private String addressId;

    @BeforeEach
    @Transactional
    public void setup() {
        // Clean up any existing test data
        em.createQuery("DELETE FROM AddressDetail").executeUpdate();
        em.createQuery("DELETE FROM Address").executeUpdate();
        em.createQuery("DELETE FROM NaturalPerson").executeUpdate();
        em.createQuery("DELETE FROM LegalEntity").executeUpdate();
        em.createQuery("DELETE FROM Partner").executeUpdate();

        // Create a test partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(9001L);
        em.persist(partner);
        em.flush();
        partnerId = partner.getId();

        // Create a test address
        Address address = new Address();
        address.setStreetLine1("123 Test St");
        address.setCity("Test City");
        address.setCountryCode("US");
        em.persist(address);
        em.flush();
        addressId = address.getId();
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddAddressToPartner() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/address")
        .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("isPrimary", is(true))
            .body("addressType", is("BILLING"));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testGetPartnerAddresses() {
        // First add an address to the partner
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
            .post("/api/partner/" + partnerId + "/address");

        // Then get all addresses for the partner
        given()
        .when()
            .get("/api/partner/" + partnerId + "/address")
        .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testRemoveAddressFromPartner() {
        // First add an address to the partner
        String addressDetailId = given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": false,
                    "addressType": "SHIPPING"
                }
                """)
            .post("/api/partner/" + partnerId + "/address")
            .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Then remove it
        given()
        .when()
            .delete("/api/partner/" + partnerId + "/address/" + addressDetailId)
        .then()
            .statusCode(204);
    }

    @Test
    public void testUnauthorizedAccess() {
        // Test without authentication - OIDC redirects to login (302)
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/address")
        .then()
            .statusCode(302);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {"WRONG_ROLE"})
    public void testForbiddenAccess() {
        // Test with wrong role
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/address")
        .then()
            .statusCode(403);
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddAddressWithInvalidPartner() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", addressId)
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
        .when()
            .post("/api/partner/invalid-partner-id/address")
        .then()
            .statusCode(500); // Should fail with IllegalArgumentException
    }

    @Test
    @TestSecurity(user = "testuser", roles = {Roles.USER})
    public void testAddAddressWithInvalidAddress() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("addressId", "invalid-address-id")
            .body("""
                {
                    "isPrimary": true,
                    "addressType": "BILLING"
                }
                """)
        .when()
            .post("/api/partner/" + partnerId + "/address")
        .then()
            .statusCode(500); // Should fail with IllegalArgumentException
    }
}
