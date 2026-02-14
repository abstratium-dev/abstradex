package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.PartnerRelationship;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PartnerRelationshipService {

    @PersistenceContext
    EntityManager em;

    public List<PartnerRelationship> findByPartnerId(String partnerId) {
        return em.createQuery(
                "SELECT pr FROM PartnerRelationship pr " +
                "LEFT JOIN FETCH pr.fromPartner " +
                "LEFT JOIN FETCH pr.toPartner " +
                "WHERE pr.fromPartner.id = :partnerId OR pr.toPartner.id = :partnerId " +
                "ORDER BY pr.effectiveFrom DESC",
                PartnerRelationship.class)
                .setParameter("partnerId", partnerId)
                .getResultList();
    }

    public PartnerRelationship findById(String id) {
        return em.find(PartnerRelationship.class, id);
    }

    @Transactional
    public PartnerRelationship create(String fromPartnerId, String toPartnerId, PartnerRelationship relationship) {
        Partner fromPartner = em.find(Partner.class, fromPartnerId);
        if (fromPartner == null) {
            throw new IllegalArgumentException("From partner not found: " + fromPartnerId);
        }
        
        Partner toPartner = em.find(Partner.class, toPartnerId);
        if (toPartner == null) {
            throw new IllegalArgumentException("To partner not found: " + toPartnerId);
        }
        
        relationship.setFromPartner(fromPartner);
        relationship.setToPartner(toPartner);
        em.persist(relationship);
        return relationship;
    }

    @Transactional
    public void delete(String id) {
        PartnerRelationship relationship = em.find(PartnerRelationship.class, id);
        if (relationship != null) {
            em.remove(relationship);
        }
    }
}
