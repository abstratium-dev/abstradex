package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.entity.Tag;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@QuarkusTest
public class TagServiceTest {

    @Inject
    TagService tagService;

    @Inject
    PartnerTagService partnerTagService;

    @Inject
    PartnerService partnerService;

    @Test
    @Transactional
    public void testCreateAndFindTag() {
        Tag tag = new Tag();
        tag.setTagName("VIP");
        tag.setColorHex("#FF0000");
        tag.setDescription("VIP customer");

        Tag created = tagService.create(tag);
        assertNotNull(created.getId());
        assertEquals("VIP", created.getTagName());
        assertEquals("#FF0000", created.getColorHex());

        Tag found = tagService.findById(created.getId());
        assertNotNull(found);
        assertEquals(created.getId(), found.getId());
        assertEquals("VIP", found.getTagName());
    }

    @Test
    @Transactional
    public void testDeleteTag() {
        Tag tag = new Tag();
        tag.setTagName("Temporary");
        tag.setColorHex("#00FF00");

        Tag created = tagService.create(tag);
        String id = created.getId();
        
        tagService.delete(id);
        
        Tag found = tagService.findById(id);
        assertNull(found);
    }

    @Test
    @Transactional
    public void testCannotDeleteTagInUse() {
        // Create a partner
        NaturalPerson partner = new NaturalPerson();
        partner.setFirstName("Test");
        partner.setLastName("Partner");
        partner.setActive(true);
        Partner createdPartner = partnerService.create(partner);

        // Create a tag
        Tag tag = new Tag();
        tag.setTagName("InUseTag");
        tag.setColorHex("#0000FF");
        Tag createdTag = tagService.create(tag);

        // Link tag to partner
        partnerTagService.addTagToPartner(createdPartner.getId(), createdTag.getId());

        // Try to delete the tag - should fail
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            tagService.delete(createdTag.getId());
        });
        
        assertTrue(exception.getMessage().contains("Cannot delete tag"));
        assertTrue(exception.getMessage().contains("in use"));
    }

    @Test
    @Transactional
    public void testSearchTag() {
        Tag tag1 = new Tag();
        tag1.setTagName("Premium");
        tag1.setColorHex("#FFD700");
        tagService.create(tag1);

        Tag tag2 = new Tag();
        tag2.setTagName("Standard");
        tag2.setColorHex("#C0C0C0");
        tagService.create(tag2);

        List<Tag> results = tagService.search("Premium");
        assertTrue(results.size() >= 1);
        assertTrue(results.stream().anyMatch(t -> "Premium".equals(t.getTagName())));
    }

    @Test
    @Transactional
    public void testFindAll() {
        List<Tag> tags = tagService.findAll();
        assertNotNull(tags);
    }
}
