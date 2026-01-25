package dev.abstratium.partner.dto;

import java.util.List;

import dev.abstratium.partner.entity.Tag;

/**
 * DTO for partner search results that includes a formatted address line.
 * This avoids loading full address details on the frontend.
 */
public class PartnerSearchResult {
    private String id;
    private String partnerNumber;
    private String partnerType;
    private boolean active;
    private String notes;
    private String createdAt;
    private String updatedAt;
    
    // Natural Person fields
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    
    // Legal Entity fields
    private String legalName;
    private String jurisdiction;
    private String registrationNumber;
    private String incorporationDate;
    
    // Address line (formatted from preferred address)
    private String addressLine;
    
    // Contact details (selected based on priority: primary > verified > alphabetical)
    private String email;
    private String phone;
    private String website;
    
    // Tags assigned to this partner
    private List<Tag> tags;
    
    public PartnerSearchResult() {
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
    
    public String getPartnerType() {
        return partnerType;
    }
    
    public void setPartnerType(String partnerType) {
        this.partnerType = partnerType;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getLegalName() {
        return legalName;
    }
    
    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }
    
    public String getJurisdiction() {
        return jurisdiction;
    }
    
    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }
    
    public String getRegistrationNumber() {
        return registrationNumber;
    }
    
    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }
    
    public String getIncorporationDate() {
        return incorporationDate;
    }
    
    public void setIncorporationDate(String incorporationDate) {
        this.incorporationDate = incorporationDate;
    }
    
    public String getAddressLine() {
        return addressLine;
    }
    
    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public List<Tag> getTags() {
        return tags;
    }
    
    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
