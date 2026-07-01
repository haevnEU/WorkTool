package de.haevn.snippetmanage.timetable;

import de.haevn.snippetmanage.common.annotation.RestApiController;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestApiController("/api/timetable")
class TimetableController {
    private final TimetableService timetableService;

    public TimetableController(final TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping("/start")
    public long start(){
        return timetableService.start();
    }

    @GetMapping("/stop/{id}")
    public Timetable stop(@PathVariable long id) {
        return timetableService.stop(id);
    }

    @PostMapping("/update/{id}")
    public Timetable update(@PathVariable long id, @RequestBody Timetable timetable) {
        return timetableService.update(id, timetable);
    }

    @GetMapping("/get")
    public List<Timetable> getAll(){
        return timetableService.getAll();
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable long id) {
        timetableService.delete(id);
    }
}
