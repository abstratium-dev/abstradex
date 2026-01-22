package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.ContactDetail;
import dev.abstratium.partner.entity.Partner;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ContactDetailService {

    @PersistenceContext
    EntityManager em;

    public List<ContactDetail> findByPartnerId(String partnerId) {
        return em.createQuery(
                "SELECT cd FROM ContactDetail cd " +
                "WHERE cd.partner.id = :partnerId " +
                "ORDER BY cd.isPrimary DESC, cd.contactType",
                ContactDetail.class)
                .setParameter("partnerId", partnerId)
                .getResultList();
    }

    public ContactDetail findPrimaryContactForPartner(String partnerId, String contactType) {
        List<ContactDetail> primaryContacts = em.createQuery(
                "SELECT cd FROM ContactDetail cd " +
                "WHERE cd.partner.id = :partnerId " +
                "AND cd.contactType = :contactType " +
                "AND cd.isPrimary = true",
                ContactDetail.class)
                .setParameter("partnerId", partnerId)
                .setParameter("contactType", contactType)
                .setMaxResults(1)
                .getResultList();
        
        return primaryContacts.isEmpty() ? null : primaryContacts.get(0);
    }

    public List<ContactDetail> findByPartnerIdAndType(String partnerId, String contactType) {
        return em.createQuery(
                "SELECT cd FROM ContactDetail cd " +
                "WHERE cd.partner.id = :partnerId " +
                "AND cd.contactType = :contactType " +
                "ORDER BY cd.isPrimary DESC",
                ContactDetail.class)
                .setParameter("partnerId", partnerId)
                .setParameter("contactType", contactType)
                .getResultList();
    }

    public ContactDetail findById(String id) {
        return em.find(ContactDetail.class, id);
    }

    @Transactional
    public ContactDetail create(String partnerId, ContactDetail contactDetail) {
        Partner partner = em.find(Partner.class, partnerId);
        if (partner == null) {
            throw new IllegalArgumentException("Partner not found: " + partnerId);
        }
        
        // If this contact is being set as primary, unset any existing primary contacts 
        // of the same type for this partner
        if (contactDetail.isPrimary() && contactDetail.getContactType() != null) {
            em.createQuery(
                "UPDATE ContactDetail cd SET cd.isPrimary = false " +
                "WHERE cd.partner.id = :partnerId " +
                "AND cd.contactType = :contactType " +
                "AND cd.isPrimary = true")
                .setParameter("partnerId", partnerId)
                .setParameter("contactType", contactDetail.getContactType())
                .executeUpdate();
        }
        
        contactDetail.setPartner(partner);
        em.persist(contactDetail);
        return contactDetail;
    }

    @Transactional
    public ContactDetail update(String id, ContactDetail updatedContactDetail) {
        ContactDetail existingContactDetail = em.find(ContactDetail.class, id);
        if (existingContactDetail == null) {
            throw new IllegalArgumentException("ContactDetail not found: " + id);
        }
        
        // If this contact is being set as primary, unset any existing primary contacts 
        // of the same type for this partner
        if (updatedContactDetail.isPrimary() && updatedContactDetail.getContactType() != null) {
            em.createQuery(
                "UPDATE ContactDetail cd SET cd.isPrimary = false " +
                "WHERE cd.partner.id = :partnerId " +
                "AND cd.contactType = :contactType " +
                "AND cd.isPrimary = true " +
                "AND cd.id != :currentId")
                .setParameter("partnerId", existingContactDetail.getPartner().getId())
                .setParameter("contactType", updatedContactDetail.getContactType())
                .setParameter("currentId", id)
                .executeUpdate();
        }
        
        existingContactDetail.setContactType(updatedContactDetail.getContactType());
        existingContactDetail.setContactValue(updatedContactDetail.getContactValue());
        existingContactDetail.setLabel(updatedContactDetail.getLabel());
        existingContactDetail.setPrimary(updatedContactDetail.isPrimary());
        existingContactDetail.setVerified(updatedContactDetail.isVerified());
        
        em.merge(existingContactDetail);
        return existingContactDetail;
    }

    @Transactional
    public void delete(String id) {
        ContactDetail contactDetail = em.find(ContactDetail.class, id);
        if (contactDetail != null) {
            em.remove(contactDetail);
        }
    }

    public List<ContactDetail> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return List.of();
        }
        
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        return em.createQuery(
                "SELECT cd FROM ContactDetail cd " +
                "WHERE LOWER(cd.contactValue) LIKE :searchPattern " +
                "OR LOWER(cd.label) LIKE :searchPattern " +
                "ORDER BY cd.isPrimary DESC, cd.contactType",
                ContactDetail.class)
                .setParameter("searchPattern", searchPattern)
                .getResultList();
    }
}
