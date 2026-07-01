// file: `frontend/components/TicketModal.tsx`
import React, {useEffect, useState} from 'react';
import {ExternalLink, GitPullRequest, X} from 'lucide-react';
import textile from 'textile-js';
import sanitizeHtml from 'sanitize-html';
import {ticketService} from '../../services';
import {useToast} from '../../hooks/useToast.ts';
import {TicketJournalModel} from "../../types/TicketJournalModel.ts";
import {TicketModel} from "../../types/TicketModel.ts";
import {TicketAdditionalInfoModel} from "../../types/TicketAdditionalModel.ts";

interface TicketModalProps {
    open: boolean;
    onClose: () => void;
    ticket?: TicketModel | null;
    additionalInfo?: TicketAdditionalInfoModel | null;
}

const TicketModal: React.FC<TicketModalProps> = ({open, onClose, ticket, additionalInfo}) => {
    const toast = useToast();
    const [descriptionHTML, setDescriptionHTML] = useState<string>('');
    const [commentsHTML, setCommentsHTML] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'description' | 'comments' | 'checklist' | 'note' | 'files'>('description');
    const [note, setNote] = useState<string>(additionalInfo?.notes || '');

    // Convert plain ticket refs like "#1234" in HTML to anchor tags pointing to the ticketUrl base.
    const linkifyTicketRefs = (html: string, baseUrl?: string) => {
        if (!baseUrl) return html;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const isForbiddenAncestor = (node: Element | null) => {
                while (node && node !== doc.body) {
                    const tag = node.tagName?.toLowerCase();
                    if (tag === 'a' || tag === 'code' || tag === 'pre' || tag === 'script' || tag === 'style') return true;
                    node = node.parentElement;
                }
                return false;
            };

            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
            const textNodes: Node[] = [];
            let tn: Node | null = walker.nextNode();
            while (tn) {
                textNodes.push(tn);
                tn = walker.nextNode();
            }

            const regex = /#(\d+)/g;
            textNodes.forEach((textNode) => {
                const parentEl = textNode.parentElement;
                if (!parentEl || isForbiddenAncestor(parentEl)) return;
                const text = textNode.nodeValue || '';
                if (!regex.test(text)) return;

                regex.lastIndex = 0;
                const frag = doc.createDocumentFragment();
                let lastIndex = 0;
                let m: RegExpExecArray | null;
                while ((m = regex.exec(text)) !== null) {
                    const idx = m.index;
                    const id = m[1];
                    if (idx > lastIndex) frag.appendChild(doc.createTextNode(text.slice(lastIndex, idx)));
                    const a = doc.createElement('a');
                    a.textContent = `#${id}`;
                    const baseClean = baseUrl.replace(/\/+$/, '');
                    a.setAttribute('href', `https://pm.hausheld.info/issues/${encodeURIComponent(id)}`);
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'noreferrer noopener');
                    frag.appendChild(a);
                    lastIndex = idx + m[0].length;
                }
                if (lastIndex < text.length) frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
                textNode.parentNode?.replaceChild(frag, textNode);
            });

            return doc.body.innerHTML;
        } catch (e) {
            // on any error, return original
            // eslint-disable-next-line no-console
            console.error('linkifyTicketRefs failed', e);
            return html;
        }
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        const raw = ticket?.description ?? '';
        if (!raw) {
            setDescriptionHTML('');
            return;
        }

        try {
            const html = textile(raw);
            const clean = sanitizeHtml(html, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'ul', 'ol', 'li'
                ]),
                allowedAttributes: {
                    a: ['href', 'name', 'target', 'rel'],
                    img: ['src', 'alt', 'title'],
                    '*': ['class'],
                },
                allowedSchemes: ['http', 'https', 'mailto', 'data'],
                transformTags: {
                    a: sanitizeHtml.simpleTransform('a', {target: '_blank', rel: 'noreferrer noopener'}),
                    h1: sanitizeHtml.simpleTransform('h1', {class: 'font-bold'}),
                    h2: sanitizeHtml.simpleTransform('h2', {class: 'font-bold'}),
                    h3: sanitizeHtml.simpleTransform('h3', {class: 'font-bold'}),
                    h4: sanitizeHtml.simpleTransform('h4', {class: 'font-bold'}),
                    h5: sanitizeHtml.simpleTransform('h5', {class: 'font-bold'}),
                    h6: sanitizeHtml.simpleTransform('h6', {class: 'font-bold'}),
                    ul: sanitizeHtml.simpleTransform('ul', {class: 'list-disc pl-6 space-y-1'}),
                    ol: sanitizeHtml.simpleTransform('ol', {class: 'list-decimal pl-6 space-y-1'}),
                    li: sanitizeHtml.simpleTransform('li', {class: 'ml-0'}),
                },
            });
            const linked = linkifyTicketRefs(clean, ticket?.ticketUrl);
            setDescriptionHTML(linked);
        } catch (e) {
            setDescriptionHTML('');
            // eslint-disable-next-line no-console
            console.error('Failed to render ticket description:', e);
        }
    }, [ticket]);

    useEffect(() => {
        const journals = ticket?.journals ?? [];
        if (!journals || journals.length === 0) {
            setCommentsHTML([]);
            return;
        }

        const rendered = journals.map((j: any) => {
            const notesRaw = j.notes ?? '';
            const created = j.created_on ?? j.createdOn ?? '';
            try {
                const html = textile(notesRaw || '');
                const clean = sanitizeHtml(html, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                        'img', 'pre', 'code', 'ul', 'ol', 'li'
                    ]),
                    allowedAttributes: {
                        a: ['href', 'name', 'target', 'rel'],
                        img: ['src', 'alt', 'title'],
                        '*': ['class'],
                    },
                    allowedSchemes: ['http', 'https', 'mailto', 'data'],
                    transformTags: {
                        a: sanitizeHtml.simpleTransform('a', {target: '_blank', rel: 'noreferrer noopener'}),
                        ul: sanitizeHtml.simpleTransform('ul', {class: 'list-disc pl-6 space-y-1'}),
                        ol: sanitizeHtml.simpleTransform('ol', {class: 'list-decimal pl-6 space-y-1'}),
                        li: sanitizeHtml.simpleTransform('li', {class: 'ml-0'}),
                    },
                });
                const linked = linkifyTicketRefs(clean, ticket?.ticketUrl);
                return `<div class="mb-4"><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${created}</div><div>${linked}</div></div>`;
            } catch (e) {
                return `<div class="mb-4"><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${created}</div><div><em>Failed to render comment.</em></div></div>`;
            }
        });

        setCommentsHTML(rendered);
    }, [ticket]);

    if (!open) return null;
    // file: `frontend/components/TicketModal.tsx` (updated helper)
    const renderJournalEntry = (journal: TicketJournalModel, index: number) => {
        const notesRaw = journal.notes ?? '';
        const created = journal.created_on ?? '';
        const userName = journal.user?.name ?? 'Unknown';
        const isRight = journal.user?.id === 388 || journal.id === -1;

        try {
            const html = textile(notesRaw || '');
            const clean = sanitizeHtml(html, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'ul', 'ol', 'li']),
                allowedAttributes: {a: ['href', 'name', 'target', 'rel'], img: ['src', 'alt', 'title'], '*': ['class']},
                allowedSchemes: ['http', 'https', 'mailto', 'data'],
                transformTags: {
                    a: sanitizeHtml.simpleTransform('a', {target: '_blank', rel: 'noreferrer noopener'}),
                    ul: sanitizeHtml.simpleTransform('ul', {class: 'list-disc pl-6 space-y-1'}),
                    ol: sanitizeHtml.simpleTransform('ol', {class: 'list-decimal pl-6 space-y-1'}),
                    li: sanitizeHtml.simpleTransform('li', {class: 'ml-0'}),
                },
            });
            const linked = linkifyTicketRefs(clean, ticket?.ticketUrl);

            const generateColorByName = (name: string) => {
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                const hue = hash % 360;
                const hsl = `hsl(${hue}, 60%, 70%)`;

                return `bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white`;
            };

            const userColor = generateColorByName(userName);

            return (
                <div key={index} className={`mb-4 flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{userName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{created}</div>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-lg break-words ${isRight ? 'bg-blue-600 text-white dark:bg-blue-500' : userColor}`}
                            dangerouslySetInnerHTML={{__html: linked}}
                        />
                    </div>
                </div>
            );
        } catch {
            return (
                <div key={index} className={`mb-4 flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{userName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{created}</div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${isRight ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                            <em>Failed to render comment.</em>
                        </div>
                    </div>
                </div>
            );
        }
    };
    const mrUrl = ticket?.mergeRequestUrl;
    const ticketUrl = ticket?.ticketUrl;

    const descriptionTab = () => {
        return (
            <div dangerouslySetInnerHTML={{__html: descriptionHTML || '<em>No description available.</em>'}}/>
        )
    }

    const createChecklist = async () => {
        try {
            await ticketService.createChecklistFromTicket(ticket);
            toast.showToast("Checklist created successfully.", "success");
        } catch (err) {
            console.error("Failed to create checklist from ticket:", err);
            toast.showToast(err.message, "error");
        }
    }

    const checklistTab = () => {
        return (
            <>
                {
                    ticket.checklist.length === 0 ? (
                        <>
                            <em>No Checklist available.</em>
                            <br></br>
                            <button onClick={async () => await createChecklist()} className="ml-auto px-3 py-1.5 mt-4 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Create Checklist
                            </button>
                        </>) : (
                        ticket.checklist.map((item, index) => (
                            <div key={index} className="mb-2" title={`Created at: ${item.created_at}\nUpdated at: ${item.updated_at}\nPosition: ${item.position}`}>
                                <label className="inline-flex items-center group cursor-default select-none">
                                    <input
                                        type="checkbox"
                                        checked={item.is_done}
                                        readOnly
                                        disabled={true}
                                        tabIndex={-1}
                                        aria-disabled="true"
                                        className="sr-only peer"
                                    />
                                    <div className="h-6 w-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 transition-colors duration-150 group-hover:border-gray-400 peer-checked:bg-gradient-to-br peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:border-transparent peer-focus:ring-2 peer-focus:ring-blue-400 shadow-sm">
                                        <svg className="h-4 w-4 text-white transform scale-75 opacity-0 peer-checked:scale-100 peer-checked:opacity-100 transition-all duration-150" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                            <path d="M4 10l3 3 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex items-baseline space-x-3">
                                        <span className={`${item.is_done ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{item.subject}</span>
                                        {item.updated_at && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Updated: {item.updated_at}</span>
                                        )}
                                    </div>
                                </label>
                            </div>
                        ))
                    )
                }
            </>
        )
    }

    const commentsTab = () => {
        return (
            <>
                {
                    ticket.journals.length === 0 ? (
                        <em>No comments available.</em>
                    ) : (
                        ticket.journals.map((journal, index) => (
                            renderJournalEntry(journal, index)
                        ))
                    )
                }
            </>
        )
    }

    const saveNote = async () => {
        const ticketId = ticket?.ticketId;
        if (!ticketId) {
            toast.showToast("Ticket ID is missing. Cannot save note.", "error");
            return;
        }
        try {
            await ticketService.addNoteToTicket(ticketId, note);
            toast.showToast("Note saved successfully.", "success");
        } catch (err) {
            console.error("Failed to save note:", err);
            toast.showToast(err.message, "error");
        }
    }

    const noteTab = () => {
        return (
            <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold mb-2">Notizen</h2>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 w-full min-h-0 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                />
                <div className="mt-2 flex justify-end">
                    <button
                        onClick={async () => await saveNote()}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    };

    const guessMimeType = (filename?: string, fallback?: string) => {
        if (fallback) return fallback;
        console.log(filename)
        const ext = (filename?.split('.').pop() || '').toLowerCase();
        if (ext === 'png') return 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'gif') return 'image/gif';
        if (ext === 'webp') return 'image/webp';
        if (ext === 'svg') return 'image/svg+xml';
        return 'application/octet-stream';
    };

    const bytesToDataUrl = (file: any) => {
        const content = file?.content;
        const mime = guessMimeType(file?.filename, file?.contentType || file?.mimeType);

        if (!content) return '';

        if (typeof content === 'string') {
            if (content.startsWith('data:') || content.startsWith('http://') || content.startsWith('https://')) {
                return content;
            }
            // assume base64 string
            return `data:${mime};base64,${content.replace(/\s/g, '')}`;
        }

        const bytes: Uint8Array =
            content instanceof Uint8Array
                ? content
                : Array.isArray(content)
                    ? new Uint8Array(content)
                    : Array.isArray(content?.data)
                        ? new Uint8Array(content.data)
                        : new Uint8Array();

        if (bytes.length === 0) return '';

        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return `data:${mime};base64,${btoa(binary)}`;
    };

    const deleteFile = async (filename: string) => {
        // call backend to delete by filename (name or filename)
        try {
            await ticketService.deleteFile(ticket!.ticketId, filename);
            const data = await ticketService.fetchAdditionalInfo(ticket!.ticketId);
            if (additionalInfo) additionalInfo.imageList = data.imageList;
            toast.showToast("File deleted.", "success");
        } catch (err) {
            console.error('Failed to delete file', err);
            toast.showToast(err?.message || 'Failed to delete file', 'error');
        }
    }

    const addFiles = async () => {
        // show file chooser dialog and upload selected files to the server, then refresh additional info
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            // accept removed -> allow any file type
            input.click();

            input.onchange = async () => {
                if (!input.files || input.files.length === 0) return;
                const files = Array.from(input.files);
                await ticketService.uploadFiles(ticket!.ticketId, files);
                const data = await ticketService.fetchAdditionalInfo(ticket!.ticketId);
                if (additionalInfo) additionalInfo.imageList = data.imageList;
                toast.showToast("Files uploaded successfully.", "success");
            };
        } catch (err: any) {
            console.error("Failed to upload files:", err);
            toast.showToast(err?.message || "Failed to upload files.", "error");
        }
    }

    const openImage = async (filename: string) => {
        const file = additionalInfo?.imageList?.find(f => (f.name === filename || f.filename === filename || f.name === filename));
        if (!file) {
            toast.showToast("File not found.", "error");
            return;
        }
        const src = bytesToDataUrl(file);
        if (!src) {
            toast.showToast("Failed to open file.", "error");
            return;
        }

        const mime = guessMimeType(file?.filename, file?.contentType || file?.mimeType);
        const isImage = mime.startsWith('image/') || src.startsWith('data:image');

        if (isImage) {
            const newWin = window.open();
            if (!newWin) {
                toast.showToast('Unable to open new window (popup blocked?)', 'error');
                return;
            }
            newWin.document.write(`<html><head><title>${filename}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#111">
<img src=\"${src}\" alt=\"${filename}\" style=\"max-width:100%;max-height:100%;object-fit:contain;\"/></body></html>`);
            newWin.document.close();
        } else {
            // For non-image types, trigger download instead of trying to preview
            downloadFile(file.name || file.filename || filename);
        }
    }

    const downloadFile = async (filename: string) => {
        const file = additionalInfo?.imageList?.find(f => (f.name === filename || f.filename === filename || f.name === filename));
        if (!file) {
            toast.showToast("File not found.", "error");
        }
        const src = bytesToDataUrl(file);
        if (!src) {
            toast.showToast("Failed to download file.", "error");
        }

        const link = document.createElement('a');
        link.href = src;
        link.download = file.filename || file.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link.click();


    }

    const filesTab = () => {
        return (
            <div>
                <h2 className="text-lg font-bold mb-2">Attached Files</h2>
                <button onClick={async () => {
                    await addFiles();
                }} className="mb-4 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Add Files
                </button>
                {additionalInfo?.imageList && additionalInfo.imageList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {additionalInfo.imageList.map((file, index) => {
                            const src = bytesToDataUrl(file);
                            const mime = guessMimeType(file?.filename, file?.contentType || file?.mimeType);
                            const isImage = mime.startsWith('image/') && src;
                            return (
                                <div key={index}>
                                    {isImage ? (
                                        <img
                                            src={src}
                                            alt={file.filename || file.name}
                                            style={{maxHeight: '300px', minHeight: '300px', width: 'auto'}}
                                            className="max-w-full h-auto rounded-md border border-gray-300 dark:border-gray-600"
                                            title={file.filename || file.name}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 h-72">
                                            <div className="text-center p-4">
                                                <div className="text-sm font-semibold">{file.filename || file.name}</div>
                                                <div className="text-xs text-gray-500">{mime}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center mt-1 space-x-2">
                                        <button onClick={async () => await deleteFile(file.name || file.filename || '')} className="px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700 rounded-full hover:bg-red-200 dark:hover:bg-red-600 transition-colors">
                                            Delete
                                        </button>
                                        <button onClick={async () => await openImage(file.name || file.filename || '')} className="ml-2 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700 rounded-full hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors">
                                            View
                                        </button>
                                        <button onClick={async () => await downloadFile(file.name || file.filename || '')} className="ml-2 px-2 py-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-700 rounded-full hover:bg-green-200 dark:hover:bg-green-600 transition-colors">
                                            Download
                                        </button>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{file.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <em>No files attached to this ticket.</em>
                )}
            </div>
        )
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ticket-modal-title"
                className="relative z-10 w-4/5 max-w-none mx-4 h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
                <div className="flex items-start justify-between px-6 py-4 border-b dark:border-gray-700">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {`[${ticket?.tracker}] #${ticket?.ticketId} ${ticket?.title}`}
                            </h3>
                        </div>

                        <span className="text-sm font-semibold text-primary dark:text-primary-400 mt-1 self-start">
                            #{ticket?.project}
                        </span>
                        <div
                            className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-sm text-gray-700 dark:text-gray-300 mb-2">

                            <span className="truncate text-left">Erstelldatum: {ticket?.createdOn}</span>
                            <span className="truncate text-left">Letztes Update: {ticket?.lastUpdatedOn}</span>
                            <span className="truncate text-left">Geschätzter Aufwand: {ticket?.estimatedHours}h</span>
                            <span className="truncate text-left">Aufwand: {ticket?.spentHours}h</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                    >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-3 py-1.5 rounded-t-md text-sm font-semibold ${activeTab === 'description' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Beschreibung
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`px-3 py-1.5 rounded-t-md text-sm font-semibold ${activeTab === 'comments' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Kommentare
                        </button>
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`px-3 py-1.5 rounded-t-md text-sm font-semibold ${activeTab === 'checklist' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Checklist
                        </button>
                        <button
                            onClick={() => setActiveTab('note')}
                            className={`px-3 py-1.5 rounded-t-md text-sm font-semibold ${activeTab === 'note' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Notizen
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`px-3 py-1.5 rounded-t-md text-sm font-semibold ${activeTab === 'files' ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Dateien
                        </button>
                    </div>
                </div>

                {/* Content area grows and scrolls if necessary */}
                <div className="flex-1 px-6 py-6 overflow-auto bg-white dark:bg-gray-800">
                    {activeTab === 'description' ? descriptionTab() : null}
                    {activeTab === 'comments' ? commentsTab() : null}
                    {activeTab === 'checklist' ? checklistTab() : null}
                    {activeTab === 'note' ? noteTab() : null}
                    {activeTab === 'files' ? filesTab() : null}
                </div>

                {/* Bottom bar */}
                <div
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-300"></div>
                    <div className="flex items-center space-x-3">
                        {mrUrl && (
                            <a
                                href={mrUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                            >
                                <GitPullRequest className="h-3.5 w-3.5"/>
                                <span>Merge Request</span>
                                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70"/>
                            </a>
                        )}
                        {ticketUrl && (
                            <a
                                href={ticketUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5"/>
                                <span>Redmine</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;

