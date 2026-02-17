package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@QuarkusTest
public class AddressServiceTest {

    @Inject
    AddressService addressService;

    @Inject
    AddressDetailService addressDetailService;

    @Inject
    PartnerService partnerService;

    @Test
    @Transactional
    public void testCreateAndFindAddress() {
        Address address = new Address();
        address.setStreetLine1("123 Main St");
        address.setCity("Springfield");
        address.setStateProvince("IL");
        address.setPostalCode("62701");
        address.setCountryCode("US");
        address.setVerified(false);

        Address created = addressService.create(address);
        assertNotNull(created.getId());
        assertEquals("123 Main St", created.getStreetLine1());
        assertEquals("Springfield", created.getCity());

        Address found = addressService.findById(created.getId());
        assertNotNull(found);
        assertEquals(created.getId(), found.getId());
        assertEquals("123 Main St", found.getStreetLine1());
    }

    @Test
    @Transactional
    public void testDeleteAddress() {
        Address address = new Address();
        address.setStreetLine1("999 Delete St");
        address.setCity("Testville");
        address.setPostalCode("00000");
        address.setCountryCode("US");

        Address created = addressService.create(address);
        String id = created.getId();
        
        addressService.delete(id);
        
        Address found = addressService.findById(id);
        assertNull(found);
    }

    @Test
    @Transactional
    public void testSearchAddress() {
        Address address1 = new Address();
        address1.setStreetLine1("111 Search St");
        address1.setCity("Findville");
        address1.setPostalCode("11111");
        address1.setCountryCode("US");
        addressService.create(address1);

        Address address2 = new Address();
        address2.setStreetLine1("222 Other Ave");
        address2.setCity("Elsewhere");
        address2.setPostalCode("22222");
        address2.setCountryCode("US");
        addressService.create(address2);

        List<Address> results = addressService.search("Findville");
        assertTrue(results.size() >= 1);
        assertTrue(results.stream().anyMatch(a -> "Findville".equals(a.getCity())));
    }

    @Test
    @Transactional
    public void testFindAll() {
        List<Address> addresses = addressService.findAll();
        assertNotNull(addresses);
    }

    @Test
    @Transactional
    public void testCannotDeleteAddressInUse() {
        // Create a partner
        NaturalPerson partner = new NaturalPerson();
        partner.setFirstName("Test");
        partner.setLastName("Partner");
        partner.setActive(true);
        Partner createdPartner = partnerService.create(partner);

        // Create an address
        Address address = new Address();
        address.setStreetLine1("456 In Use St");
        address.setCity("Testville");
        address.setPostalCode("12345");
        address.setCountryCode("US");
        Address createdAddress = addressService.create(address);

        // Link address to partner
        AddressDetail addressDetail = new AddressDetail();
        addressDetail.setAddressType("BILLING");
        addressDetail.setPrimary(true);
        addressDetailService.create(createdPartner.getId(), createdAddress.getId(), addressDetail);

        // Try to delete the address - should fail
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            addressService.delete(createdAddress.getId());
        });
        
        assertTrue(exception.getMessage().contains("Cannot delete address"));
        assertTrue(exception.getMessage().contains("in use"));
    }
}
