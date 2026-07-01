package de.haevn.snippetmanage.info;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestApiController(value = "/api/info", tagName = "Info Controller", description = "Controller for service information and metadata")
public class InfoController {

    private final InfoService infoService;

    public InfoController(InfoService infoService) {
        this.infoService = infoService;
    }

    @GetMapping
    @Operation(summary = "Get Service Info", description = "Retrieve basic information about the service")
    @ApiResponse(responseCode = "200", description = "Info retrieved successfully")
    public Map<String, String> getInfo(@RequestHeader Map<String, String> headers) {
        final Map<String, String> info = new ConcurrentHashMap<>();
        info.put("serviceName", infoService.getServiceName());
        info.put("version", infoService.getVersion());
        info.put("hostName", infoService.getHostName());
        info.put("timestamp", infoService.getTimeStamp());
        info.put("serverTime", String.valueOf(infoService.getServerTime()));
        info.put("uptime", String.valueOf(infoService.getUptime()));

        return info;
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping", description = "Ping the service to check if it's reachable")
    @ApiResponse(responseCode = "200", description = "Service is reachable")
    public String ping() {
        return "pong";
    }

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Check if the service is running")
    @ApiResponse(responseCode = "200", description = "Service is running")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Service is running");
    }


    @GetMapping("/version")
    @Operation(summary = "Get Service Version", description = "Retrieve the current version of the service")
    @ApiResponse(responseCode = "200", description = "Version retrieved successfully")
    String version() {
        return infoService.getVersion();
    }

    @GetMapping("/status")
    @Operation(summary = "Get Service Status", description = "Retrieve the current status of the service components")
    @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    Map<String, String> getStatus() {
        final Map<String, String> status = new ConcurrentHashMap<>();
        status.put("database", infoService.checkDatabase());
        status.put("services", infoService.checkServices());
        return status;
    }

    @GetMapping("/time")
    @Operation(summary = "Get Service Time Info", description = "Retrieve the current server time and uptime")
    @ApiResponse(responseCode = "200", description = "Time info retrieved successfully")
    long getTime() {
        return infoService.getServerTime();
    }

    @GetMapping("/uptime")
    @Operation(summary = "Get Service Uptime", description = "Retrieve the uptime of the service")
    @ApiResponse(responseCode = "200", description = "Uptime retrieved successfully")
    long getUptime() {
        return infoService.getUptime();
    }



}
