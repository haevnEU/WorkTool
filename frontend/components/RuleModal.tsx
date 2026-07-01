// TypeScript
// frontend/components/RuleModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { FormatRule } from "../types.ts";
import { Save, X } from "lucide-react";

type Target = "mandatory" | "optional";

type Props = {
    isOpen: boolean;
    initialRule?: FormatRule | null;
    initialTarget?: Target;
    onClose: () => void;
    onSave: (rule: FormatRule, target: Target) => void;
};

export default function RuleModal({ isOpen, initialRule, initialTarget = "mandatory", onClose, onSave }: Props): React.ReactElement | null {
    const [fieldName, setFieldName] = useState("");
    const [description, setDescription] = useState("");
    const [column, setColumn] = useState<number | undefined>(undefined);
    const [target, setTarget] = useState<Target>(initialTarget);
    const [regex, setRegex] = useState("");
    const [choice, setChoice] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // touched state for inline validation
    const [touchedField, setTouchedField] = useState(false);
    const [touchedColumn, setTouchedColumn] = useState(false);

    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        if (initialRule) {
            setFieldName(initialRule.fieldName ?? "");
            setDescription(initialRule.description ?? "");
            setColumn(initialRule.column === -1 ? undefined : initialRule.column);
            setRegex(initialRule.regex ?? "");
            setChoice(initialRule.choice ?? "");
            setErrorCode(initialRule.errorCode ?? "");
            setErrorMessage(initialRule.errorMessage ?? "");
            setTarget(initialRule.optional ? "optional" : initialTarget);
        } else {
            clearForm();
            setTarget(initialTarget);
        }
        // reset touched state when opening
        setTouchedField(false);
        setTouchedColumn(false);
    }, [isOpen, initialRule, initialTarget]);

    // close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                clearForm();
                onClose();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    function clearForm() {
        setFieldName("");
        setDescription("");
        setColumn(undefined);
        setRegex("");
        setChoice("");
        setErrorCode("");
        setErrorMessage("");
        setTouchedField(false);
        setTouchedColumn(false);
    }

    const isFieldValid = fieldName.trim().length > 0;
    const isColumnValid = column !== undefined && !Number.isNaN(column);
    const isSaveDisabled = !isFieldValid || !isColumnValid;

    function handleSave() {
        // mark touched so errors display
        setTouchedField(true);
        setTouchedColumn(true);

        if (!isFieldValid || !isColumnValid) {
            return;
        }

        const rule: FormatRule = {
            fieldName: fieldName.trim(),
            description: description,
            column: column ?? -1,
            optional: target === "optional",
            regex: regex || undefined,
            choice: choice || undefined,
            errorCode: errorCode || undefined,
            errorMessage: errorMessage || undefined,
            identifierColumn: 0,
        };

        onSave(rule, target);
        clearForm();
        onClose();
    }

    function handleCancel() {
        clearForm();
        onClose();
    }

    function handleKeyActivate(e: React.KeyboardEvent, action: () => void, disabled?: boolean) {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            action();
        }
    }

    function handleBackdropMouseDown(e: React.MouseEvent) {
        // close when clicking directly on the backdrop (outside the modal)
        if (e.target === overlayRef.current) {
            clearForm();
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onMouseDown={handleBackdropMouseDown}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                <h4 className="text-lg font-medium mb-3">{initialRule ? "Edit Rule" : "Add Rule"}</h4>

                <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="rule-target" className="w-28 text-xs text-white">Target</label>
                    <select
                        id="rule-target"
                        value={target}
                        onChange={(e) => setTarget(e.target.value as Target)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    >
                        <option value="mandatory">Mandatory</option>
                        <option value="optional">Optional</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="rule-field" className="w-28 text-xs text-white">
                        Field
                        <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                    </label>
                    <input
                        id="rule-field"
                        placeholder="fieldName"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        onBlur={() => setTouchedField(true)}
                        aria-required
                        aria-invalid={!isFieldValid && touchedField}
                        className={`flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm ${!isFieldValid && touchedField ? "border-red-600" : ""}`}
                    />
                </div>
                {(!isFieldValid && touchedField) && (
                    <div className="text-xs text-red-600 mb-2 ml-28">Field is required.</div>
                )}

                <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="rule-desc" className="w-28 text-xs text-white">Description</label>
                    <input
                        id="rule-desc"
                        placeholder="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="rule-column" className="w-28 text-xs text-white">
                        Column
                        <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                    </label>
                    <input
                        id="rule-column"
                        placeholder="column (required)"
                        type="number"
                        value={column ?? ""}
                        onChange={(e) => setColumn(e.target.value === "" ? undefined : Number(e.target.value))}
                        onBlur={() => setTouchedColumn(true)}
                        aria-required
                        aria-invalid={!isColumnValid && touchedColumn}
                        className={`flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm ${!isColumnValid && touchedColumn ? "border-red-600" : ""}`}
                    />
                </div>
                {(!isColumnValid && touchedColumn) && (
                    <div className="text-xs text-red-600 mb-2 ml-28">Column is required and must be a number.</div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="rule-regex" className="w-28 text-xs text-white">Regex</label>
                    <input
                        id="rule-regex"
                        placeholder="regex (optional)"
                        value={regex}
                        onChange={(e) => setRegex(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="rule-choice" className="w-28 text-xs text-white">Choice</label>
                    <input
                        id="rule-choice"
                        placeholder="choice (comma separated, optional)"
                        value={choice}
                        onChange={(e) => setChoice(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="rule-errorcode" className="w-28 text-xs text-white">Error Code</label>
                    <input
                        id="rule-errorcode"
                        placeholder="errorCode (optional)"
                        value={errorCode}
                        onChange={(e) => setErrorCode(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <label htmlFor="rule-errormsg" className="w-28 text-xs text-white">Error Msg</label>
                    <input
                        id="rule-errormsg"
                        placeholder="errorMessage (optional)"
                        value={errorMessage}
                        onChange={(e) => setErrorMessage(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                    />
                </div>

                <div className="flex gap-2 mt-2 justify-end items-center">
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={handleCancel}
                        onKeyDown={(e) => handleKeyActivate(e, handleCancel)}
                        className="p-2 rounded border border-red-600 bg-red-600 text-white text-sm flex items-center justify-center cursor-pointer"
                        aria-label="Cancel"
                    >
                        <X className="w-4 h-4 text-white" aria-hidden="true" />
                        <span className="sr-only">Cancel</span>
                    </span>

                    <span
                        role="button"
                        tabIndex={isSaveDisabled ? -1 : 0}
                        onClick={() => { if (!isSaveDisabled) handleSave(); }}
                        onKeyDown={(e) => handleKeyActivate(e, handleSave, isSaveDisabled)}
                        className={`p-2 rounded text-sm flex items-center justify-center ${isSaveDisabled ? "bg-green-600 opacity-50 pointer-events-none" : "bg-green-600 cursor-pointer"}`}
                        aria-label="Save"
                        aria-disabled={isSaveDisabled}
                    >
                        <Save className="w-4 h-4 text-white" aria-hidden="true" />
                        <span className="sr-only">Save</span>
                    </span>
                </div>
            </div>
        </div>
    );
}