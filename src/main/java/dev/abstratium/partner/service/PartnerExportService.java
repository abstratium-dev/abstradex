package dev.abstratium.partner.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import dev.abstratium.partner.entity.Partner;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

/**
 * Service for exporting partner data to a file.
 * Exports all partner attributes with CSV formatting including headers.
 */
@ApplicationScoped
public class PartnerExportService {

    private static final Logger LOG = Logger.getLogger(PartnerExportService.class);

    @Inject
    EntityManager em;

    @ConfigProperty(name = "partner.export.file.path")
    String exportFilePath;

    /**
     * Export all partners to the configured file.
     * The file contains a header line and CSV-formatted data for all partner attributes.
     * Partners are sorted by partner number.
     */
    @Transactional
    public void exportPartnersToFile() {
        try {
            LOG.infof("Starting partner export to file: %s", exportFilePath);
            
            // Fetch all partners ordered by partner number
            List<Partner> partners = em.createQuery(
                "SELECT p FROM Partner p ORDER BY p.partnerNumberSeq ASC", 
                Partner.class
            ).getResultList();

            // Create lines with header and data
            List<String> lines = new java.util.ArrayList<>();
            
            // Add header line
            lines.add(getHeaderLine());
            
            // Add data lines
            lines.addAll(partners.stream()
                .map(this::formatPartnerLine)
                .collect(Collectors.toList()));

            // Write to file
            Path path = Paths.get(exportFilePath);
            
            // Create parent directories if they don't exist
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }
            
            // Write all lines to file (overwrite existing file)
            Files.write(path, lines, 
                StandardOpenOption.CREATE, 
                StandardOpenOption.TRUNCATE_EXISTING);

            LOG.infof("Successfully exported %d partners to %s", partners.size(), exportFilePath);
            
        } catch (IOException e) {
            LOG.errorf(e, "Failed to export partners to file: %s", exportFilePath);
            throw new RuntimeException("Failed to export partners to file", e);
        }
    }

    /**
     * Get the header line for the CSV export.
     */
    private String getHeaderLine() {
        return "\"Partner Number\",\"Name\",\"Active\"";
    }

    /**
     * Format a partner as a CSV line for the export file.
     * Includes all direct partner fields with proper quoting.
     */
    private String formatPartnerLine(Partner partner) {
        return String.format("\"%s\",\"%s\",\"%s\"",
            escapeCsv(partner.getPartnerNumber()),
            escapeCsv(partner.getName()),
            escapeCsv(String.valueOf(partner.isActive()))
        );
    }

    /**
     * Escape CSV values by handling null values and quoting properly.
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        // Replace any existing quotes with escaped quotes
        return value.replace("\"", "\"\"");
    }
}
