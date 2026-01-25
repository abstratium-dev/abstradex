package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.dto.PartnerSearchResult;
import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class PartnerServiceTest {

    @Inject
    PartnerService partnerService;

    @Inject
    AddressService addressService;

    @Inject
    AddressDetailService addressDetailService;

    @Inject
    EntityManager em;

    @Test
    @Transactional
    public void testCreateNaturalPerson() {
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("John");
        person.setLastName("Doe");
        person.setActive(true);

        Partner created = partnerService.create(person);

        assertNotNull(created.getId());
        assertNotNull(created.getPartnerNumber());
        assertTrue(created.isActive());
        assertTrue(created instanceof NaturalPerson);
        assertEquals("John", ((NaturalPerson) created).getFirstName());
        assertEquals("Doe", ((NaturalPerson) created).getLastName());
    }

    @Test
    @Transactional
    public void testCreateLegalEntity() {
        LegalEntity entity = new LegalEntity();
        entity.setLegalName("Acme Corp");
        entity.setJurisdiction("US");
        entity.setActive(true);

        Partner created = partnerService.create(entity);

        assertNotNull(created.getId());
        assertNotNull(created.getPartnerNumber());
        assertTrue(created.isActive());
        assertTrue(created instanceof LegalEntity);
        assertEquals("Acme Corp", ((LegalEntity) created).getLegalName());
        assertEquals("US", ((LegalEntity) created).getJurisdiction());
    }

    @Test
    @Transactional
    public void testFindById() {
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Jane");
        person.setLastName("Smith");
        person.setActive(true);

        Partner created = partnerService.create(person);
        String id = created.getId();

        Partner found = partnerService.findById(id);

        assertNotNull(found);
        assertEquals(id, found.getId());
        assertTrue(found instanceof NaturalPerson);
        assertEquals("Jane", ((NaturalPerson) found).getFirstName());
    }

    @Test
    @Transactional
    public void testUpdate() {
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Bob");
        person.setLastName("Johnson");
        person.setActive(true);

        Partner created = partnerService.create(person);
        String id = created.getId();
        String originalPartnerNumber = created.getPartnerNumber();

        // Update the partner
        NaturalPerson updated = new NaturalPerson();
        updated.setId(id);
        updated.setFirstName("Robert");
        updated.setLastName("Johnson");
        updated.setActive(false);

        Partner result = partnerService.update(updated);

        assertEquals(id, result.getId());
        assertEquals(originalPartnerNumber, result.getPartnerNumber());
        assertFalse(result.isActive());
        assertEquals("Robert", ((NaturalPerson) result).getFirstName());
    }

    @Test
    @Transactional
    public void testDelete() {
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Alice");
        person.setLastName("Williams");
        person.setActive(true);

        Partner created = partnerService.create(person);
        String id = created.getId();

        partnerService.delete(id);

        Partner found = partnerService.findById(id);
        assertNull(found);
    }

    @Test
    @Transactional
    public void testSearchByFirstName() {
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Charlie");
        person.setLastName("Brown");
        person.setActive(true);

        partnerService.create(person);

        List<Partner> results = partnerService.search("Charlie");

        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(p -> 
            p instanceof NaturalPerson && 
            "Charlie".equals(((NaturalPerson) p).getFirstName())
        ));
    }

    @Test
    @Transactional
    public void testSearchByLegalName() {
        LegalEntity entity = new LegalEntity();
        entity.setLegalName("TechCorp Inc");
        entity.setJurisdiction("US");
        entity.setActive(true);

        partnerService.create(entity);

        List<Partner> results = partnerService.search("TechCorp");

        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(p -> 
            p instanceof LegalEntity && 
            "TechCorp Inc".equals(((LegalEntity) p).getLegalName())
        ));
    }

    @Test
    @Transactional
    public void testSearchWithAddressNoPrimaryAddress() {
        // Create partner
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("David");
        person.setLastName("Miller");
        person.setActive(true);
        Partner partner = partnerService.create(person);

        // Create address
        Address address = new Address();
        address.setStreetLine1("123 Main St");
        address.setCity("Springfield");
        address.setCountryCode("US");
        address.setVerified(false);
        Address createdAddress = addressService.create(address);

        // Create address detail (billing, not primary)
        AddressDetail addressDetail = new AddressDetail();
        addressDetail.setPrimary(false);
        addressDetail.setAddressType("BILLING");
        addressDetailService.create(partner.getId(), createdAddress.getId(), addressDetail);
        em.flush();

        // Search with address
        List<PartnerSearchResult> results = partnerService.searchWithAddressContactDetailsAndTags("David");

        assertFalse(results.isEmpty());
        PartnerSearchResult result = results.stream()
            .filter(r -> "David".equals(r.getFirstName()))
            .findFirst()
            .orElse(null);

        assertNotNull(result);
        assertNotNull(result.getAddressLine());
        assertTrue(result.getAddressLine().contains("123 Main St"));
        assertTrue(result.getAddressLine().contains("Springfield"));
    }

    @Test
    @Transactional
    public void testSearchWithAddressPrimaryPreferred() {
        // Create partner
        LegalEntity entity = new LegalEntity();
        entity.setLegalName("Primary Test Corp");
        entity.setJurisdiction("US");
        entity.setActive(true);
        Partner partner = partnerService.create(entity);

        // Create two addresses
        Address address1 = new Address();
        address1.setStreetLine1("456 Secondary St");
        address1.setCity("Oldtown");
        address1.setCountryCode("US");
        address1.setVerified(false);
        Address createdAddress1 = addressService.create(address1);

        Address address2 = new Address();
        address2.setStreetLine1("789 Primary Ave");
        address2.setCity("Newtown");
        address2.setCountryCode("US");
        address2.setVerified(false);
        Address createdAddress2 = addressService.create(address2);

        // Create address details - first is billing, second is primary
        AddressDetail detail1 = new AddressDetail();
        detail1.setPrimary(false);
        detail1.setAddressType("BILLING");
        addressDetailService.create(partner.getId(), createdAddress1.getId(), detail1);

        AddressDetail detail2 = new AddressDetail();
        detail2.setPrimary(true);
        detail2.setAddressType("SHIPPING");
        addressDetailService.create(partner.getId(), createdAddress2.getId(), detail2);
        em.flush();

        // Search with address - should return primary address
        List<PartnerSearchResult> results = partnerService.searchWithAddressContactDetailsAndTags("Primary Test");

        assertFalse(results.isEmpty());
        PartnerSearchResult result = results.stream()
            .filter(r -> "Primary Test Corp".equals(r.getLegalName()))
            .findFirst()
            .orElse(null);

        assertNotNull(result);
        assertNotNull(result.getAddressLine());
        assertTrue(result.getAddressLine().contains("789 Primary Ave"));
        assertTrue(result.getAddressLine().contains("Newtown"));
        assertFalse(result.getAddressLine().contains("Secondary"));
    }

    @Test
    @Transactional
    public void testSearchWithAddressNoAddress() {
        // Create partner without address
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Emily");
        person.setLastName("Davis");
        person.setActive(true);
        partnerService.create(person);

        // Search with address
        List<PartnerSearchResult> results = partnerService.searchWithAddressContactDetailsAndTags("Emily");

        assertFalse(results.isEmpty());
        PartnerSearchResult result = results.stream()
            .filter(r -> "Emily".equals(r.getFirstName()))
            .findFirst()
            .orElse(null);

        assertNotNull(result);
        assertNull(result.getAddressLine());
    }

    @Test
    @Transactional
    public void testSearchWithAddressBillingPreferredOverShipping() {
        // Create partner
        NaturalPerson person = new NaturalPerson();
        person.setFirstName("Frank");
        person.setLastName("Wilson");
        person.setActive(true);
        Partner partner = partnerService.create(person);

        // Create two addresses
        Address address1 = new Address();
        address1.setStreetLine1("111 Shipping Rd");
        address1.setCity("Shipville");
        address1.setCountryCode("US");
        address1.setVerified(false);
        Address createdAddress1 = addressService.create(address1);

        Address address2 = new Address();
        address2.setStreetLine1("222 Billing Blvd");
        address2.setCity("Billtown");
        address2.setCountryCode("US");
        address2.setVerified(false);
        Address createdAddress2 = addressService.create(address2);

        // Create address details - shipping first, then billing (both not primary)
        AddressDetail detail1 = new AddressDetail();
        detail1.setPrimary(false);
        detail1.setAddressType("SHIPPING");
        addressDetailService.create(partner.getId(), createdAddress1.getId(), detail1);

        AddressDetail detail2 = new AddressDetail();
        detail2.setPrimary(false);
        detail2.setAddressType("BILLING");
        addressDetailService.create(partner.getId(), createdAddress2.getId(), detail2);
        em.flush();

        // Search with address - should return billing address
        List<PartnerSearchResult> results = partnerService.searchWithAddressContactDetailsAndTags("Frank");

        assertFalse(results.isEmpty());
        PartnerSearchResult result = results.stream()
            .filter(r -> "Frank".equals(r.getFirstName()))
            .findFirst()
            .orElse(null);

        assertNotNull(result);
        assertNotNull(result.getAddressLine());
        assertTrue(result.getAddressLine().contains("222 Billing Blvd"));
        assertTrue(result.getAddressLine().contains("Billtown"));
        assertFalse(result.getAddressLine().contains("Shipping"));
    }
}
