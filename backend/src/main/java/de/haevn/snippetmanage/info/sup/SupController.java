package de.haevn.snippetmanage.info.sup;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import de.haevn.snippetmanage.common.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestApiController("/api/db")
public class SupController {
    private final SupService supService;

    public SupController(final SupService supService) {
        this.supService = supService;
    }

    @GetMapping("/tables")
    public ResponseEntity<?> getAllSup() {
        var result = supService.getAllSup().keySet();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tables/{name}")
    public ResponseEntity<List<Map<String, Object>>> getSup(@PathVariable("name") String name) {
        final var result = supService.getAllSup().get(name);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tables/{name}/{type}")
    public ResponseEntity<List<Map<String, Object>>> getSupByType(@PathVariable("name") final String name, @PathVariable("type") final String type,
                                          @RequestParam("value") final Optional<String> valueOpt) {
        var table = supService.getAllSup().get(name);
        if (table == null) {
            throw new TableNotFoundException(name);
        }
        if (valueOpt.isEmpty()) {
            return ResponseEntity.ok(table);
        }

        final String value = valueOpt.get();
        final List<Map<String, Object>> result = table.stream().filter(entry -> {
            final var entryValue = entry.get(type);
            return entryValue != null && entryValue.toString().equals(value);
        }).toList();
        return ResponseEntity.ok(result);

    }

    @GetMapping("/query")
    public ResponseEntity<List<Map<String, Object>>> querySup(@RequestBody final String sql) {
        if (sql.toLowerCase().contains("delete") || sql.toLowerCase().contains("update") || sql.toLowerCase()
                .contains("insert")) {
            throw new BadRequestException("Only SELECT queries are allowed.");
        }
        var result = supService.get(sql);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Map<String, Object>> getSupById(@PathVariable("id") final int id) {
        final var result = supService.getAllSup();
        final Map<String, Object> found = new HashMap<>();

        result.forEach((k, v) -> {
            for (final Map<String, Object> stringObjectMap : v) {
                if (stringObjectMap.get("id").equals(id)) {
                    found.put(k, stringObjectMap);
                    break;
                }
            }
        });

        return ResponseEntity.ok(found);
    }


}
