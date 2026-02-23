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
        np.setNotes("Natural person test");
        partnerService.create(np);

        LegalEntity le = new LegalEntity();
        le.setLegalName("Acme Corporation");
        le.setActive(true);
        le.setNotes("Legal entity test");
        partnerService.create(le);

        exportService.exportPartnersToFile();

        assertTrue(Files.exists(testExportFile), "Export file should exist");
        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 3, "Should have header + at least 2 partners");
        
        // Check header line
        assertTrue(lines.get(0).contains("\"id\",\"partnerNumberSeq\",\"createdAt\",\"updatedAt\",\"isActive\",\"notes\""), 
            "Should contain proper CSV header");
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
        np.setNotes("Test notes for Jane");
        partnerService.create(np);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        // Check header line
        assertTrue(lines.get(0).contains("\"id\",\"partnerNumberSeq\",\"createdAt\",\"updatedAt\",\"isActive\",\"notes\""), 
            "Should contain proper CSV header");
        
        // Skip header line and check data line contains active=true and notes
        boolean foundData = lines.stream()
            .skip(1)
            .anyMatch(line -> line.contains("\"true\"") && line.contains("\"Test notes for Jane\""));
        assertTrue(foundData, "Should contain CSV data with active status and notes");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithNaturalPersonNoName() throws IOException {
        NaturalPerson np = new NaturalPerson();
        np.setActive(true);
        np.setNotes("Natural person with no name");
        partnerService.create(np);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        // Skip header line and check data line contains active=true and notes
        boolean foundUnnamed = lines.stream()
            .skip(1)
            .anyMatch(line -> line.contains("\"true\"") && line.contains("\"Natural person with no name\""));
        assertTrue(foundUnnamed, "Should contain CSV data with active status and notes");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithLegalEntityTradingName() throws IOException {
        LegalEntity le = new LegalEntity();
        le.setLegalName("Acme Corporation Ltd");
        le.setTradingName("Acme Corp");
        le.setActive(true);
        le.setNotes("Legal entity with trading name");
        partnerService.create(le);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        // Skip header line and check data line contains active=true and notes
        boolean foundTradingName = lines.stream()
            .skip(1)
            .anyMatch(line -> line.contains("\"true\"") && line.contains("\"Legal entity with trading name\""));
        assertTrue(foundTradingName, "Should contain CSV data with active status and notes");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    void testExportWithLegalEntityNoName() throws IOException {
        LegalEntity le = new LegalEntity();
        le.setActive(true);
        le.setNotes("Legal entity with no names");
        partnerService.create(le);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        // Skip header line and check data line contains active=true and notes
        boolean foundUnnamed = lines.stream()
            .skip(1)
            .anyMatch(line -> line.contains("\"true\"") && line.contains("\"Legal entity with no names\""));
        assertTrue(foundUnnamed, "Should contain CSV data with active status and notes");
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
        assertTrue(lines.size() >= 6, "Should have header + at least 5 partners");
        
        // Skip header and check sorting by partner number (second field in CSV)
        List<String> dataLines = lines.stream().skip(1).toList();
        for (int i = 0; i < dataLines.size() - 1; i++) {
            String currentLine = dataLines.get(i);
            String nextLine = dataLines.get(i + 1);
            
            // Extract partner number (second field in CSV)
            String currentNumber = extractPartnerNumberFromCsv(currentLine);
            String nextNumber = extractPartnerNumberFromCsv(nextLine);
            
            assertTrue(Long.parseLong(currentNumber) < Long.parseLong(nextNumber), 
                "Partners should be sorted by number");
        }
    }
    
    private String extractPartnerNumberFromCsv(String csvLine) {
        String[] fields = csvLine.split(",", 3); // Split into max 3 parts to get second field
        if (fields.length >= 2) {
            return fields[1].replaceAll("\"", ""); // Remove quotes
        }
        return "0";
    }
}
