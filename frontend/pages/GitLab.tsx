import React, {useEffect, useMemo, useState} from 'react';
import {CustomError} from '../types';
import {GitMerge, ScanLine} from 'lucide-react';
import MergeRequestItem from '../components/git/MergeRequestItem.tsx';
import {gitlabService} from '../services/GitlabService';
import {MergeRequestModel} from "../types/MergeRequestModel.ts";

const GitLab: React.FC = () => {
    const [mergeRequest, setMergeRequest] = useState<MergeRequestModel[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<CustomError | null>(null);

    useEffect(() => {
        fetchMergeRequests();
    }, []);

    const filterOptions = [
        {value: 'conflicts', label: 'Merge Conflicts'},
        {value: 'success', label: 'Pipeline Success'},
        {value: 'failed', label: 'Pipeline Failed'},
        {value: 'running', label: 'Pipeline Running'},
        {value: 'canceled', label: 'Pipeline Canceled'},
        {value: 'skipped', label: 'Pipeline Skipped'},
    ];

    const toggleFilter = (value: string) => {
        setSelectedFilters((prev) => (
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        ));
    };

    const visibleMergeRequests = useMemo(() => {
        if (!selectedFilters || selectedFilters.length === 0) return mergeRequest;

        const matchesFilter = (mr: MergeRequestModel, filter: string) => {
            if (filter === 'conflicts') return !!mr.has_conflicts;
            const pipelineStatus = (mr as any)?.pipeline?.status;
            if (pipelineStatus && pipelineStatus === filter) return true;
            if (mr.merge_status === filter) return true;
            if (mr.detailed_merge_status === filter) return true;
            if (mr.state === filter) return true;
            return false;
        };

        return mergeRequest.filter((mr) => selectedFilters.some((f) => matchesFilter(mr, f)));
    }, [mergeRequest, selectedFilters]);


    const fetchMergeRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const mergeRequests = await gitlabService.fetchMergeRequests();
            setMergeRequest(mergeRequests);
        } catch (err) {
            setError({
                message: 'Failed to fetch merge requests',
                details: err instanceof Error ? err.message : String(err)
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="flex items-center space-x-3 mb-6">
                <GitMerge className="h-8 w-8 text-primary"/>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GitLab</h1>
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {filterOptions.map((opt) => (
                        <label
                            key={opt.value}
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border cursor-pointer select-none
                                ${selectedFilters.includes(opt.value) ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                        >
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4"
                                checked={selectedFilters.includes(opt.value)}
                                onChange={() => toggleFilter(opt.value)}
                            />
                            <span className="text-sm">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Merge Requests</h2>
                <span>Visible: {visibleMergeRequests.length} / {mergeRequest.length}</span>
                {visibleMergeRequests.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No merge requests found.</p>
                ) : (
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {visibleMergeRequests.map((mr: MergeRequestModel, index: number) => (
                            <MergeRequestItem key={index} mergeRequest={mr}/>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
};
export default GitLab;
