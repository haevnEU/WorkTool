package de.haevn.snippetmanage.timetable;

import de.haevn.snippetmanage.common.exception.BadRequestException;
import de.haevn.snippetmanage.common.exception.NotFoundException;
import de.haevn.snippetmanage.common.utils.Patcher;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
class TimetableService {
    private final TimetableRepository timetableRepository;
    private final Patcher patcher;
    public TimetableService(final TimetableRepository timetableRepository, final Patcher patcher) {
        this.timetableRepository = timetableRepository;
        this.patcher = patcher;
    }

    public long start(){
        Timetable timetable = new Timetable();
        timetable.setStartTime(System.currentTimeMillis());
        timetable.setEndTime(-1L);
        Timetable responseTable = timetableRepository.save(timetable);
        return responseTable.getId();
    }

    public Timetable stop(final long id) {
        Timetable timetable = timetableRepository.findById(id).orElseThrow(NotFoundException::new);
        if(timetable.getEndTime() > 0){
            throw new BadRequestException("Timetable already stopped");
        }
        final long currentTime = System.currentTimeMillis();
        timetable.setEndTime(currentTime);
        return timetableRepository.save(timetable);
    }

    public Timetable update(final long id, final Timetable timetable) {
        Timetable existingTimetable = timetableRepository.findById(id).orElseThrow(NotFoundException::new);
        patcher.patch(existingTimetable, timetable);
        return timetableRepository.save(existingTimetable);
    }

    public List<Timetable> getAll() {
        return timetableRepository.findAll();
    }

    public void delete(final long id) {
        timetableRepository.deleteById(id);
    }
}
