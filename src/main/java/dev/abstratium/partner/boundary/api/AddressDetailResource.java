package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.AddressDetail;
import dev.abstratium.partner.service.AddressDetailService;
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

@Path("/api/partner/{partnerNumber}/address")
@Tag(name = "Partner Address", description = "Partner address management endpoints")
public class AddressDetailResource {

    @Inject
    AddressDetailService addressDetailService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<AddressDetail> getPartnerAddresses(@PathParam("partnerNumber") String partnerNumber) {
        return addressDetailService.findByPartnerId(partnerNumber);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public AddressDetail addAddressToPartner(
            @PathParam("partnerNumber") String partnerNumber,
            @QueryParam("addressId") String addressId,
            AddressDetail addressDetail) {
        return addressDetailService.create(partnerNumber, addressId, addressDetail);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({Roles.USER})
    public void removeAddressFromPartner(@PathParam("id") String id) {
        addressDetailService.delete(id);
    }
}
