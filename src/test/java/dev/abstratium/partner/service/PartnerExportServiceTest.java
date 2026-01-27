package dev.abstratium.partner.service;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@QuarkusTest
class PartnerExportServiceTest {

    @Inject
    PartnerExportService exportService;

    @Inject
    PartnerService partnerService;

    @Inject
    EntityManager em;

    private Path testExportFile = Path.of("/tmp/partner-export-test.txt");

    @BeforeEach
    @Transactional
    void setUp() throws IOException {
        em.createQuery("DELETE FROM Partner p").executeUpdate();
        Files.deleteIfExists(testExportFile);
    }

    @AfterEach
    @Transactional
    void tearDown() throws IOException {
        Files.deleteIfExists(testExportFile);
        em.createQuery("DELETE FROM Partner p").executeUpdate();
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportPartnersToFile() throws IOException {
        NaturalPerson np = new NaturalPerson();
        np.setFirstName("John");
        np.setLastName("Doe");
        np.setActive(true);
        partnerService.create(np);

        LegalEntity le = new LegalEntity();
        le.setLegalName("Acme Corporation");
        le.setActive(true);
        partnerService.create(le);

        exportService.exportPartnersToFile();

        assertTrue(Files.exists(testExportFile), "Export file should exist");
        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 2, "Should have at least 2 partners");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithNaturalPersonFullName() throws IOException {
        NaturalPerson np = new NaturalPerson();
        np.setTitle("Dr.");
        np.setFirstName("Jane");
        np.setMiddleName("Marie");
        np.setLastName("Smith");
        np.setActive(true);
        partnerService.create(np);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        boolean foundFullName = lines.stream()
            .anyMatch(line -> line.contains("Dr. Jane Marie Smith"));
        assertTrue(foundFullName, "Should contain full name with title and middle name");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithNaturalPersonNoName() throws IOException {
        NaturalPerson np = new NaturalPerson();
        np.setActive(true);
        partnerService.create(np);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        boolean foundUnnamed = lines.stream()
            .anyMatch(line -> line.contains("Unnamed Natural Person"));
        assertTrue(foundUnnamed, "Should contain Unnamed Natural Person");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithLegalEntityTradingName() throws IOException {
        LegalEntity le = new LegalEntity();
        le.setLegalName("Acme Corporation Ltd");
        le.setTradingName("Acme Corp");
        le.setActive(true);
        partnerService.create(le);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        boolean foundTradingName = lines.stream()
            .anyMatch(line -> line.contains("Acme Corp"));
        assertTrue(foundTradingName, "Should use trading name when available");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithLegalEntityNoName() throws IOException {
        LegalEntity le = new LegalEntity();
        le.setActive(true);
        partnerService.create(le);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        boolean foundUnnamed = lines.stream()
            .anyMatch(line -> line.contains("Unnamed Legal Entity"));
        assertTrue(foundUnnamed, "Should contain Unnamed Legal Entity");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportSortedByPartnerNumber() throws IOException {
        for (int i = 0; i < 5; i++) {
            NaturalPerson np = new NaturalPerson();
            np.setFirstName("Person" + i);
            np.setLastName("Test");
            np.setActive(true);
            partnerService.create(np);
        }

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 5, "Should have at least 5 partners");
        
        for (int i = 0; i < lines.size() - 1; i++) {
            String currentNumber = lines.get(i).substring(0, 9);
            String nextNumber = lines.get(i + 1).substring(0, 9);
            assertTrue(currentNumber.compareTo(nextNumber) < 0, 
                "Partners should be sorted by number");
        }
    }
}
