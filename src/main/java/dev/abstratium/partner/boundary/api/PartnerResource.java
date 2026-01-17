package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
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
    public List<Partner> getAll(@QueryParam("search") String searchTerm) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return partnerService.search(searchTerm);
        }
        return partnerService.findAll();
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
    public Partner create(Partner partner) {
        return partnerService.create(partner);
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Partner update(Partner partner) {
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
