package dev.abstratium.partner.boundary.api;

import java.util.List;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.PartnerTag;
import dev.abstratium.partner.entity.Tag;
import dev.abstratium.partner.service.PartnerTagService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/partner/{partnerId}/tag")
public class PartnerTagResource {

    @Inject
    PartnerTagService partnerTagService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<Tag> getPartnerTags(@PathParam("partnerId") String partnerId) {
        return partnerTagService.findTagsByPartnerId(partnerId);
    }

    @POST
    @Path("/{tagId}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response addTagToPartner(
            @PathParam("partnerId") String partnerId,
            @PathParam("tagId") String tagId) {
        try {
            PartnerTag partnerTag = partnerTagService.addTagToPartner(partnerId, tagId);
            return Response.status(Response.Status.CREATED).entity(partnerTag).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{tagId}")
    @RolesAllowed({Roles.USER})
    public Response removeTagFromPartner(
            @PathParam("partnerId") String partnerId,
            @PathParam("tagId") String tagId) {
        try {
            partnerTagService.removeTagFromPartner(partnerId, tagId);
            return Response.noContent().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    // Simple error response class
    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
