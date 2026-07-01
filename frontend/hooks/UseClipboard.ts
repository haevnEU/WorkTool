import {copyTextToClipboard} from "../utils/CopyToClipBoard.ts";
import {useCallback, useState} from "react";

export function useClipboard() {
    const [isCopying, setIsCopying] = useState(false);
    const supported = typeof navigator !== 'undefined' && (!!navigator.clipboard || !!document.queryCommandSupported && document.queryCommandSupported('copy'));

    const copy = useCallback(async (text: string) => {
        setIsCopying(true);
        if(navigator.clipboard && window.isSecureContext){
            try{
                await navigator.clipboard.writeText(text);
                setIsCopying(false);

                return true;
            }catch(err){
                console.warn("Clipboard API failed, use fallback");
            }
        }
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            return true;
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            return true;
        } finally {

            document.body.removeChild(textArea);
            setIsCopying(false);

        }

    }, []);

    return {copy, isCopying, supported};
}