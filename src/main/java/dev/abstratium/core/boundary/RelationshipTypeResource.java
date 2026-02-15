package dev.abstratium.core.boundary;

import java.util.List;

import dev.abstratium.core.Roles;
import dev.abstratium.core.entity.RelationshipType;
import dev.abstratium.core.service.RelationshipTypeService;
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

@Path("/api/relationship-type")
public class RelationshipTypeResource {

    @Inject
    RelationshipTypeService relationshipTypeService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<RelationshipType> getAll(@QueryParam("search") String searchTerm, @QueryParam("activeOnly") Boolean activeOnly) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return relationshipTypeService.search(searchTerm);
        }
        if (activeOnly != null && activeOnly) {
            return relationshipTypeService.findActive();
        }
        return relationshipTypeService.findAll();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response getById(@PathParam("id") String id) {
        RelationshipType relationshipType = relationshipTypeService.findById(id);
        if (relationshipType == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(relationshipType).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response create(RelationshipType relationshipType) {
        try {
            RelationshipType created = relationshipTypeService.create(relationshipType);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response update(@PathParam("id") String id, RelationshipType relationshipType) {
        try {
            RelationshipType updated = relationshipTypeService.update(id, relationshipType);
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({Roles.USER})
    public Response delete(@PathParam("id") String id) {
        relationshipTypeService.delete(id);
        return Response.noContent().build();
    }

    // Simple error response class
    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
