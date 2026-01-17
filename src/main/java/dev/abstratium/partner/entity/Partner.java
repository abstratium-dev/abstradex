package dev.abstratium.partner.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_partner")
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Partner {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "partner_number", unique = true, nullable = false, length = 100)
    private String partnerNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "partners"})
    private PartnerType partnerType;

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

    public String getPartnerNumber() {
        return partnerNumber;
    }

    public void setPartnerNumber(String partnerNumber) {
        this.partnerNumber = partnerNumber;
    }

    public PartnerType getPartnerType() {
        return partnerType;
    }

    public void setPartnerType(PartnerType partnerType) {
        this.partnerType = partnerType;
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
}
