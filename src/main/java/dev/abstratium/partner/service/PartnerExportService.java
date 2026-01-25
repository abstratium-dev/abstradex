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

import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

/**
 * Service for exporting partner data to a file.
 * Exports partner number and full name for all partners in the system.
 */
@ApplicationScoped
public class PartnerExportService {

    private static final Logger LOG = Logger.getLogger(PartnerExportService.class);

    @Inject
    EntityManager em;

    @ConfigProperty(name = "partner.export.file.path", defaultValue = "/tmp/partners.txt")
    String exportFilePath;

    /**
     * Export all partners to the configured file.
     * The file contains one line per partner with format: "P00000001 Partner Name"
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

            // Format partners as lines
            List<String> lines = partners.stream()
                .map(this::formatPartnerLine)
                .collect(Collectors.toList());

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
     * Format a partner as a line for the export file.
     * Format: "P00000001 Partner Name"
     */
    private String formatPartnerLine(Partner partner) {
        String partnerNumber = partner.getPartnerNumber();
        String partnerName = getPartnerName(partner);
        return String.format("%s %s", partnerNumber, partnerName);
    }

    /**
     * Get the display name for a partner.
     * For NaturalPerson: concatenate title, firstName, middleName, lastName
     * For LegalEntity: use tradingName if available, otherwise legalName
     */
    private String getPartnerName(Partner partner) {
        if (partner instanceof NaturalPerson) {
            NaturalPerson np = (NaturalPerson) partner;
            StringBuilder name = new StringBuilder();
            
            if (np.getTitle() != null && !np.getTitle().isEmpty()) {
                name.append(np.getTitle()).append(" ");
            }
            if (np.getFirstName() != null && !np.getFirstName().isEmpty()) {
                name.append(np.getFirstName()).append(" ");
            }
            if (np.getMiddleName() != null && !np.getMiddleName().isEmpty()) {
                name.append(np.getMiddleName()).append(" ");
            }
            if (np.getLastName() != null && !np.getLastName().isEmpty()) {
                name.append(np.getLastName());
            }
            
            String result = name.toString().trim();
            return result.isEmpty() ? "Unnamed Natural Person" : result;
            
        } else if (partner instanceof LegalEntity) {
            LegalEntity le = (LegalEntity) partner;
            
            if (le.getTradingName() != null && !le.getTradingName().isEmpty()) {
                return le.getTradingName();
            } else if (le.getLegalName() != null && !le.getLegalName().isEmpty()) {
                return le.getLegalName();
            } else {
                return "Unnamed Legal Entity";
            }
        }
        
        return "Unknown Partner Type";
    }
}
