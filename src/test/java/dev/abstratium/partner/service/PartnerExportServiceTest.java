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
import jakarta.transaction.Transactional;

@QuarkusTest
class PartnerExportServiceTest {

    @Inject
    PartnerExportService exportService;

    @Inject
    PartnerService partnerService;

    private Path testExportFile;

    @BeforeEach
    void setUp() throws IOException {
        // Create a temporary file for testing
        testExportFile = Files.createTempFile("partner-export-test-", ".txt");
        
        // Override the export file path for testing
        // Note: This requires reflection or a test-specific configuration
        // For now, we'll use the default path and clean it up
        exportService.exportFilePath = testExportFile.toString();
    }

    @AfterEach
    void tearDown() throws IOException {
        // Clean up test file
        if (testExportFile != null && Files.exists(testExportFile)) {
            Files.delete(testExportFile);
        }
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    @Transactional
    void testExportPartnersToFile() throws IOException {
        // Create test partners
        NaturalPerson np = new NaturalPerson();
        np.setFirstName("John");
        np.setLastName("Doe");
        np.setActive(true);
        partnerService.create(np);

        LegalEntity le = new LegalEntity();
        le.setLegalName("Acme Corporation");
        le.setActive(true);
        partnerService.create(le);

        // Export partners
        exportService.exportPartnersToFile();

        // Verify file exists and contains expected content
        assertTrue(Files.exists(testExportFile), "Export file should exist");
        
        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 2, "Should have at least 2 partners");
        
        // Check format: "P00000001 Partner Name"
        for (String line : lines) {
            assertTrue(line.matches("P\\d{8} .+"), 
                "Line should match format 'P00000001 Name': " + line);
        }
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    @Transactional
    void testExportWithNaturalPersonVariations() throws IOException {
        // Test with full name
        NaturalPerson np1 = new NaturalPerson();
        np1.setTitle("Dr.");
        np1.setFirstName("Jane");
        np1.setMiddleName("Marie");
        np1.setLastName("Smith");
        np1.setActive(true);
        partnerService.create(np1);

        // Test with minimal name
        NaturalPerson np2 = new NaturalPerson();
        np2.setFirstName("Bob");
        np2.setActive(true);
        partnerService.create(np2);

        // Test with no name (should show "Unnamed Person")
        NaturalPerson np3 = new NaturalPerson();
        np3.setActive(true);
        partnerService.create(np3);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 3, "Should have at least 3 partners");
        
        // Verify one line contains "Dr. Jane Marie Smith"
        boolean foundFullName = lines.stream()
            .anyMatch(line -> line.contains("Dr. Jane Marie Smith"));
        assertTrue(foundFullName, "Should contain full name with title");
        
        // Verify one line contains "Bob"
        boolean foundBob = lines.stream()
            .anyMatch(line -> line.contains("Bob"));
        assertTrue(foundBob, "Should contain Bob");
        
        // Verify one line contains "Unnamed Natural Person"
        boolean foundUnnamed = lines.stream()
            .anyMatch(line -> line.contains("Unnamed Natural Person"));
        assertTrue(foundUnnamed, "Should contain Unnamed Natural Person");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    @Transactional
    void testExportWithLegalEntityVariations() throws IOException {
        // Test with trading name
        LegalEntity le1 = new LegalEntity();
        le1.setLegalName("Acme Corporation Ltd");
        le1.setTradingName("Acme Corp");
        le1.setActive(true);
        partnerService.create(le1);

        // Test with legal name only
        LegalEntity le2 = new LegalEntity();
        le2.setLegalName("Beta Industries");
        le2.setActive(true);
        partnerService.create(le2);

        // Test with no name (should show "Unnamed Entity")
        LegalEntity le3 = new LegalEntity();
        le3.setActive(true);
        partnerService.create(le3);

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        assertTrue(lines.size() >= 3, "Should have at least 3 partners");
        
        // Verify trading name is preferred over legal name
        boolean foundTradingName = lines.stream()
            .anyMatch(line -> line.contains("Acme Corp"));
        assertTrue(foundTradingName, "Should use trading name when available");
        
        // Verify legal name is used when no trading name
        boolean foundLegalName = lines.stream()
            .anyMatch(line -> line.contains("Beta Industries"));
        assertTrue(foundLegalName, "Should use legal name when no trading name");
        
        // Verify one line contains "Unnamed Legal Entity"
        boolean foundUnnamed = lines.stream()
            .anyMatch(line -> line.contains("Unnamed Legal Entity"));
        assertTrue(foundUnnamed, "Should contain Unnamed Legal Entity");
    }

    @Test
    @TestSecurity(user = "testuser@example.com", roles = {})
    @Transactional
    void testExportSortedByPartnerNumber() throws IOException {
        // Create partners in random order
        for (int i = 0; i < 5; i++) {
            NaturalPerson np = new NaturalPerson();
            np.setFirstName("Person" + i);
            np.setLastName("Test");
            np.setActive(true);
            partnerService.create(np);
        }

        exportService.exportPartnersToFile();

        List<String> lines = Files.readAllLines(testExportFile);
        
        // Verify lines are sorted by partner number
        for (int i = 0; i < lines.size() - 1; i++) {
            String currentNumber = lines.get(i).substring(0, 9); // Extract "P00000001"
            String nextNumber = lines.get(i + 1).substring(0, 9);
            assertTrue(currentNumber.compareTo(nextNumber) < 0, 
                "Partners should be sorted by number: " + currentNumber + " should be before " + nextNumber);
        }
    }
}
