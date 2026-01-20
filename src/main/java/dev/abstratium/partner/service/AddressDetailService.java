package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.entity.Partner;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AddressDetailService {

    @PersistenceContext
    EntityManager em;

    public List<AddressDetail> findByPartnerId(String partnerId) {
        return em.createQuery(
                "SELECT ad FROM AddressDetail ad " +
                "JOIN FETCH ad.address " +
                "WHERE ad.partner.id = :partnerId " +
                "ORDER BY ad.isPrimary DESC, ad.addressType",
                AddressDetail.class)
                .setParameter("partnerId", partnerId)
                .getResultList();
    }

    public AddressDetail findPreferredAddressForPartner(String partnerId) {
        // Try to find primary address first
        List<AddressDetail> primaryAddresses = em.createQuery(
                "SELECT ad FROM AddressDetail ad " +
                "JOIN FETCH ad.address " +
                "WHERE ad.partner.id = :partnerId AND ad.isPrimary = true",
                AddressDetail.class)
                .setParameter("partnerId", partnerId)
                .setMaxResults(1)
                .getResultList();
        
        if (!primaryAddresses.isEmpty()) {
            return primaryAddresses.get(0);
        }
        
        // Try to find billing address
        List<AddressDetail> billingAddresses = em.createQuery(
                "SELECT ad FROM AddressDetail ad " +
                "JOIN FETCH ad.address " +
                "WHERE ad.partner.id = :partnerId AND ad.addressType = 'BILLING'",
                AddressDetail.class)
                .setParameter("partnerId", partnerId)
                .setMaxResults(1)
                .getResultList();
        
        if (!billingAddresses.isEmpty()) {
            return billingAddresses.get(0);
        }
        
        // Try to find shipping address
        List<AddressDetail> shippingAddresses = em.createQuery(
                "SELECT ad FROM AddressDetail ad " +
                "JOIN FETCH ad.address " +
                "WHERE ad.partner.id = :partnerId AND ad.addressType = 'SHIPPING'",
                AddressDetail.class)
                .setParameter("partnerId", partnerId)
                .setMaxResults(1)
                .getResultList();
        
        if (!shippingAddresses.isEmpty()) {
            return shippingAddresses.get(0);
        }
        
        return null;
    }

    public AddressDetail findById(String id) {
        return em.find(AddressDetail.class, id);
    }

    @Transactional
    public AddressDetail create(String partnerId, String addressId, AddressDetail addressDetail) {
        Partner partner = em.find(Partner.class, partnerId);
        if (partner == null) {
            throw new IllegalArgumentException("Partner not found: " + partnerId);
        }
        
        Address address = em.find(Address.class, addressId);
        if (address == null) {
            throw new IllegalArgumentException("Address not found: " + addressId);
        }
        
        // If this address is being set as primary, unset any existing primary addresses for this partner
        if (addressDetail.isPrimary()) {
            em.createQuery("UPDATE AddressDetail ad SET ad.isPrimary = false WHERE ad.partner.id = :partnerId AND ad.isPrimary = true")
                .setParameter("partnerId", partnerId)
                .executeUpdate();
        }
        
        addressDetail.setPartner(partner);
        addressDetail.setAddress(address);
        em.persist(addressDetail);
        return addressDetail;
    }

    @Transactional
    public void delete(String id) {
        AddressDetail addressDetail = em.find(AddressDetail.class, id);
        if (addressDetail != null) {
            em.remove(addressDetail);
        }
    }
}
