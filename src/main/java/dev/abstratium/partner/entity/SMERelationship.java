package dev.abstratium.partner.entity;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_sme_relationship")
public class SMERelationship {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Column(name = "relationship_type", length = 50)
    private String relationshipType;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "relationship_start")
    private LocalDate relationshipStart;

    @Column(name = "relationship_end")
    private LocalDate relationshipEnd;

    @Column(name = "payment_terms", length = 255)
    private String paymentTerms;

    @Column(name = "credit_limit", length = 50)
    private String creditLimit;

    @Column(name = "priority_level")
    private Integer priorityLevel;

    @Column(name = "account_manager", length = 100)
    private String accountManager;

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

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getRelationshipStart() {
        return relationshipStart;
    }

    public void setRelationshipStart(LocalDate relationshipStart) {
        this.relationshipStart = relationshipStart;
    }

    public LocalDate getRelationshipEnd() {
        return relationshipEnd;
    }

    public void setRelationshipEnd(LocalDate relationshipEnd) {
        this.relationshipEnd = relationshipEnd;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(String creditLimit) {
        this.creditLimit = creditLimit;
    }

    public Integer getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(Integer priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public String getAccountManager() {
        return accountManager;
    }

    public void setAccountManager(String accountManager) {
        this.accountManager = accountManager;
    }
}
