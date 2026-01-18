package dev.abstratium.partner.boundary.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnySetter;

public class PartnerCreateRequest {
    private Map<String, Object> properties = new java.util.HashMap<>();

    @JsonAnySetter
    public void setProperty(String key, Object value) {
        properties.put(key, value);
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public Object get(String key) {
        return properties.get(key);
    }

    public boolean has(String key) {
        return properties.containsKey(key) && properties.get(key) != null;
    }
}
