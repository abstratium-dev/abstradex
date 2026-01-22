package dev.abstratium.partner.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.core.Roles;
import dev.abstratium.partner.entity.Address;
import dev.abstratium.partner.service.AddressService;
import dev.abstratium.partner.service.Countries;
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
import jakarta.ws.rs.core.Response;

@Path("/api/address")
@Tag(name = "Address", description = "Address management endpoints")
public class AddressResource {

    @Inject
    AddressService addressService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<Address> getAll(@QueryParam("search") String searchTerm) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return addressService.search(searchTerm);
        }
        return addressService.findAll();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Response getById(@PathParam("id") String id) {
        Address address = addressService.findById(id);
        if (address == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(address).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Address create(Address address) {
        return addressService.create(address);
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public void delete(@PathParam("id") String id) {
        addressService.delete(id);
    }

    @GET
    @Path("/countries")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public Countries.Country[] getCountries() {
        return Countries.countries;
    }
}
