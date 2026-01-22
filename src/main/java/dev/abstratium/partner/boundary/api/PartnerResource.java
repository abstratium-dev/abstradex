package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.fasterxml.jackson.databind.ObjectMapper;

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

    @Inject
    ObjectMapper objectMapper;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<PartnerSearchResult> getAll(@QueryParam("search") String searchTerm) {
        // Always use searchWithAddress to include address lines
        return partnerService.searchWithAddress(searchTerm);
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
        // Determine partner type based on fields present in the request
        Partner partner;
        if (request.has("firstName") || request.has("lastName")) {
            // Natural Person
            partner = objectMapper.convertValue(request.getProperties(), NaturalPerson.class);
        } else if (request.has("legalName")) {
            // Legal Entity
            partner = objectMapper.convertValue(request.getProperties(), LegalEntity.class);
        } else {
            throw new IllegalArgumentException("Cannot determine partner type from request. " +
                "Provide either firstName/lastName for Natural Person or legalName for Legal Entity.");
        }
        return partnerService.create(partner);
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Partner update(PartnerCreateRequest request) {
        // Determine partner type based on fields present in the request
        Partner partner;
        if (request.has("firstName") || request.has("lastName")) {
            // Natural Person
            partner = objectMapper.convertValue(request.getProperties(), NaturalPerson.class);
        } else if (request.has("legalName")) {
            // Legal Entity
            partner = objectMapper.convertValue(request.getProperties(), LegalEntity.class);
        } else {
            throw new IllegalArgumentException("Cannot determine partner type from request. " +
                "Provide either firstName/lastName for Natural Person or legalName for Legal Entity.");
        }
        return partnerService.update(partner);
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public void delete(@PathParam("id") String id) {
        partnerService.delete(id);
    }
}
