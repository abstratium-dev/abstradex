package dev.abstratium.demo.boundary.publik;

import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/** the public API */
@Path("/public/api")
@Tag(name = "API", description = "Public API endpoints")
@PermitAll
public class PublicDemoResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response demo() {
        return Response.ok(new AResponse(true)).build();
    }

    @RegisterForReflection
    public static class AResponse {
        public boolean aBoolean;

        public AResponse(boolean aBoolean) {
            this.aBoolean = aBoolean;
        }
    }
}
