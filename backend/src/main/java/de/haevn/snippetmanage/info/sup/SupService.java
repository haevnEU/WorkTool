package de.haevn.snippetmanage.info.sup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;

@Service
public class SupService {

    @Value("${haevn.application.wmt.db.url}")
    private String dbUrl;

    private final Map<String, List<Map<String, Object>>> cache = new HashMap<>();

    List<Map<String, Object>> get(String query) {
        // Manual SQL Query Execution
        Properties info = new Properties();
        info.put("user", "postgres");
        try (Connection con = DriverManager.getConnection(dbUrl, info)) {

            try (PreparedStatement pst = con.prepareStatement(query)) {
                List<Map<String, Object>> result = new ArrayList<>();

                if (pst.execute()) {
                    ResultSet rs;
                    while ((rs = pst.getResultSet()).next()) {
                        Map<String, Object> map = new HashMap<>();
                        int id = rs.getInt("id");
                        String token = rs.getString("token");
                        map.put("id", id);
                        map.put("token", token);

                        try {
                            String description = rs.getString("description");
                            map.put("description", description);
                        } catch (SQLException ex) {
                        }

                        try {
                            String description = rs.getString("network_operator");
                            map.put("description", description);
                        } catch (SQLException ex) {
                        }
                        // when there is a field 'active'
                        try {
                            String active = rs.getString("unit");
                            map.put("unit", active);
                        } catch (SQLException ex) {
                        }


                        result.add(map);
                    }
                    return result;
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return List.of();
        }
        return List.of();
    }


    public Map<String, List<Map<String, Object>>> getAllSup() {
        if (!cache.isEmpty()) {
            return cache;
        }
        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("sup_contact_type", sup_contact_type());
        result.put("sup_geodata_info_type", sup_geodata_info_type());
        result.put("sup_installation_power_supply", sup_installation_power_supply());
        result.put("sup_job_action_document_type", sup_job_action_document_type());
        result.put("sup_measurement_type", sup_measurement_type());
        result.put("sup_device_status", sup_device_status());
        result.put("sup_installation_access_level", sup_installation_access_level());
        result.put("sup_installation_status", sup_installation_status());
        result.put("sup_job_action_result", sup_job_action_result());
        result.put("sup_sm_type", sup_sm_type());
        result.put("sup_device_type", sup_device_type());
        result.put("sup_installation_cable_length", sup_installation_cable_length());
        result.put("sup_installation_type", sup_installation_type());
        result.put("sup_job_metering_point_type", sup_job_metering_point_type());
        result.put("sup_tariff_type", sup_tariff_type());
        result.put("sup_geodata_info_message", sup_geodata_info_message());
        result.put("sup_installation_mounting_variant", sup_installation_mounting_variant());
        result.put("sup_job_action", sup_job_action());
        result.put("sup_job_status", sup_job_status());
        result.put("gln", gln());

        cache.putAll(result);

        return result;
    }

    public List<Map<String, Object>> gln() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_contact_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_geodata_info_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_power_supply() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_job_action_document_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_measurement_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_device_status() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_access_level() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_status() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_job_action_result() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_sm_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_device_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_cable_length() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_job_metering_point_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_tariff_type() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_geodata_info_message() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_installation_mounting_variant() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_job_action() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }

    public List<Map<String, Object>> sup_job_status() {
        String methodName = Thread.currentThread().getStackTrace()[1].getMethodName();
        return get("SELECT * FROM " + methodName + ";");
    }
}