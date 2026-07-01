import React, {useCallback} from 'react';
import {
    Ban,
    CircleAlert,
    CircleArrowRight,
    CircleCheckBig,
    CircleQuestionMark,
    ClipboardPlus,
    Loader,
    Merge,
    MoveRight,
    Share2,
    X
} from 'lucide-react';
import {useTheme} from '../../hooks/useTheme.ts';
import {MergeRequestModel} from "../../types/MergeRequestModel.ts";

interface SnippetModalProps {
    mergeRequest: MergeRequestModel;
}


const MergeRequestItem: React.FC<SnippetModalProps> = ({mergeRequest}: SnippetModalProps) => {
    const {theme} = useTheme();
    const visit = useCallback(() => {
        if (mergeRequest) {
            window.open(mergeRequest.web_url, '_blank');
        }
    }, [mergeRequest]);
    const getBackground = () => {
        console.log(mergeRequest.pipeline?.status);

        if (mergeRequest.has_conflicts && mergeRequest.pipeline?.status === 'failed') {
            return theme === 'light' ? 'bg-gradient-to-r from-red-50 to-violet-50' : 'bg-gradient-to-r from-red-900/10 to-violet-900/10';
        } else if (mergeRequest.has_conflicts) {
            return theme === 'light' ? 'bg-red-50' : 'bg-red-900/10';
        } else if (mergeRequest.pipeline && mergeRequest.pipeline.status === 'failed') {
            return theme === 'light' ? 'bg-violet-50' : 'bg-violet-900/10';
        } else {
            return theme === 'light' ? 'bg-green-50' : 'bg-green-900/20';
        }
    };

    const getIcon = () => {
        switch (mergeRequest.pipeline?.status) {
            case 'failed':
                return <CircleAlert className="h-4 w-4 mr-1 text-red-500"/>;
            case 'success':
                return <CircleCheckBig className="h-4 w-4 mr-1 text-green-500"/>;
            case 'running':
                return <Loader className="h-4 w-4 mr-1 text-blue-500 animate-spin"/>;
            case 'canceled':
                return <Ban className="h-4 w-4 mr-1 text-orange-500"/>;
            case 'skipped':
                return <CircleArrowRight className="h-4 w-4 mr-1 text-orange-500"/>;
            default:
                return <span><CircleQuestionMark className="h-4 w-4 mr-1 text-gray-500"/>{mergeRequest.pipeline?.status}</span>;
        }
    }

    const getStateIcon = () => {
        switch (mergeRequest.state) {
            case 'opened':
                return <Merge className="h-4 w-4 mr-1 text-purple-500"/>;
            case 'closed':
                return <X className="h-4 w-4 mr-1 text-red-500"/>;
            case 'merged':
                return <ClipboardPlus className="h-4 w-4 mr-1 text-green-500"/>;
            default:
                return <span><CircleQuestionMark className="h-4 w-4 mr-1 text-gray-500"/>{mergeRequest.state}</span>;
        }
    }


    const getAvatar = (person: any) => {
        if (person?.avatar_url) {
            return <img src={person.avatar_url} alt={person.name} className="h-6 w-6 rounded-full inline-block mr-1"/>
        } else {
            return <CircleQuestionMark className="h-6 w-6     rounded-full inline-block mr-1 text-red-500"/>

        }
    }

    const getPersonRow = () => {
        return <div className="flex flex-wrap gap-4 mb-4">
            <div>
                {getAvatar(mergeRequest.assignee)}
                <span className="text-sm text-gray-600 dark:text-gray-400 mb-4">Author: {mergeRequest.assignee?.name}</span>
            </div>
            <div>
                {getAvatar(mergeRequest.assignee)}
                <span className="text-sm text-gray-600 dark:text-gray-400 mb-4">Assignee: {mergeRequest.assignee?.name || 'Unassigned'}</span>
            </div>
            <div>
                {getAvatar(mergeRequest.reviewers[0])}
                <span className="text-sm text-gray-600 dark:text-gray-400 mb-4">Reviewers: {mergeRequest.reviewers.length > 0 ? mergeRequest.reviewers.map(r => r.name).join(', ') : 'None'}</span>
            </div>
        </div>
    }

    return (
        <div className="mb-4">
            <div className={`border rounded-lg p-4 ${getBackground()}`}>
                <span className="flex items-center mb-2">
                    {getIcon()}
                    {getStateIcon()}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{mergeRequest.title}</h3>
                </span>
                <div className="flex items-center gap-6 flex-nowrap overflow-x-auto">
                    <div className="flex items-center">  {/*animate-pulse*/}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Source: {mergeRequest.source_branch}</span>
                        <MoveRight className="h-4 w-4 mx-1 text-gray-500 self-center"/>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Target: {mergeRequest.target_branch}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created: {mergeRequest.created_at}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last updated: {mergeRequest.updated_at}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{mergeRequest.description}</p>
                {getPersonRow()}
                <button
                    onClick={visit}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <Share2 className="h-4 w-4 mr-1"/>
                    View on GitLab
                </button>
            </div>
        </div>
    );
};

export default MergeRequestItem;
