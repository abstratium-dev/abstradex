package dev.abstratium.partner.entity;

import java.time.LocalDate;
import java.util.UUID;

import dev.abstratium.core.entity.RelationshipType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_partner_relationship")
public class PartnerRelationship {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_partner_id", nullable = false)
    private Partner fromPartner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_partner_id", nullable = false)
    private Partner toPartner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "relationship_type_id")
    private RelationshipType relationshipType;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Partner getFromPartner() {
        return fromPartner;
    }

    public void setFromPartner(Partner fromPartner) {
        this.fromPartner = fromPartner;
    }

    public Partner getToPartner() {
        return toPartner;
    }

    public void setToPartner(Partner toPartner) {
        this.toPartner = toPartner;
    }

    public RelationshipType getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(RelationshipType relationshipType) {
        this.relationshipType = relationshipType;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
