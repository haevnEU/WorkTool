// typescript
import { JSX, useEffect, useState, useMemo, FormEvent, ChangeEvent } from "react";
import {useTheme} from "../hooks/useTheme.ts";
import {CustomError, FileEntry} from "../types.ts";
import {uploadService} from "../services/UploadService.ts";
import {Delete} from "lucide-react";
import {downloadUtils} from "../utils/DownloadUtils.ts";

type ToastType = "success" | "error";
type ToastState = { visible: boolean; message: string; type?: ToastType };

export default function FileUploadPage(): JSX.Element {
    const { theme } = useTheme();
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [selected, setSelected] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    // search state
    const [search, setSearch] = useState<string>("");

    // simple toast state
    const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });

    useEffect(() => {
        loadFiles();
    }, []);

    // auto-dismiss toast
    useEffect(() => {
        if (!toast.visible) return;
        const id = setTimeout(() => setToast({ visible: false, message: "" }), 3000);
        return () => clearTimeout(id);
    }, [toast.visible]);

    function showToast(message: string, type: ToastType = "success") {
        setToast({ visible: true, message, type });
    }

    async function loadFiles() {
        setLoading(true);
        try {
            const files = await uploadService.fetchFiles();
            setFiles(files);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload(e?: FormEvent) {
        e?.preventDefault();
        if (selected.length === 0) return;
        setUploading(true);
        try {
            await uploadService.uploadFile(selected);
            setSelected([]);
            await loadFiles();
            showToast("Upload succeeded", "success");
        } catch (err) {
            if (err instanceof CustomError) {
                showToast(`Upload failed: ${err.message}`, "error");
            } else if (err instanceof Error) {
                showToast(`Upload failed: ${err.message}`, "error");
            } else {
                showToast("Upload failed. Please try again.", "error");
            }
            console.error(err);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(shortId: string) {
        const prev = files;
        setFiles((f) => f.filter((x) => x.shortId !== shortId));
        try {
            await uploadService.deleteFile(shortId);
            showToast("Deleted", "success");
        } catch {
            setFiles(prev);
            showToast("Delete failed", "error");
        }
    }

    async function handleDownload(shortId: string) {
        try{
            const downloadFile = await uploadService.downloadFile(shortId);
            await downloadUtils.download(downloadFile);
            showToast("Download started", "success");
        }catch (err) {
            showToast("Download failed", "error");
        }
    }

    // memoized filtered files based on search term
    const filteredFiles = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q === "") return files;
        return files.filter(f => f.filename.toLowerCase().includes(q));
    }, [files, search]);

    return (
        <div className="p-6 font-sans min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            {/* Toast */}
            {toast.visible && (
                <div
                    role="status"
                    className={
                        "fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-sm " +
                        (toast.type === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white")
                    }
                >
                    {toast.message}
                </div>
            )}

            <header className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">File Upload</h1>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {files.length} file{files.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </header>

            <section className="mb-6">
                <form className="flex items-center gap-3" onSubmit={handleUpload}>
                    <input
                        type="file"
                        multiple
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                            setSelected(ev.target.files ? Array.from(ev.target.files) : [])
                        }
                        className="block file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                    />
                    <button
                        type="submit"
                        disabled={selected.length === 0 || uploading}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </form>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    You can drag files into the picker or choose multiple files.
                </div>
                {selected.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Selected: {selected.map((f) => f.name).join(", ")}
                    </div>
                )}
            </section>

            {/* Search container below upload */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <label htmlFor="file-search" className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Suche
                    </label>

                    <input
                        id="file-search"
                        type="search"
                        value={search}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="flex-1 px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                    />

                    {search ? (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="w-9 h-9 flex items-center justify-center rounded border border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                            <Delete />
                        </button>
                    ) : (
                        <div className="w-9" aria-hidden="true" />
                    )}
                </div>
            </div>

            <section>
                {loading ? (
                    <div className="text-gray-600 dark:text-gray-300">Loading files…</div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-gray-600 dark:text-gray-300">
                        {search ? "No files match your search" : "No files"}
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredFiles.map((f) => (
                            <div
                                key={f.shortId}
                                className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700"
                            >
                                <button
                                    aria-label={`Delete ${f.filename}`}
                                    onClick={() => handleDelete(f.shortId)}
                                    className="absolute -top-2 -right-2 bg-white border text-gray-600 hover:text-red-600 shadow rounded-full w-7 h-7 flex items-center justify-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-red-400"
                                >
                                    ×
                                </button>

                                <div className="truncate font-medium mb-4" title={f.filename}>
                                    {f.filename}
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleDownload(f.shortId)}
                                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}