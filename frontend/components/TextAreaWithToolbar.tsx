import React, {useRef} from 'react';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import {Bold, Italic, List, ListOrdered} from 'lucide-react';

interface TextAreaWithToolbarProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    rows?: number;
    placeholder?: string;
}

const EditorToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    'aria-label': string
}> = (props) => (
    <button
        type="button"
        onClick={props.onClick}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
        aria-label={props['aria-label']}
    >
        {props.children}
    </button>
);

const TextAreaWithToolbar: React.FC<TextAreaWithToolbarProps> = ({id, value, onChange, readOnly, ...props}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Render full CommonMark when readOnly; use `marked` to parse and `sanitize-html` to sanitize output.
    const renderFormatted = (text: string) => {
        if (!text) return '';
        try {
            const raw = marked.parse(text);
            const clean = sanitizeHtml(raw, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code']),
                allowedAttributes: {
                    a: ['href', 'name', 'target', 'rel'],
                    img: ['src', 'alt', 'title'],
                    '*': ['class'],
                },
                allowedSchemes: ['http', 'https', 'mailto', 'data'],
            });
            return clean;
        } catch (e) {
            // fallback to escaped text
            return sanitizeHtml(escapeHtml(text));
        }
    };

    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const applyFormat = (format: 'bold' | 'italic' | 'ul' | 'ol') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let newText;

        switch (format) {
            case 'bold':
                newText = `**${selectedText}**`;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                break;
            case 'ul':
                newText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
                break;
            case 'ol':
                newText = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
                break;
            default:
                newText = selectedText;
        }

        onChange(value.substring(0, start) + newText + value.substring(end));

        // Focus and adjust cursor position after formatting
        textarea.focus();
        setTimeout(() => {
            if (format === 'bold' || format === 'italic') {
                textarea.setSelectionRange(start + 2, end + 2);
            } else {
                textarea.setSelectionRange(start, start + newText.length);
            }
        }, 0);
    };

    const commonClasses = 'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm resize-y';
    const readOnlyClasses = 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700';
    const editableClasses = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-primary focus:border-primary';

    return (
        <div
            className={`rounded-md border ${readOnly ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary'}`}>
            {!readOnly && (
                <div
                    className="flex items-center space-x-1 p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-md">
                    <EditorToolbarButton onClick={() => applyFormat('bold')} aria-label="Bold"><Bold
                        size={16}/></EditorToolbarButton>
                    <EditorToolbarButton onClick={() => applyFormat('italic')} aria-label="Italic"><Italic
                        size={16}/></EditorToolbarButton>
                    <EditorToolbarButton onClick={() => applyFormat('ul')} aria-label="Unordered List"><List size={16}/></EditorToolbarButton>
                    <EditorToolbarButton onClick={() => applyFormat('ol')} aria-label="Ordered List"><ListOrdered
                        size={16}/></EditorToolbarButton>
                </div>
            )}
            {readOnly ? (
                <div className={`w-full p-2 prose dark:prose-invert sm:prose-sm`} dangerouslySetInnerHTML={{__html: renderFormatted(value)}} />
            ) : (
                <textarea
                    ref={textareaRef}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    className={`w-full p-2 bg-transparent focus:outline-none resize-y sm:text-sm ${readOnly ? '' : ''}`}
                    // FIX: The `ring` property is not a valid CSS property for inline styles. It's a Tailwind utility. Removed it to fix the TypeScript error.
                    style={{border: 'none', boxShadow: 'none'}}
                    {...props}
                />
            )}
        </div>
    );
};

export default TextAreaWithToolbar;