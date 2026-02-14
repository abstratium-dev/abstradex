package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.PartnerRelationship;
import dev.abstratium.partner.service.PartnerRelationshipService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/api/partner/{partnerId}/relationship")
@Tag(name = "Partner Relationship", description = "Partner relationship management endpoints")
public class PartnerRelationshipResource {

    @Inject
    PartnerRelationshipService partnerRelationshipService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<PartnerRelationship> getPartnerRelationships(@PathParam("partnerId") String partnerId) {
        return partnerRelationshipService.findByPartnerId(partnerId);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public PartnerRelationship addRelationshipToPartner(
            @PathParam("partnerId") String partnerId,
            @QueryParam("relatedPartnerId") String relatedPartnerId,
            PartnerRelationship relationship) {
        return partnerRelationshipService.create(partnerId, relatedPartnerId, relationship);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({Roles.USER})
    public void removeRelationshipFromPartner(@PathParam("id") String id) {
        partnerRelationshipService.delete(id);
    }
}
