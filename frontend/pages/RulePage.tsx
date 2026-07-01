// frontend/pages/RulePage.tsx
import React, { useRef, useState, ChangeEvent } from "react";
import { ruleService } from "../services/RuleService.ts";
import { downloadUtils } from "../utils/DownloadUtils.ts";
import RuleGeneration from "../components/RuleGeneration";

export default function RulePage(): React.ReactElement {
    const docInputRef = useRef<HTMLInputElement | null>(null);
    const [docFiles, setDocFiles] = useState<File[]>([]);
    const [docUploading, setDocUploading] = useState(false);
    const [docMessage, setDocMessage] = useState<string | null>(null);
    const [docError, setDocError] = useState<string | null>(null);

    function validateXmlFiles(files: File[] | null) {
        if (!files || files.length === 0) return "No files selected";
        for (const f of files) {
            const name = f.name.toLowerCase();
            if (!name.endsWith(".xml")) return "Only .xml files are allowed";
        }
        return null;
    }

    function openDocPicker() {
        docInputRef.current?.click();
    }

    function onDocInputChange(e: ChangeEvent<HTMLInputElement>) {
        const fileList = Array.from(e.target.files ?? []);
        const err = validateXmlFiles(fileList.length ? fileList : null);
        setDocError(err);
        setDocFiles(err ? [] : fileList);
    }

    async function handleGenerate() {
        setDocMessage(null);
        setDocError(null);
        if (docFiles.length === 0) {
            setDocError("No XML file selected");
            return;
        }
        setDocUploading(true);
        try {
            const response = await ruleService.createDocumentation(docFiles);
            await downloadUtils.download(response);
            setDocMessage("Generation succeeded");
            setDocFiles([]);
            if (docInputRef.current) docInputRef.current.value = "";
        } catch (err) {
            setDocError("Generation failed");
            console.error(err);
        } finally {
            setDocUploading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <div className="w-full max-w-4xl space-y-8">
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                        Generate Documentation
                    </h2>

                    <div className="flex items-center gap-3">
                        <input
                            ref={docInputRef}
                            type="file"
                            accept=".xml,application/xml,text/xml"
                            onChange={onDocInputChange}
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={openDocPicker}
                            className="px-3 py-2 rounded border bg-gray-50 dark:bg-gray-700 text-sm"
                        >
                            Choose files
                        </button>

                        <div className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">
                            {docFiles.length ? docFiles.map(f => f.name).join(", ") : "No file selected"}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={docFiles.length === 0 || docUploading}
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                        >
                            {docUploading ? "Generating..." : "Generate"}
                        </button>
                    </div>

                    {(docMessage || docError) && (
                        <div className={"mt-3 text-sm " + (docError ? "text-red-600" : "text-green-600")}>
                            {docError ?? docMessage}
                        </div>
                    )}
                </section>

                <RuleGeneration />
            </div>
        </div>
    );
}