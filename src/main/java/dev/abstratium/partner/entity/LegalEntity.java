package dev.abstratium.partner.entity;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_legal_entity")
@PrimaryKeyJoinColumn(name = "partner_id")
public class LegalEntity extends Partner {

    @Column(name = "legal_name", length = 255)
    private String legalName;

    @Column(name = "trading_name", length = 255)
    private String tradingName;

    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "legal_form", length = 50)
    private String legalForm;

    @Column(name = "incorporation_date")
    private LocalDate incorporationDate;

    @Column(name = "jurisdiction", length = 100)
    private String jurisdiction;

    @ManyToMany(mappedBy = "employers", fetch = FetchType.LAZY)
    private Set<NaturalPerson> employees = new HashSet<>();

    // Getters and setters
    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getTradingName() {
        return tradingName;
    }

    public void setTradingName(String tradingName) {
        this.tradingName = tradingName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getLegalForm() {
        return legalForm;
    }

    public void setLegalForm(String legalForm) {
        this.legalForm = legalForm;
    }

    public LocalDate getIncorporationDate() {
        return incorporationDate;
    }

    public void setIncorporationDate(LocalDate incorporationDate) {
        this.incorporationDate = incorporationDate;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public Set<NaturalPerson> getEmployees() {
        return employees;
    }

    public void setEmployees(Set<NaturalPerson> employees) {
        this.employees = employees;
    }
}
