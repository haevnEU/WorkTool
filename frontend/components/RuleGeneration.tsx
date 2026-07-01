// typescript
import React, { useState } from "react";
import { FormatRule, ValidationSchema } from "../types.ts";
import { ruleService } from "../services/RuleService.ts";
import { downloadUtils } from "../utils/DownloadUtils.ts";
import RuleModal from "./RuleModal.tsx";

export default function RuleGeneration(): React.ReactElement {
    const [schema, setSchema] = useState<ValidationSchema>({
        readableName: "",
        schemaName: "",
        headerIdentifier: "",
        headerIdentifierColumn: 0,
        idColumn: 0,
        idName: "",
        totalColumns: undefined,
        mandatory: [],
        optional: [],
    });

    // editing state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingOriginalTarget, setEditingOriginalTarget] = useState<"mandatory" | "optional" | null>(null);

    // modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    function updateSchema<K extends keyof ValidationSchema>(key: K, value: ValidationSchema[K]) {
        setSchema(prev => ({ ...prev, [key]: value }));
    }

    function startEdit(target: "mandatory" | "optional", index: number) {
        setEditingIndex(index);
        setEditingOriginalTarget(target);
        setIsModalOpen(true);
    }

    function openAddModal() {
        setEditingIndex(null);
        setEditingOriginalTarget(null);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingIndex(null);
        setEditingOriginalTarget(null);
    }

    function handleSave(rule: FormatRule, target: "mandatory" | "optional") {
        // if editing, remove original and append to target (supports moving between lists)
        if (editingIndex !== null && editingOriginalTarget !== null) {
            setSchema(prev => {
                const mandatory = [...prev.mandatory];
                const optional = [...prev.optional];

                if (editingOriginalTarget === "mandatory") {
                    mandatory.splice(editingIndex, 1);
                } else {
                    optional.splice(editingIndex, 1);
                }

                if (target === "mandatory") mandatory.push(rule);
                else optional.push(rule);

                return { ...prev, mandatory, optional };
            });
            closeModal();
            return;
        }

        // normal add
        setSchema(prev => ({
            ...prev,
            [target]: [...prev[target], rule],
        }));
        closeModal();
    }

    function removeRule(target: "mandatory" | "optional", index: number) {
        // if removing currently edited rule, close modal / clear editing state
        if (editingIndex === index && editingOriginalTarget === target) {
            closeModal();
        }
        setSchema(prev => {
            const arr = [...prev[target]];
            arr.splice(index, 1);
            return { ...prev, [target]: arr };
        });
    }

    async function submitSchema() {
        try {
            console.log("Submitting schema", schema);
            const resp = await ruleService.createValidationSchema(schema);
            downloadUtils.download(resp);
        } catch (err) {
            console.error(err);
        }
    }

    // provide initialRule to modal when editing
    const initialRule = (editingIndex !== null && editingOriginalTarget !== null)
        ? schema[editingOriginalTarget][editingIndex]
        : undefined;

    const initialTarget = (editingOriginalTarget ?? "mandatory");

    return (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Rule Generation</h2>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Left: metadata + open modal */}
                <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-3 rounded space-y-3">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Readable Name</label>
                    <input
                        value={schema.readableName}
                        onChange={(e) => updateSchema("readableName", e.target.value)}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-300">Schema Name</label>
                    <input
                        value={schema.schemaName}
                        onChange={(e) => updateSchema("schemaName", e.target.value)}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-300">Header Identifier</label>
                    <input
                        value={schema.headerIdentifier}
                        onChange={(e) => updateSchema("headerIdentifier", e.target.value)}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-300">Header Identifier Column</label>
                    <input
                        type="number"
                        value={schema.headerIdentifierColumn}
                        onChange={(e) => updateSchema("headerIdentifierColumn", Number(e.target.value))}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-300">ID Name</label>
                    <input
                        value={schema.idName}
                        onChange={(e) => updateSchema("idName", e.target.value)}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-300">Total Columns</label>
                    <input
                        type="number"
                        value={schema.totalColumns ?? ""}
                        onChange={(e) => updateSchema("totalColumns", e.target.value === "" ? undefined : Number(e.target.value))}
                        className="w-full px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />

                    <div className="border-t pt-3 mt-2">
                        <h4 className="text-sm font-medium mb-2">Rules</h4>
                        <button
                            onClick={openAddModal}
                            className="px-3 py-1 rounded bg-blue-600 text-white text-sm mb-2 w-full"
                        >
                            Add Rule
                        </button>

                        <div className="mt-3">
                            <button onClick={submitSchema} className="px-3 py-1 rounded bg-green-600 text-white text-sm w-full">
                                Save Schema (example)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: two lists */}
                <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 border rounded">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Mandatory</h3>
                        {schema.mandatory.length === 0 ? (
                            <div className="text-sm text-gray-500">None</div>
                        ) : (
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                {schema.mandatory.map((r, i) => (
                                    <li key={i} className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">{r.fieldName}</div>
                                            <div className="text-xs text-gray-500">{r.description}</div>
                                            <div className="text-xs text-gray-400">col: {r.column}</div>
                                            {r.regex && <div className="text-xs text-gray-400">regex: {r.regex}</div>}
                                            {r.choice && <div className="text-xs text-gray-400">choice: {r.choice}</div>}
                                            {r.errorCode && <div className="text-xs text-red-600">code: {r.errorCode}</div>}
                                            {r.errorMessage && <div className="text-xs text-red-600">{r.errorMessage}</div>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <button onClick={() => startEdit("mandatory", i)} className="text-blue-600 text-sm">Edit</button>
                                            <button onClick={() => removeRule("mandatory", i)} className="text-red-600 text-sm">Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 border rounded">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">Optional</h3>
                        {schema.optional.length === 0 ? (
                            <div className="text-sm text-gray-500">None</div>
                        ) : (
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                {schema.optional.map((r, i) => (
                                    <li key={i} className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">{r.fieldName}</div>
                                            <div className="text-xs text-gray-500">{r.description}</div>
                                            <div className="text-xs text-gray-400">col: {r.column}</div>
                                            {r.regex && <div className="text-xs text-gray-400">regex: {r.regex}</div>}
                                            {r.choice && <div className="text-xs text-gray-400">choice: {r.choice}</div>}
                                            {r.errorCode && <div className="text-xs text-red-600">code: {r.errorCode}</div>}
                                            {r.errorMessage && <div className="text-xs text-red-600">{r.errorMessage}</div>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <button onClick={() => startEdit("optional", i)} className="text-blue-600 text-sm">Edit</button>
                                            <button onClick={() => removeRule("optional", i)} className="text-red-600 text-sm">Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <RuleModal
                isOpen={isModalOpen}
                initialRule={initialRule}
                initialTarget={initialTarget}
                onClose={closeModal}
                onSave={handleSave}
            />
        </section>
    );
}