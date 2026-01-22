package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.PartnerTag;
import dev.abstratium.partner.entity.Tag;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PartnerTagService {

    @Inject
    EntityManager em;

    @Transactional
    public List<PartnerTag> findByPartnerId(String partnerId) {
        return em.createQuery(
            "SELECT pt FROM PartnerTag pt JOIN FETCH pt.tag WHERE pt.partner.id = :partnerId ORDER BY pt.tag.tagName",
            PartnerTag.class)
            .setParameter("partnerId", partnerId)
            .getResultList();
    }

    @Transactional
    public List<Tag> findTagsByPartnerId(String partnerId) {
        return em.createQuery(
            "SELECT pt.tag FROM PartnerTag pt WHERE pt.partner.id = :partnerId ORDER BY pt.tag.tagName",
            Tag.class)
            .setParameter("partnerId", partnerId)
            .getResultList();
    }

    @Transactional
    public PartnerTag findById(String id) {
        return em.find(PartnerTag.class, id);
    }

    @Transactional
    public PartnerTag addTagToPartner(String partnerId, String tagId) {
        Partner partner = em.find(Partner.class, partnerId);
        if (partner == null) {
            throw new IllegalArgumentException("Partner not found: " + partnerId);
        }

        Tag tag = em.find(Tag.class, tagId);
        if (tag == null) {
            throw new IllegalArgumentException("Tag not found: " + tagId);
        }

        // Check if this tag is already assigned to this partner
        Long count = em.createQuery(
            "SELECT COUNT(pt) FROM PartnerTag pt WHERE pt.partner.id = :partnerId AND pt.tag.id = :tagId",
            Long.class)
            .setParameter("partnerId", partnerId)
            .setParameter("tagId", tagId)
            .getSingleResult();

        if (count > 0) {
            throw new IllegalArgumentException("Tag '" + tag.getTagName() + "' is already assigned to this partner");
        }

        PartnerTag partnerTag = new PartnerTag();
        partnerTag.setPartner(partner);
        partnerTag.setTag(tag);

        em.persist(partnerTag);
        em.flush();
        return partnerTag;
    }

    @Transactional
    public void removeTagFromPartner(String partnerId, String tagId) {
        int deleted = em.createQuery(
            "DELETE FROM PartnerTag pt WHERE pt.partner.id = :partnerId AND pt.tag.id = :tagId")
            .setParameter("partnerId", partnerId)
            .setParameter("tagId", tagId)
            .executeUpdate();

        if (deleted == 0) {
            throw new IllegalArgumentException("Tag assignment not found for partner");
        }
    }

    @Transactional
    public void delete(String id) {
        PartnerTag partnerTag = em.find(PartnerTag.class, id);
        if (partnerTag != null) {
            em.remove(partnerTag);
        }
    }
}
