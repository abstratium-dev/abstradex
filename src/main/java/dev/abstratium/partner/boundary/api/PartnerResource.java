package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.boundary.dto.PartnerCreateRequest;
import dev.abstratium.partner.dto.PartnerSearchResult;
import dev.abstratium.partner.entity.LegalEntity;
import dev.abstratium.partner.entity.NaturalPerson;
import dev.abstratium.partner.entity.Partner;
import dev.abstratium.partner.service.PartnerService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/partner")
@Tag(name = "Partner", description = "Partner management endpoints")
public class PartnerResource {

    @Inject
    PartnerService partnerService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<PartnerSearchResult> getAll(@QueryParam("search") String searchTerm) {
        // Always use searchWithAddressContactDetailsAndTags to include address lines, contact details, and tags
        return partnerService.searchWithAddressContactDetailsAndTags(searchTerm);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response getById(@PathParam("id") String id) {
        Partner partner = partnerService.findById(id);
        if (partner == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(partner).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Partner create(PartnerCreateRequest request) {
        Partner partner = convertRequestToPartner(request);
        return partnerService.create(partner);
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Partner update(PartnerCreateRequest request) {
        Partner partner = convertRequestToPartner(request);
        return partnerService.update(partner);
    }
    
    /**
     * Convert PartnerCreateRequest DTO to appropriate Partner entity.
     * Uses explicit field mapping instead of reflection for native compilation compatibility.
     */
    private Partner convertRequestToPartner(PartnerCreateRequest request) {
        // Determine partner type based on fields present
        boolean isNaturalPerson = request.getFirstName() != null || request.getLastName() != null;
        boolean isLegalEntity = request.getLegalName() != null;
        
        if (isNaturalPerson) {
            NaturalPerson np = new NaturalPerson();
            // Only set ID if it's not null and not empty (for updates)
            if (request.getId() != null && !request.getId().trim().isEmpty()) {
                np.setId(request.getId());
            }
            np.setActive(request.getActive() != null ? request.getActive() : true);
            np.setNotes(request.getNotes());
            np.setTitle(request.getTitle());
            np.setFirstName(request.getFirstName());
            np.setMiddleName(request.getMiddleName());
            np.setLastName(request.getLastName());
            np.setDateOfBirth(request.getDateOfBirth());
            np.setTaxId(request.getTaxIdNp());
            np.setPreferredLanguage(request.getPreferredLanguage());
            return np;
        } else if (isLegalEntity) {
            LegalEntity le = new LegalEntity();
            // Only set ID if it's not null and not empty (for updates)
            if (request.getId() != null && !request.getId().trim().isEmpty()) {
                le.setId(request.getId());
            }
            le.setActive(request.getActive() != null ? request.getActive() : true);
            le.setNotes(request.getNotes());
            le.setLegalName(request.getLegalName());
            le.setTradingName(request.getTradingName());
            le.setRegistrationNumber(request.getRegistrationNumber());
            le.setTaxId(request.getTaxId());
            le.setLegalForm(request.getLegalForm());
            le.setIncorporationDate(request.getIncorporationDate());
            le.setJurisdiction(request.getJurisdiction());
            return le;
        } else {
            throw new IllegalArgumentException("Cannot determine partner type from request. " +
                "Provide either firstName/lastName for Natural Person or legalName for Legal Entity.");
        }
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public void delete(@PathParam("id") String id) {
        partnerService.delete(id);
    }
}
