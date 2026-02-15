package dev.abstratium.core.service;

import java.util.List;

import dev.abstratium.core.entity.RelationshipType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RelationshipTypeService {

    @PersistenceContext
    EntityManager em;

    public List<RelationshipType> findAll() {
        return em.createQuery(
                "SELECT rt FROM RelationshipType rt ORDER BY rt.typeName",
                RelationshipType.class)
                .getResultList();
    }

    public List<RelationshipType> findActive() {
        return em.createQuery(
                "SELECT rt FROM RelationshipType rt WHERE rt.isActive = true ORDER BY rt.typeName",
                RelationshipType.class)
                .getResultList();
    }

    public List<RelationshipType> search(String searchTerm) {
        return em.createQuery(
                "SELECT rt FROM RelationshipType rt WHERE LOWER(rt.typeName) LIKE LOWER(:searchTerm) OR LOWER(rt.description) LIKE LOWER(:searchTerm) ORDER BY rt.typeName",
                RelationshipType.class)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    public RelationshipType findById(String id) {
        return em.find(RelationshipType.class, id);
    }

    public RelationshipType findByTypeName(String typeName) {
        List<RelationshipType> results = em.createQuery(
                "SELECT rt FROM RelationshipType rt WHERE rt.typeName = :typeName",
                RelationshipType.class)
                .setParameter("typeName", typeName)
                .getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    @Transactional
    public RelationshipType create(RelationshipType relationshipType) {
        // Check if type name already exists
        RelationshipType existing = findByTypeName(relationshipType.getTypeName());
        if (existing != null) {
            throw new IllegalArgumentException("Relationship type with name '" + relationshipType.getTypeName() + "' already exists");
        }

        em.persist(relationshipType);
        return relationshipType;
    }

    @Transactional
    public RelationshipType update(String id, RelationshipType relationshipType) {
        RelationshipType existing = findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Relationship type not found: " + id);
        }

        // Check if new type name conflicts with another type
        if (!existing.getTypeName().equals(relationshipType.getTypeName())) {
            RelationshipType nameConflict = findByTypeName(relationshipType.getTypeName());
            if (nameConflict != null && !nameConflict.getId().equals(id)) {
                throw new IllegalArgumentException("Relationship type with name '" + relationshipType.getTypeName() + "' already exists");
            }
        }

        existing.setTypeName(relationshipType.getTypeName());
        existing.setDescription(relationshipType.getDescription());
        existing.setColorHex(relationshipType.getColorHex());
        existing.setIsActive(relationshipType.getIsActive());

        em.merge(existing);
        return existing;
    }

    @Transactional
    public void delete(String id) {
        RelationshipType relationshipType = findById(id);
        if (relationshipType != null) {
            em.remove(relationshipType);
        }
    }
}
