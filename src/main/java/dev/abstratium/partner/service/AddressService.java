package dev.abstratium.partner.service;

import java.util.List;

import dev.abstratium.partner.entity.Address;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AddressService {

    @PersistenceContext
    EntityManager em;

    @Inject
    AddressDetailService addressDetailService;

    public List<Address> findAll() {
        return em.createQuery("SELECT a FROM Address a ORDER BY a.city, a.streetLine1", Address.class)
                .getResultList();
    }

    public Address findById(String id) {
        return em.find(Address.class, id);
    }

    public List<Address> search(String searchTerm) {
        String pattern = "%" + searchTerm.toLowerCase() + "%";
        return em.createQuery(
                "SELECT a FROM Address a WHERE " +
                "LOWER(a.streetLine1) LIKE :pattern OR " +
                "LOWER(a.streetLine2) LIKE :pattern OR " +
                "LOWER(a.city) LIKE :pattern OR " +
                "LOWER(a.stateProvince) LIKE :pattern OR " +
                "LOWER(a.postalCode) LIKE :pattern OR " +
                "LOWER(a.countryCode) LIKE :pattern " +
                "ORDER BY a.city, a.streetLine1",
                Address.class)
                .setParameter("pattern", pattern)
                .getResultList();
    }

    @Transactional
    public Address create(Address address) {
        em.persist(address);
        return address;
    }

    @Transactional
    public void delete(String id) {
        Address address = em.find(Address.class, id);
        if (address != null) {
            long usageCount = addressDetailService.countByAddressId(id);
            if (usageCount > 0) {
                throw new IllegalStateException("Cannot delete address: it is currently in use by " + usageCount + " partner(s)");
            }
            em.remove(address);
        }
    }
}
