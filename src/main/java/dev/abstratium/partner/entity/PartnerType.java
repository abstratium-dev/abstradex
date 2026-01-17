package dev.abstratium.partner.entity;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_partner_type")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PartnerType {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "type_code", unique = true, nullable = false, length = 50)
    private String typeCode;

    @Column(name = "description", length = 255)
    private String description;

    @OneToMany(mappedBy = "partnerType", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("partnerType")
    private Set<Partner> partners = new HashSet<>();

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

    public String getTypeCode() {
        return typeCode;
    }

    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Partner> getPartners() {
        return partners;
    }

    public void setPartners(Set<Partner> partners) {
        this.partners = partners;
    }
}
