// java
package de.haevn.snippetmanage.xml;

import jakarta.xml.bind.annotation.adapters.XmlAdapter;

public class EmptyStringAdapter extends XmlAdapter<String, String> {

    @Override
    public String unmarshal(String v) {
        return v;
    }

    @Override
    public String marshal(String v) {
        if (v == null) return null;
        String trimmed = v.trim();
        return trimmed.isEmpty() ? null : v;
    }
}