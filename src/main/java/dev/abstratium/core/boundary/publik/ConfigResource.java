package dev.abstratium.core.boundary.publik;

import dev.abstratium.core.BuildInfo;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/public/config")
@Tag(name = "API", description = "Public API endpoints")
public class ConfigResource {

    @ConfigProperty(name = "client.log.level")
    String clientLogLevel;

    @ConfigProperty(name = "addresses.country.default")
    String defaultCountry;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public SuccessResponse config() {
        return new SuccessResponse(clientLogLevel, BuildInfo.BUILD_TIMESTAMP, defaultCountry);
    }

    @RegisterForReflection
    public static class SuccessResponse {
        public String logLevel;
        public String baselineBuildTimestamp;
        public String defaultCountry;
        
        public SuccessResponse(String logLevel, String baselineBuildTimestamp, String defaultCountry) {
            this.logLevel = logLevel;
            this.baselineBuildTimestamp = baselineBuildTimestamp;
            this.defaultCountry = defaultCountry;
        }
    }
}
