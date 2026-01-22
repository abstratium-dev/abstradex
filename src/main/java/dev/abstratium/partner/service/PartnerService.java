package dev.abstratium.partner.service;

import java.util.List;
import java.util.stream.Collectors;

import dev.abstratium.partner.dto.PartnerSearchResult;
import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.entity.ContactDetail;
import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.Tag;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PartnerService {

    @Inject
    EntityManager em;

    @Transactional
    public List<Partner> findAll() {
        return em.createQuery("SELECT p FROM Partner p", Partner.class).getResultList();
    }

    @Transactional
    public Partner findById(String id) {
        Partner partner = em.createQuery(
            "SELECT p FROM Partner p LEFT JOIN FETCH p.partnerType WHERE p.id = :id", 
            Partner.class)
            .setParameter("id", id)
            .getResultStream()
            .findFirst()
            .orElse(null);
        return partner;
    }

    @Transactional
    public Partner create(Partner partner) {
        // Ensure partner is always active when first created
        partner.setActive(true);
        
        // Get and increment next partner number from sequence table
        // This works across MySQL, PostgreSQL, H2, and MS SQL
        em.createNativeQuery("UPDATE T_partner_sequence SET next_val = next_val + 1 WHERE id = 1")
            .executeUpdate();
        
        Long nextPartnerNumber = ((Number) em.createNativeQuery(
            "SELECT next_val - 1 FROM T_partner_sequence WHERE id = 1")
            .getSingleResult()).longValue();
        
        partner.setPartnerNumberSeq(nextPartnerNumber);
        
        em.persist(partner);
        em.flush();
        return partner;
    }

    @Transactional
    public Partner update(Partner partner) {
        Partner existing = em.createQuery(
            "SELECT p FROM Partner p LEFT JOIN FETCH p.partnerType WHERE p.id = :id", 
            Partner.class)
            .setParameter("id", partner.getId())
            .getResultStream()
            .findFirst()
            .orElse(null);
        
        if (existing != null) {
            // Preserve audit fields and partner number
            partner.setCreatedAt(existing.getCreatedAt());
            partner.setPartnerNumberSeq(existing.getPartnerNumberSeq());
        }
        Partner updated = em.merge(partner);
        em.flush();
        // Re-fetch to get the updated entity with partnerType loaded
        return findById(updated.getId());
    }

    @Transactional
    public void delete(String id) {
        Partner partner = em.find(Partner.class, id);
        if (partner != null) {
            em.remove(partner);
        }
    }

    @Transactional
    public List<Partner> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll();
        }
        
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        
        // Search across partner fields and subclass fields (NaturalPerson and LegalEntity)
        String jpql = """
            SELECT DISTINCT p FROM Partner p
            LEFT JOIN FETCH p.partnerType
            WHERE CAST(p.partnerNumberSeq AS string) LIKE :search
               OR LOWER(p.notes) LIKE :search
               OR (TYPE(p) = NaturalPerson AND (
                   LOWER(TREAT(p AS NaturalPerson).firstName) LIKE :search
                   OR LOWER(TREAT(p AS NaturalPerson).lastName) LIKE :search
               ))
               OR (TYPE(p) = LegalEntity AND (
                   LOWER(TREAT(p AS LegalEntity).legalName) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).tradingName) LIKE :search
                   OR LOWER(TREAT(p AS LegalEntity).registrationNumber) LIKE :search
               ))
            ORDER BY p.partnerNumberSeq
            """;
        
        return em.createQuery(jpql, Partner.class)
                .setParameter("search", searchPattern)
                .getResultList();
    }
    
    @Transactional
    public List<PartnerSearchResult> searchWithAddress(String searchTerm) {
        List<Partner> partners = search(searchTerm);
        
        return partners.stream()
                .map(this::mapToSearchResult)
                .collect(Collectors.toList());
    }
    
    private PartnerSearchResult mapToSearchResult(Partner partner) {
        PartnerSearchResult result = new PartnerSearchResult();
        result.setId(partner.getId());
        result.setPartnerNumber(partner.getPartnerNumber());
        result.setActive(partner.isActive());
        result.setNotes(partner.getNotes());
        
        // Set type-specific fields
        if (partner instanceof NaturalPerson) {
            NaturalPerson np = (NaturalPerson) partner;
            result.setPartnerType("NaturalPerson");
            result.setFirstName(np.getFirstName());
            result.setLastName(np.getLastName());
            result.setDateOfBirth(np.getDateOfBirth() != null ? np.getDateOfBirth().toString() : null);
        } else if (partner instanceof LegalEntity) {
            LegalEntity le = (LegalEntity) partner;
            result.setPartnerType("LegalEntity");
            result.setLegalName(le.getLegalName());
            result.setJurisdiction(le.getJurisdiction());
            result.setRegistrationNumber(le.getRegistrationNumber());
        }
        
        // Load and format preferred address using lazy loading
        String addressLine = getPreferredAddressLine(partner.getId());
        result.setAddressLine(addressLine);
        
        // Load and set contact details
        setContactDetails(partner.getId(), result);
        
        // Load and set tags
        List<Tag> tags = em.createQuery(
            "SELECT pt.tag FROM PartnerTag pt WHERE pt.partner.id = :partnerId ORDER BY pt.tag.tagName",
            Tag.class)
            .setParameter("partnerId", partner.getId())
            .getResultList();
        result.setTags(tags);
        
        return result;
    }
    
    private String getPreferredAddressLine(String partnerId) {
        // Load address details with addresses using lazy loading
        List<AddressDetail> addressDetails = em.createQuery(
            "SELECT ad FROM AddressDetail ad " +
            "JOIN FETCH ad.address a " +
            "WHERE ad.partner.id = :partnerId",
            AddressDetail.class)
            .setParameter("partnerId", partnerId)
            .getResultList();
        
        if (addressDetails.isEmpty()) {
            return null;
        }
        
        // Find preferred address: primary > billing > shipping > first
        AddressDetail preferred = addressDetails.stream()
                .filter(AddressDetail::isPrimary)
                .findFirst()
                .orElseGet(() -> addressDetails.stream()
                        .filter(ad -> "BILLING".equals(ad.getAddressType()))
                        .findFirst()
                        .orElseGet(() -> addressDetails.stream()
                                .filter(ad -> "SHIPPING".equals(ad.getAddressType()))
                                .findFirst()
                                .orElse(addressDetails.get(0))));
        
        return formatAddressLine(preferred.getAddress());
    }
    
    private String formatAddressLine(Address address) {
        if (address == null) {
            return null;
        }
        
        // Translate country code to country name
        String countryName = address.getCountryCode() != null 
            ? Countries.getCountryName(address.getCountryCode())
            : null;
        
        List<String> parts = java.util.stream.Stream.of(
            address.getStreetLine1(),
            address.getStreetLine2(),
            address.getCity(),
            address.getStateProvince(),
            countryName
        )
         .filter(part -> part != null && !part.trim().isEmpty())
         .collect(Collectors.toList());
        
        return parts.isEmpty() ? null : String.join(", ", parts);
    }
    
    private void setContactDetails(String partnerId, PartnerSearchResult result) {
        // Load all contact details for this partner
        List<ContactDetail> contacts = em.createQuery(
            "SELECT cd FROM ContactDetail cd WHERE cd.partner.id = :partnerId",
            ContactDetail.class)
            .setParameter("partnerId", partnerId)
            .getResultList();
        
        if (contacts.isEmpty()) {
            return;
        }
        
        // Set EMAIL: primary > verified > first alphabetically
        result.setEmail(selectPreferredContact(contacts, "EMAIL"));
        
        // Set PHONE: MOBILE > PHONE, using same priority rules
        String mobile = selectPreferredContact(contacts, "MOBILE");
        String phone = selectPreferredContact(contacts, "PHONE");
        result.setPhone(mobile != null ? mobile : phone);
        
        // Set WEBSITE
        result.setWebsite(selectPreferredContact(contacts, "WEBSITE"));
    }
    
    private String selectPreferredContact(List<ContactDetail> contacts, String contactType) {
        List<ContactDetail> ofType = contacts.stream()
            .filter(cd -> contactType.equals(cd.getContactType()))
            .collect(Collectors.toList());
        
        if (ofType.isEmpty()) {
            return null;
        }
        
        // Priority: primary > verified > alphabetical
        ContactDetail selected = ofType.stream()
            .filter(ContactDetail::isPrimary)
            .findFirst()
            .orElseGet(() -> ofType.stream()
                .filter(ContactDetail::isVerified)
                .min((a, b) -> compareContactValues(a, b))
                .orElseGet(() -> ofType.stream()
                    .min((a, b) -> compareContactValues(a, b))
                    .orElse(null)));
        
        return selected != null ? selected.getContactValue() : null;
    }
    
    private int compareContactValues(ContactDetail a, ContactDetail b) {
        String valA = a.getContactValue() != null ? a.getContactValue() : "";
        String valB = b.getContactValue() != null ? b.getContactValue() : "";
        return valA.compareToIgnoreCase(valB);
    }
}
