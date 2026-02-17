package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.core.entity.RelationshipType;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.PartnerRelationship;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@QuarkusTest
public class RelationshipTypeServiceTest {

    @Inject
    RelationshipTypeService relationshipTypeService;

    @Inject
    PartnerRelationshipService partnerRelationshipService;

    @Inject
    PartnerService partnerService;

    @Test
    @Transactional
    public void testCreateAndFindRelationshipType() {
        RelationshipType type = new RelationshipType();
        type.setTypeName("Subsidiary");
        type.setDescription("Subsidiary relationship");
        type.setColorHex("#00FF00");
        type.setIsActive(true);

        RelationshipType created = relationshipTypeService.create(type);
        assertNotNull(created.getId());
        assertEquals("Subsidiary", created.getTypeName());
        assertEquals("#00FF00", created.getColorHex());

        RelationshipType found = relationshipTypeService.findById(created.getId());
        assertNotNull(found);
        assertEquals(created.getId(), found.getId());
        assertEquals("Subsidiary", found.getTypeName());
    }

    @Test
    @Transactional
    public void testDeleteRelationshipType() {
        RelationshipType type = new RelationshipType();
        type.setTypeName("Temporary");
        type.setDescription("Temporary relationship");
        type.setIsActive(true);

        RelationshipType created = relationshipTypeService.create(type);
        String id = created.getId();
        
        relationshipTypeService.delete(id);
        
        RelationshipType found = relationshipTypeService.findById(id);
        assertNull(found);
    }

    @Test
    @Transactional
    public void testCannotDeleteRelationshipTypeInUse() {
        // Create two partners
        NaturalPerson partner1 = new NaturalPerson();
        partner1.setFirstName("Partner");
        partner1.setLastName("One");
        partner1.setActive(true);
        Partner createdPartner1 = partnerService.create(partner1);

        NaturalPerson partner2 = new NaturalPerson();
        partner2.setFirstName("Partner");
        partner2.setLastName("Two");
        partner2.setActive(true);
        Partner createdPartner2 = partnerService.create(partner2);

        // Create a relationship type
        RelationshipType type = new RelationshipType();
        type.setTypeName("InUseType");
        type.setDescription("Type in use");
        type.setIsActive(true);
        RelationshipType createdType = relationshipTypeService.create(type);

        // Create a relationship using the type
        PartnerRelationship relationship = new PartnerRelationship();
        relationship.setRelationshipType(createdType);
        partnerRelationshipService.create(createdPartner1.getId(), createdPartner2.getId(), relationship);

        // Try to delete the relationship type - should fail
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            relationshipTypeService.delete(createdType.getId());
        });
        
        assertTrue(exception.getMessage().contains("Cannot delete relationship type"));
        assertTrue(exception.getMessage().contains("in use"));
    }

    @Test
    @Transactional
    public void testSearchRelationshipType() {
        RelationshipType type1 = new RelationshipType();
        type1.setTypeName("Parent");
        type1.setDescription("Parent company");
        type1.setIsActive(true);
        relationshipTypeService.create(type1);

        RelationshipType type2 = new RelationshipType();
        type2.setTypeName("Affiliate");
        type2.setDescription("Affiliate company");
        type2.setIsActive(true);
        relationshipTypeService.create(type2);

        List<RelationshipType> results = relationshipTypeService.search("Parent");
        assertTrue(results.size() >= 1);
        assertTrue(results.stream().anyMatch(t -> "Parent".equals(t.getTypeName())));
    }

    @Test
    @Transactional
    public void testFindAll() {
        List<RelationshipType> types = relationshipTypeService.findAll();
        assertNotNull(types);
    }

    @Test
    @Transactional
    public void testFindActive() {
        List<RelationshipType> activeTypes = relationshipTypeService.findActive();
        assertNotNull(activeTypes);
        assertTrue(activeTypes.stream().allMatch(RelationshipType::getIsActive));
    }
}
