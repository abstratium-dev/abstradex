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
        em.persist(partner);
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
            // Preserve audit fields
            partner.setCreatedAt(existing.getCreatedAt());
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
            WHERE LOWER(p.partnerNumber) LIKE :search
               OR LOWER(p.notes) LIKE :search
               OR (TYPE(p) = NaturalPerson AND (
                   LOWER(TREAT(p AS NaturalPerson).firstName) LIKE :search
                   OR LOWER(TREAT(p AS NaturalPerson).lastName) LIKE :search
                   OR LOWER(TREAT(p AS NaturalPerson).email) LIKE :search
               ))
               OR (TYPE(p) = LegalEntity AND (
                   LOWER(TREAT(p AS LegalEntity).companyName) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).registrationNumber) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).email) LIKE :search
               ))
            ORDER BY p.partnerNumber
            """;
        
        return em.createQuery(jpql, Partner.class)
                .setParameter("search", searchPattern)
                .getResultList();
    }
}
