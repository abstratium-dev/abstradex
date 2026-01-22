package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.ContactDetail;
import dev.abstratium.partner.entity.Partner;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
public class ContactDetailServiceTest {

    @Inject
    ContactDetailService contactDetailService;

    @Inject
    PartnerService partnerService;

    @Inject
    EntityManager em;

    @Test
    @Transactional
    public void testCreateContactDetail() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1001L);
        em.persist(partner);
        em.flush();

        // Create contact detail
        ContactDetail contactDetail = new ContactDetail();
        contactDetail.setContactType("EMAIL");
        contactDetail.setContactValue("test@example.com");
        contactDetail.setLabel("Work");
        contactDetail.setPrimary(true);
        contactDetail.setVerified(true);

        ContactDetail created = contactDetailService.create(partner.getId(), contactDetail);
        em.flush();
        
        assertNotNull(created.getId());
        assertEquals("EMAIL", created.getContactType());
        assertEquals("test@example.com", created.getContactValue());
        assertEquals("Work", created.getLabel());
        assertTrue(created.isPrimary());
        assertTrue(created.isVerified());
    }

    @Test
    @Transactional
    public void testIsPrimaryPersistence() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1002L);
        em.persist(partner);
        em.flush();

        // Create contact detail with isPrimary = true
        ContactDetail contactDetail = new ContactDetail();
        contactDetail.setContactType("PHONE");
        contactDetail.setContactValue("+1234567890");
        contactDetail.setPrimary(true);

        ContactDetail created = contactDetailService.create(partner.getId(), contactDetail);
        em.flush();
        
        assertNotNull(created.getId());
        assertTrue(created.isPrimary(), "isPrimary should be true after creation");

        // Verify by fetching from database
        em.clear();
        ContactDetail found = contactDetailService.findById(created.getId());
        assertNotNull(found);
        assertTrue(found.isPrimary(), "isPrimary should be true when fetched from database");
    }

    @Test
    @Transactional
    public void testIsVerifiedPersistence() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1003L);
        em.persist(partner);
        em.flush();

        // Create contact detail with isVerified = true
        ContactDetail contactDetail = new ContactDetail();
        contactDetail.setContactType("EMAIL");
        contactDetail.setContactValue("verified@example.com");
        contactDetail.setVerified(true);

        ContactDetail created = contactDetailService.create(partner.getId(), contactDetail);
        em.flush();
        
        assertNotNull(created.getId());
        assertTrue(created.isVerified(), "isVerified should be true after creation");

        // Verify by fetching from database
        em.clear();
        ContactDetail found = contactDetailService.findById(created.getId());
        assertNotNull(found);
        assertTrue(found.isVerified(), "isVerified should be true when fetched from database");
    }

    @Test
    @Transactional
    public void testOnlyOnePrimaryContactPerTypePerPartner() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1004L);
        em.persist(partner);
        em.flush();

        // Create first email contact as primary
        ContactDetail contact1 = new ContactDetail();
        contact1.setContactType("EMAIL");
        contact1.setContactValue("first@example.com");
        contact1.setPrimary(true);
        ContactDetail created1 = contactDetailService.create(partner.getId(), contact1);
        em.flush();
        assertTrue(created1.isPrimary());

        // Create second email contact as primary - should unset the first one
        ContactDetail contact2 = new ContactDetail();
        contact2.setContactType("EMAIL");
        contact2.setContactValue("second@example.com");
        contact2.setPrimary(true);
        ContactDetail created2 = contactDetailService.create(partner.getId(), contact2);
        em.flush();
        assertTrue(created2.isPrimary());

        // Verify first contact is no longer primary
        em.clear();
        ContactDetail found1 = contactDetailService.findById(created1.getId());
        assertFalse(found1.isPrimary(), "First email should no longer be primary");

        ContactDetail found2 = contactDetailService.findById(created2.getId());
        assertTrue(found2.isPrimary(), "Second email should be primary");
    }

    @Test
    @Transactional
    public void testMultiplePrimaryContactsOfDifferentTypes() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1005L);
        em.persist(partner);
        em.flush();

        // Create primary email contact
        ContactDetail emailContact = new ContactDetail();
        emailContact.setContactType("EMAIL");
        emailContact.setContactValue("email@example.com");
        emailContact.setPrimary(true);
        ContactDetail createdEmail = contactDetailService.create(partner.getId(), emailContact);
        em.flush();

        // Create primary phone contact - should not affect email primary status
        ContactDetail phoneContact = new ContactDetail();
        phoneContact.setContactType("PHONE");
        phoneContact.setContactValue("+1234567890");
        phoneContact.setPrimary(true);
        ContactDetail createdPhone = contactDetailService.create(partner.getId(), phoneContact);
        em.flush();

        // Verify both are still primary (different types)
        em.clear();
        ContactDetail foundEmail = contactDetailService.findById(createdEmail.getId());
        ContactDetail foundPhone = contactDetailService.findById(createdPhone.getId());
        
        assertTrue(foundEmail.isPrimary(), "Email should still be primary");
        assertTrue(foundPhone.isPrimary(), "Phone should be primary");
    }

    @Test
    @Transactional
    public void testFindByPartnerId() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1006L);
        em.persist(partner);
        em.flush();

        // Create multiple contacts
        ContactDetail contact1 = new ContactDetail();
        contact1.setContactType("EMAIL");
        contact1.setContactValue("email1@example.com");
        contact1.setPrimary(true);
        contactDetailService.create(partner.getId(), contact1);

        ContactDetail contact2 = new ContactDetail();
        contact2.setContactType("PHONE");
        contact2.setContactValue("+1111111111");
        contactDetailService.create(partner.getId(), contact2);

        ContactDetail contact3 = new ContactDetail();
        contact3.setContactType("MOBILE");
        contact3.setContactValue("+2222222222");
        contactDetailService.create(partner.getId(), contact3);

        em.flush();
        em.clear();

        // Find all contacts for partner
        List<ContactDetail> contacts = contactDetailService.findByPartnerId(partner.getId());
        assertEquals(3, contacts.size());
        
        // Verify ordering (primary first, then by type)
        assertTrue(contacts.get(0).isPrimary(), "First contact should be primary");
    }

    @Test
    @Transactional
    public void testFindByPartnerIdAndType() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1007L);
        em.persist(partner);
        em.flush();

        // Create multiple email contacts
        ContactDetail email1 = new ContactDetail();
        email1.setContactType("EMAIL");
        email1.setContactValue("email1@example.com");
        email1.setPrimary(true);
        contactDetailService.create(partner.getId(), email1);

        ContactDetail email2 = new ContactDetail();
        email2.setContactType("EMAIL");
        email2.setContactValue("email2@example.com");
        contactDetailService.create(partner.getId(), email2);

        ContactDetail phone = new ContactDetail();
        phone.setContactType("PHONE");
        phone.setContactValue("+1234567890");
        contactDetailService.create(partner.getId(), phone);

        em.flush();
        em.clear();

        // Find only email contacts
        List<ContactDetail> emailContacts = contactDetailService.findByPartnerIdAndType(partner.getId(), "EMAIL");
        assertEquals(2, emailContacts.size());
        assertTrue(emailContacts.stream().allMatch(c -> "EMAIL".equals(c.getContactType())));
    }

    @Test
    @Transactional
    public void testFindPrimaryContactForPartner() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1008L);
        em.persist(partner);
        em.flush();

        // Create primary email contact
        ContactDetail primaryEmail = new ContactDetail();
        primaryEmail.setContactType("EMAIL");
        primaryEmail.setContactValue("primary@example.com");
        primaryEmail.setPrimary(true);
        contactDetailService.create(partner.getId(), primaryEmail);

        // Create non-primary email contact
        ContactDetail secondaryEmail = new ContactDetail();
        secondaryEmail.setContactType("EMAIL");
        secondaryEmail.setContactValue("secondary@example.com");
        secondaryEmail.setPrimary(false);
        contactDetailService.create(partner.getId(), secondaryEmail);

        em.flush();
        em.clear();

        // Find primary email
        ContactDetail found = contactDetailService.findPrimaryContactForPartner(partner.getId(), "EMAIL");
        assertNotNull(found);
        assertEquals("primary@example.com", found.getContactValue());
        assertTrue(found.isPrimary());
    }

    @Test
    @Transactional
    public void testUpdateContactDetail() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1009L);
        em.persist(partner);
        em.flush();

        // Create contact detail
        ContactDetail contact = new ContactDetail();
        contact.setContactType("EMAIL");
        contact.setContactValue("old@example.com");
        contact.setLabel("Work");
        contact.setPrimary(false);
        contact.setVerified(false);
        ContactDetail created = contactDetailService.create(partner.getId(), contact);
        em.flush();
        em.clear();

        // Update contact detail
        ContactDetail updated = new ContactDetail();
        updated.setContactType("EMAIL");
        updated.setContactValue("new@example.com");
        updated.setLabel("Personal");
        updated.setPrimary(true);
        updated.setVerified(true);
        
        ContactDetail result = contactDetailService.update(created.getId(), updated);
        em.flush();
        em.clear();

        // Verify update
        ContactDetail found = contactDetailService.findById(created.getId());
        assertEquals("new@example.com", found.getContactValue());
        assertEquals("Personal", found.getLabel());
        assertTrue(found.isPrimary());
        assertTrue(found.isVerified());
    }

    @Test
    @Transactional
    public void testDeleteContactDetail() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1010L);
        em.persist(partner);
        em.flush();

        // Create contact detail
        ContactDetail contact = new ContactDetail();
        contact.setContactType("EMAIL");
        contact.setContactValue("delete@example.com");
        ContactDetail created = contactDetailService.create(partner.getId(), contact);
        em.flush();
        String contactId = created.getId();
        em.clear();

        // Delete contact detail
        contactDetailService.delete(contactId);
        em.flush();
        em.clear();

        // Verify deletion
        ContactDetail found = contactDetailService.findById(contactId);
        assertNull(found);
    }

    @Test
    @Transactional
    public void testSearchContactDetails() {
        // Create a partner
        Partner partner = new Partner();
        partner.setActive(true);
        partner.setPartnerNumberSeq(1011L);
        em.persist(partner);
        em.flush();

        // Create contacts with searchable values
        ContactDetail contact1 = new ContactDetail();
        contact1.setContactType("EMAIL");
        contact1.setContactValue("john.doe@example.com");
        contact1.setLabel("Work");
        contactDetailService.create(partner.getId(), contact1);

        ContactDetail contact2 = new ContactDetail();
        contact2.setContactType("EMAIL");
        contact2.setContactValue("jane.smith@example.com");
        contact2.setLabel("Personal");
        contactDetailService.create(partner.getId(), contact2);

        ContactDetail contact3 = new ContactDetail();
        contact3.setContactType("PHONE");
        contact3.setContactValue("+1234567890");
        contact3.setLabel("Office");
        contactDetailService.create(partner.getId(), contact3);

        em.flush();
        em.clear();

        // Search by email value
        List<ContactDetail> results = contactDetailService.search("john.doe");
        assertEquals(1, results.size());
        assertEquals("john.doe@example.com", results.get(0).getContactValue());

        // Search by label
        List<ContactDetail> labelResults = contactDetailService.search("work");
        assertEquals(1, labelResults.size());
        assertEquals("Work", labelResults.get(0).getLabel());

        // Search with no results
        List<ContactDetail> noResults = contactDetailService.search("nonexistent");
        assertTrue(noResults.isEmpty());
    }

    @Test
    @Transactional
    public void testCreateContactDetailWithInvalidPartner() {
        ContactDetail contact = new ContactDetail();
        contact.setContactType("EMAIL");
        contact.setContactValue("test@example.com");

        assertThrows(IllegalArgumentException.class, () -> {
            contactDetailService.create("invalid-partner-id", contact);
        });
    }

    @Test
    @Transactional
    public void testUpdateContactDetailWithInvalidId() {
        ContactDetail contact = new ContactDetail();
        contact.setContactType("EMAIL");
        contact.setContactValue("test@example.com");

        assertThrows(IllegalArgumentException.class, () -> {
            contactDetailService.update("invalid-contact-id", contact);
        });
    }
}
