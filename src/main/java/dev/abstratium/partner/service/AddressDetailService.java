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
