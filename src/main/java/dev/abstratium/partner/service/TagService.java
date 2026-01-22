package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Tag;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TagService {

    @Inject
    EntityManager em;

    @Transactional
    public List<Tag> findAll() {
        return em.createQuery("SELECT t FROM Tag t ORDER BY t.tagName", Tag.class)
                .getResultList();
    }

    @Transactional
    public Tag findById(String id) {
        return em.find(Tag.class, id);
    }

    @Transactional
    public Tag findByName(String tagName) {
        return em.createQuery("SELECT t FROM Tag t WHERE t.tagName = :tagName", Tag.class)
                .setParameter("tagName", tagName)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public Tag create(Tag tag) {
        // Check if tag with same name already exists
        Tag existing = findByName(tag.getTagName());
        if (existing != null) {
            throw new IllegalArgumentException("Tag with name '" + tag.getTagName() + "' already exists");
        }
        
        em.persist(tag);
        em.flush();
        return tag;
    }

    @Transactional
    public Tag update(String id, Tag updatedTag) {
        Tag existingTag = em.find(Tag.class, id);
        if (existingTag == null) {
            throw new IllegalArgumentException("Tag not found: " + id);
        }
        
        // Check if another tag with the same name exists
        if (!existingTag.getTagName().equals(updatedTag.getTagName())) {
            Tag duplicate = findByName(updatedTag.getTagName());
            if (duplicate != null && !duplicate.getId().equals(id)) {
                throw new IllegalArgumentException("Tag with name '" + updatedTag.getTagName() + "' already exists");
            }
        }
        
        existingTag.setTagName(updatedTag.getTagName());
        existingTag.setColorHex(updatedTag.getColorHex());
        existingTag.setDescription(updatedTag.getDescription());
        
        em.merge(existingTag);
        return existingTag;
    }

    @Transactional
    public void delete(String id) {
        Tag tag = em.find(Tag.class, id);
        if (tag != null) {
            // Delete all partner_tag associations first
            em.createQuery("DELETE FROM PartnerTag pt WHERE pt.tag.id = :tagId")
                .setParameter("tagId", id)
                .executeUpdate();
            
            em.remove(tag);
        }
    }

    @Transactional
    public List<Tag> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll();
        }
        
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        return em.createQuery(
            "SELECT t FROM Tag t WHERE LOWER(t.tagName) LIKE :search OR LOWER(t.description) LIKE :search ORDER BY t.tagName",
            Tag.class)
            .setParameter("search", searchPattern)
            .getResultList();
    }
}
