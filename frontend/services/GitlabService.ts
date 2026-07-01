import {IService} from './IService';
import {MergeRequestModel} from "../types/MergeRequestModel.ts";


class GitlabService extends IService {
    private mergeRequests: MergeRequestModel[] = [];
    private mergeConflicts: MergeRequestModel[] = [];

    public async fetchMergeRequests(): Promise<MergeRequestModel[]> {
        if (this.mergeRequests.length > 0) {
            return Promise.resolve(this.mergeRequests);
        }
        const mergeRequests = await this.getOld<MergeRequestModel[]>('/git/merge-request/open');
        this.mergeRequests = mergeRequests;

        return this.mergeRequests;
    }

    public async fetchMergeConflicts(): Promise<MergeRequestModel[]> {
        if (this.mergeConflicts.length > 0) {
            return Promise.resolve(this.mergeConflicts);
        }
        const conflicts = await this.getOld<MergeRequestModel[]>('/git/merge-conflicts');
        this.mergeConflicts = conflicts;
        return this.mergeConflicts;
    }

}

export const gitlabService = new GitlabService();
