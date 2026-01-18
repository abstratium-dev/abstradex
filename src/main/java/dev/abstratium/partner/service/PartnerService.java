package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Partner;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PartnerService {

    @Inject
    EntityManager em;

    @Transactional
    public List<Partner> findAll() {
        return em.createQuery("SELECT p FROM Partner p", Partner.class).getResultList();
    }

    @Transactional
    public Partner findById(String id) {
        Partner partner = em.createQuery(
            "SELECT p FROM Partner p LEFT JOIN FETCH p.partnerType WHERE p.id = :id", 
            Partner.class)
            .setParameter("id", id)
            .getResultStream()
            .findFirst()
            .orElse(null);
        return partner;
    }

    @Transactional
    public Partner create(Partner partner) {
        // Ensure partner is always active when first created
        partner.setActive(true);
        
        // Get and increment next partner number from sequence table
        // This works across MySQL, PostgreSQL, H2, and MS SQL
        em.createNativeQuery("UPDATE T_partner_sequence SET next_val = next_val + 1 WHERE id = 1")
            .executeUpdate();
        
        Long nextPartnerNumber = ((Number) em.createNativeQuery(
            "SELECT next_val - 1 FROM T_partner_sequence WHERE id = 1")
            .getSingleResult()).longValue();
        
        partner.setPartnerNumberSeq(nextPartnerNumber);
        
        em.persist(partner);
        em.flush();
        return partner;
    }

    @Transactional
    public Partner update(Partner partner) {
        Partner existing = em.createQuery(
            "SELECT p FROM Partner p LEFT JOIN FETCH p.partnerType WHERE p.id = :id", 
            Partner.class)
            .setParameter("id", partner.getId())
            .getResultStream()
            .findFirst()
            .orElse(null);
        
        if (existing != null) {
            // Preserve audit fields and partner number
            partner.setCreatedAt(existing.getCreatedAt());
            partner.setPartnerNumberSeq(existing.getPartnerNumberSeq());
        }
        Partner updated = em.merge(partner);
        em.flush();
        // Re-fetch to get the updated entity with partnerType loaded
        return findById(updated.getId());
    }

    @Transactional
    public void delete(String id) {
        Partner partner = em.find(Partner.class, id);
        if (partner != null) {
            em.remove(partner);
        }
    }

    @Transactional
    public List<Partner> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll();
        }
        
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        
        // Search across partner fields and subclass fields (NaturalPerson and LegalEntity)
        String jpql = """
            SELECT DISTINCT p FROM Partner p
            LEFT JOIN FETCH p.partnerType
            WHERE CAST(p.partnerNumberSeq AS string) LIKE :search
               OR LOWER(p.notes) LIKE :search
               OR (TYPE(p) = NaturalPerson AND (
                   LOWER(TREAT(p AS NaturalPerson).firstName) LIKE :search
                   OR LOWER(TREAT(p AS NaturalPerson).lastName) LIKE :search
               ))
               OR (TYPE(p) = LegalEntity AND (
                   LOWER(TREAT(p AS LegalEntity).legalName) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).tradingName) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).registrationNumber) LIKE :search
               ))
            ORDER BY p.partnerNumberSeq
            """;
        
        return em.createQuery(jpql, Partner.class)
                .setParameter("search", searchPattern)
                .getResultList();
    }
}
