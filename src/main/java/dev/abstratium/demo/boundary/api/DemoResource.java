package dev.abstratium.demo.boundary.api;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import dev.abstratium.demo.service.Roles;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/demo")
@Tag(name = "Demo", description = "Demo endpoints")
public class DemoResource {
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({Roles.USER})
    public List<SuccessResponse> demo() {
        return List.of(new SuccessResponse("Demo endpoint works!"));
    }

    
    @RegisterForReflection
    public static class SuccessResponse {
        public String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
    }
}
