import {MergeRequestPipelineModel} from "./MergeRequestPipelineModel.ts";
import {MergeRequestUserModel} from "./MergeRequestUserModel.ts";

export interface MergeRequestModel {
    id: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
    target_branch: string;
    source_branch: string;
    assignee: MergeRequestUserModel;
    reviewers: MergeRequestUserModel[];
    merge_status: string;
    detailed_merge_status: string;
    web_url: string;
    has_conflicts: boolean;
    blocking_discussions_resolved: boolean;
    pipeline: MergeRequestPipelineModel;
}