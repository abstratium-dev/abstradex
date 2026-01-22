package dev.abstratium.partner.entity;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_tag")
public class Tag {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tag_name", unique = true, nullable = false, length = 100)
    private String tagName;

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(name = "description", length = 255)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "tag", fetch = FetchType.LAZY)
    private Set<PartnerTag> partnerTags = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<PartnerTag> getPartnerTags() {
        return partnerTags;
    }

    public void setPartnerTags(Set<PartnerTag> partnerTags) {
        this.partnerTags = partnerTags;
    }
}
