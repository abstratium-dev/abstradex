package dev.abstratium.partner.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "T_partner")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "partner_type", discriminatorType = DiscriminatorType.STRING)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Partner {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "partner_number_seq", unique = true, nullable = false)
    private Long partnerNumberSeq;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<AddressDetail> addressDetails = new HashSet<>();

    @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ContactDetail> contactDetails = new HashSet<>();

    @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<PartnerTag> partnerTags = new HashSet<>();

    @Transient
    private List<dev.abstratium.partner.entity.Tag> tags;

    @OneToMany(mappedBy = "fromPartner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<PartnerRelationship> relationshipsFrom = new HashSet<>();

    @OneToMany(mappedBy = "toPartner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<PartnerRelationship> relationshipsTo = new HashSet<>();

    @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<SMERelationship> smeRelationships = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getPartnerNumberSeq() {
        return partnerNumberSeq;
    }

    public void setPartnerNumberSeq(Long partnerNumberSeq) {
        this.partnerNumberSeq = partnerNumberSeq;
    }

    @Transient
    public String getPartnerNumber() {
        if (partnerNumberSeq == null) {
            return null;
        }
        return String.format("P%08d", partnerNumberSeq);
    }

    /**
     * Returns the partner type discriminator value.
     * This method should be overridden in subclasses to return the specific type.
     * @return the partner type (NATURAL_PERSON or LEGAL_ENTITY)
     */
    @Transient
    public String getPartnerType() {
        // Default implementation - should be overridden in subclasses
        return null;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Set<AddressDetail> getAddressDetails() {
        return addressDetails;
    }

    public void setAddressDetails(Set<AddressDetail> addressDetails) {
        this.addressDetails = addressDetails;
    }

    public Set<ContactDetail> getContactDetails() {
        return contactDetails;
    }

    public void setContactDetails(Set<ContactDetail> contactDetails) {
        this.contactDetails = contactDetails;
    }

    public Set<PartnerTag> getPartnerTags() {
        return partnerTags;
    }

    public void setPartnerTags(Set<PartnerTag> partnerTags) {
        this.partnerTags = partnerTags;
    }

    public Set<PartnerRelationship> getRelationshipsFrom() {
        return relationshipsFrom;
    }

    public void setRelationshipsFrom(Set<PartnerRelationship> relationshipsFrom) {
        this.relationshipsFrom = relationshipsFrom;
    }

    public Set<PartnerRelationship> getRelationshipsTo() {
        return relationshipsTo;
    }

    public void setRelationshipsTo(Set<PartnerRelationship> relationshipsTo) {
        this.relationshipsTo = relationshipsTo;
    }

    public Set<SMERelationship> getSmeRelationships() {
        return smeRelationships;
    }

    public void setSmeRelationships(Set<SMERelationship> smeRelationships) {
        this.smeRelationships = smeRelationships;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
