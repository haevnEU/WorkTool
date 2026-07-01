// frontend/pages/SharedLinksPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Loader, Share2, Trash2 } from 'lucide-react';
import { userService } from '../services';
import { shareService } from "../services/ShareService.ts";
import copy from "copy-to-clipboard";

type SharedLink = {
    shortId: string;
    shareType?: string;
    creationDate?: number;
    expirationDate?: number;
};

type SortBy = 'link' | 'type' | 'creation' | 'expiration' | null;
type SortDir = 'asc' | 'desc' | null;

const SharedLinksPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
    const [sortBy, setSortBy] = useState<SortBy>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                const links = await userService.getAllGeneratedLinks();
                const mapped: SharedLink[] = Array.isArray(links)
                    ? links.map((l: any) => (typeof l === 'string' ? { shortId: l } : l))
                    : [];
                setSharedLinks(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const refreshLinks = async () => {
        try {
            const links = await userService.getAllGeneratedLinks();
            const mapped: SharedLink[] = Array.isArray(links)
                ? links.map((l: any) => (typeof l === 'string' ? { shortId: l } : l))
                : [];
            setSharedLinks(mapped);
        } catch (e) {
            console.error(e);
        }
    };

    const visit = (linkId: string) => {
        window.open("#/share/" + linkId, '_blank');
    };

    const deleteShare = async (linkId: string) => {
        try {
            await userService.deleteSharedResource(linkId);
            await refreshLinks();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSort = (col: SortBy) => {
        if (sortBy !== col) {
            setSortBy(col);
            setSortDir('asc');
            return;
        }
        // same column: asc -> desc -> none
        if (sortDir === 'asc') {
            setSortDir('desc');
        } else if (sortDir === 'desc') {
            setSortBy(null);
            setSortDir(null);
        } else {
            setSortDir('asc');
        }
    };

    const sortedLinks = useMemo(() => {
        if (!sortBy || !sortDir) return sharedLinks;
        const arr = [...sharedLinks];
        arr.sort((a, b) => {
            const getVal = (item: SharedLink) => {
                if (sortBy === 'link') {
                    return shareService.convertIdToShareableLink(item.shortId).toLowerCase();
                }
                if (sortBy === 'type') {
                    return (item.shareType ?? '').toLowerCase();
                }
                if (sortBy === 'creation') {
                    return item.creationDate ?? 0;
                }
                if (sortBy === 'expiration') {
                    return item.expirationDate ?? 0;
                }
                return '';
            };

            const va = getVal(a);
            const vb = getVal(b);

            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDir === 'asc' ? va - vb : vb - va;
            }
            if (typeof va === 'string' && typeof vb === 'string') {
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return 0;
        });
        return arr;
    }, [sharedLinks, sortBy, sortDir]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const toDate = (timestamp?: number) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        const day = date.getDate();
        const monthShort = date.toLocaleString('en-US', { month: 'short' });
        return `${day} ${monthShort}. ${date.getFullYear()}`;
    };

    const sortIndicator = (col: SortBy) => {
        if (sortBy !== col || !sortDir) return '⇅';
        return sortDir === 'asc' ? '▲' : '▼';
    };

    return (
        <div>
            <div className="flex items-center space-x-3 mb-6">
                <Share2 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Links</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-5xl mx-auto">
                {sortedLinks.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No shared links found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <button type="button" onClick={() => toggleSort('link')} className="flex items-center gap-2">
                                            <span>Full Link</span><span aria-hidden="true">{sortIndicator('link')}</span>
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <button type="button" onClick={() => toggleSort('type')} className="flex items-center gap-2">
                                            <span>Type</span><span aria-hidden="true">{sortIndicator('type')}</span>
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <button type="button" onClick={() => toggleSort('creation')} className="flex items-center gap-2">
                                            <span>Creation Date</span><span aria-hidden="true">{sortIndicator('creation')}</span>
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <button type="button" onClick={() => toggleSort('expiration')} className="flex items-center gap-2">
                                            <span>Expiration Date</span><span aria-hidden="true">{sortIndicator('expiration')}</span>
                                        </button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedLinks.map((item, idx) => {
                                    const fullLink = shareService.convertIdToShareableLink(item.shortId);
                                    return (
                                        <tr key={item.shortId ?? idx}>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 break-all">
                                                <a href={fullLink} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400">
                                                    {fullLink}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                {item.shareType ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                {toDate(item.creationDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                {toDate(item.expirationDate)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => { copy(fullLink); }}
                                                        className="p-2 rounded"
                                                        aria-label="Copy link"
                                                        title="Copy link"
                                                    >
                                                        <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => visit(item.shortId)}
                                                        className="p-2 rounded"
                                                        aria-label="Visit link"
                                                        title="Open link in new tab"
                                                    >
                                                        <ExternalLink className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteShare(item.shortId)}
                                                        className="p-2 rounded"
                                                        aria-label="Delete Share"
                                                        title="Delete the Share"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedLinksPage;