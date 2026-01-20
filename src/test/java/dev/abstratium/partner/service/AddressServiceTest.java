package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.Address;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@QuarkusTest
public class AddressServiceTest {

    @Inject
    AddressService addressService;

    @Test
    @Transactional
    public void testCreateAndFindAddress() {
        Address address = new Address();
        address.setStreetLine1("123 Main St");
        address.setCity("Springfield");
        address.setStateProvince("IL");
        address.setPostalCode("62701");
        address.setCountryCode("US");
        address.setIsVerified(false);

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
    public void testUpdateAddress() {
        Address address = new Address();
        address.setStreetLine1("456 Oak Ave");
        address.setCity("Chicago");
        address.setStateProvince("IL");
        address.setPostalCode("60601");
        address.setCountryCode("US");

        Address created = addressService.create(address);
        
        created.setStreetLine1("789 Elm St");
        created.setCity("Aurora");
        
        Address updated = addressService.update(created);
        assertEquals("789 Elm St", updated.getStreetLine1());
        assertEquals("Aurora", updated.getCity());
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
}
