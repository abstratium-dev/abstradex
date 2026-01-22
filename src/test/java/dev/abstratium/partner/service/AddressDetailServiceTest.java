package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class AddressDetailServiceTest {

    @Inject
    AddressDetailService addressDetailService;

    @Inject
    AddressService addressService;

    @Inject
    PartnerService partnerService;

    @Inject
    EntityManager em;

    @Test
    @Transactional
    public void testIsPrimaryPersistence() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1L);
        em.persist(partner);
        em.flush();

        // Create an address
        Address address = new Address();
        address.setStreetLine1("123 Test St");
        address.setCity("Test City");
        address.setCountryCode("US");
        address.setVerified(true);
        Address createdAddress = addressService.create(address);

        // Create address detail with isPrimary = true
        AddressDetail addressDetail = new AddressDetail();
        addressDetail.setPrimary(true);
        addressDetail.setAddressType("BILLING");

        AddressDetail created = addressDetailService.create(partner.getId(), createdAddress.getId(), addressDetail);
        em.flush(); // Ensure address detail is persisted to database
        
        assertNotNull(created.getId());
        assertTrue(created.isPrimary(), "isPrimary should be true after creation");

        // Verify by fetching from database
        em.clear(); // Clear persistence context to force database read
        AddressDetail found = addressDetailService.findById(created.getId());
        assertNotNull(found);
        assertTrue(found.isPrimary(), "isPrimary should be true when fetched from database");
    }

    @Test
    @Transactional
    public void testIsVerifiedPersistence() {
        // Create an address with isVerified = true
        Address address = new Address();
        address.setStreetLine1("456 Verified St");
        address.setCity("Verified City");
        address.setCountryCode("CH");
        address.setStateProvince("Vaud");
        address.setPostalCode("1007");
        address.setVerified(true);

        Address created = addressService.create(address);
        em.flush(); // Ensure address is persisted to database
        
        assertNotNull(created.getId());
        assertTrue(created.isVerified(), "isVerified should be true after creation");

        // Verify by fetching from database
        em.clear(); // Clear persistence context to force database read
        Address found = addressService.findById(created.getId());
        assertNotNull(found);
        assertTrue(found.isVerified(), "isVerified should be true when fetched from database");
    }

    @Test
    @Transactional
    public void testOnlyOnePrimaryAddressPerPartner() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(2L);
        em.persist(partner);
        em.flush();

        // Create two addresses
        Address address1 = new Address();
        address1.setStreetLine1("111 First St");
        address1.setCity("City1");
        address1.setCountryCode("US");
        Address createdAddress1 = addressService.create(address1);

        Address address2 = new Address();
        address2.setStreetLine1("222 Second St");
        address2.setCity("City2");
        address2.setCountryCode("US");
        Address createdAddress2 = addressService.create(address2);

        // Create first address detail as primary
        AddressDetail addressDetail1 = new AddressDetail();
        addressDetail1.setPrimary(true);
        addressDetail1.setAddressType("BILLING");
        AddressDetail created1 = addressDetailService.create(partner.getId(), createdAddress1.getId(), addressDetail1);
        em.flush(); // Ensure first address detail is persisted
        assertTrue(created1.isPrimary());

        // Create second address detail as primary - should unset the first one
        AddressDetail addressDetail2 = new AddressDetail();
        addressDetail2.setPrimary(true);
        addressDetail2.setAddressType("SHIPPING");
        AddressDetail created2 = addressDetailService.create(partner.getId(), createdAddress2.getId(), addressDetail2);
        em.flush(); // Ensure second address detail is persisted and first is updated
        assertTrue(created2.isPrimary());

        // Verify first address is no longer primary
        em.clear();
        AddressDetail found1 = addressDetailService.findById(created1.getId());
        assertFalse(found1.isPrimary(), "First address should no longer be primary");

        AddressDetail found2 = addressDetailService.findById(created2.getId());
        assertTrue(found2.isPrimary(), "Second address should be primary");
    }
}
