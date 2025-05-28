// src/utils/passwordGenerationCore.js
import { CHAR_SETS } from './constants';

export function generatePasswordFromSiteKeyWithPaperTemplate(siteKey, templateString) {
    if (!templateString) {
        console.error("Template string is undefined or null");
        return "Error:TemplateMissing";
    }
    let password = "";
    let siteKeyIndex = 0;

    for (let i = 0; i < templateString.length; i++) {
        const templateChar = templateString[i];
        const charSet = CHAR_SETS[templateChar];

        if (charSet) {
            const charSetIndex = siteKey[siteKeyIndex % siteKey.length] % charSet.length;
            password += charSet[charSetIndex];
            siteKeyIndex++;
        } else {
            password += templateChar;
            console.warn(`Unknown template character: ${templateChar}`);
        }
    }
    return password;
}