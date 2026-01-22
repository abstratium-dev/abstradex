package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.ContactDetail;
import dev.abstratium.partner.service.ContactDetailService;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/partner/{partnerId}/contact")
@Tag(name = "Partner Contact", description = "Partner contact management endpoints")
public class ContactDetailResource {

    @Inject
    ContactDetailService contactDetailService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<ContactDetail> getPartnerContacts(@PathParam("partnerId") String partnerId) {
        return contactDetailService.findByPartnerId(partnerId);
    }

    @GET
    @Path("/type/{contactType}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<ContactDetail> getPartnerContactsByType(
            @PathParam("partnerId") String partnerId,
            @PathParam("contactType") String contactType) {
        return contactDetailService.findByPartnerIdAndType(partnerId, contactType);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response getById(@PathParam("id") String id) {
        ContactDetail contactDetail = contactDetailService.findById(id);
        if (contactDetail == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(contactDetail).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public ContactDetail addContactToPartner(
            @PathParam("partnerId") String partnerId,
            ContactDetail contactDetail) {
        return contactDetailService.create(partnerId, contactDetail);
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public ContactDetail updateContact(
            @PathParam("id") String id,
            ContactDetail contactDetail) {
        return contactDetailService.update(id, contactDetail);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({Roles.USER})
    public void removeContactFromPartner(@PathParam("id") String id) {
        contactDetailService.delete(id);
    }
}
