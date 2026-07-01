// typescript
// Replace `snippetManager/frontend/utils/CopyToClipBoard.ts` with:
export async function copyTextToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    // Must be called from a user gesture (click/tap) on many browsers (especially iOS)
    try {
        console.log("Copying to clipboard...");
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            // optional: check permission first when supported
            try {
                // @ts-ignore (some TS libs lack the type)
                const perm = navigator.permissions && await navigator.permissions.query({name: 'clipboard-write'});
                if (!perm || perm.state === 'granted' || perm.state === 'prompt') {
                    await navigator.clipboard.writeText(text);

                    return true;
                }
            } catch {
                // permission query failed — still attempt write
                await navigator.clipboard.writeText(text);
                return true;
            }
        }
    } catch (e) {
        // fall through to fallback
    }

    // Last-resort fallback: hidden textarea + deprecated execCommand('copy')
    try {
        const doc = document;
        const previousSelection = doc.getSelection && doc.getSelection()!.rangeCount > 0
            ? doc.getSelection()!.getRangeAt(0)
            : null;

        console.log("Using fallback copy method");
        const textarea = doc.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '0';
        textarea.style.top = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';
        textarea.style.background = 'transparent';
        textarea.style.fontSize = '12px'; // avoid iOS zoom

        doc.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        console.log("Executing copy command...");
        const successful = doc.execCommand && doc.execCommand('copy');

        console.log("Copy command was " + (successful ? "successful" : "unsuccessful"));
        doc.body.removeChild(textarea);
        const sel = doc.getSelection && doc.getSelection();
        if (sel) {
            sel.removeAllRanges();
            if (previousSelection) sel.addRange(previousSelection);
        }

        return Boolean(successful);
    } catch {
        return false;
    }
}