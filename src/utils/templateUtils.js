// src/utils/templateUtils.js

export const PASSWORD_TEMPLATES = {
    maxSecurity: ["anoxxxxxxxxxxxxxxxxx", "axxxxxxxxxxxxxxxxxno", "xoxxxxxxxxxxxxxxxxxo"],
    long: ["CvcvnoCvcvCvcv", "CvcvCvcvnoCvcv", "CvcvCvcvCvcvno"],
    medium: ["CvcnoCvc", "CvcCvcno"],
    basic: ["aaanaaan", "aannaaan", "aaannaaa"], // (Letter+Num, 8 chars)
    short: ["cvcn"], // (4 chars)
    pin: ["nnnn"], // (4 Digits)
    shortChars: ["cvccvcvcv"] // (Letters Only, 9 chars)
};

// Bu yapı React Native Picker için daha uygun
export const PASSWORD_TYPE_OPTIONS = [
    { id: 'maxSecurity', label: "Maksimum Güvenlik (20 kr.)" },
    { id: 'long', label: "Uzun (14 kr.)" },
    { id: 'medium', label: "Orta (8 kr.)" },
    { id: 'basic', label: "Temel (Harf+Rakam, 8 kr.)" },
    { id: 'short', label: "Kısa (4 kr.)" },
    { id: 'pin', label: "PIN (4 Rakam)" },
    { id: 'shortChars', label: "Kısa (Sadece Harf, 9 kr.)" },
];

// passwordType ID'sine göre label döndüren bir yardımcı fonksiyon
export const getPasswordTypeLabelById = (typeId) => {
    const option = PASSWORD_TYPE_OPTIONS.find(opt => opt.id === typeId);
    return option ? option.label : typeId;
};


export function selectTemplateBySiteKey(siteKey, passwordType) {
    const templates = PASSWORD_TEMPLATES[passwordType];
    if (!templates || templates.length === 0) {
        console.warn(`No templates found for passwordType: ${passwordType}. Falling back to maxSecurity.`);
        // Varsayılan olarak ilk şablonu veya belirli bir şablonu döndür
        const fallbackType = PASSWORD_TYPE_OPTIONS[0]?.id || 'maxSecurity';
        const fallbackTemplates = PASSWORD_TEMPLATES[fallbackType];
        return fallbackTemplates[0];
    }

    let sum = 0;
    for (let i = 0; i < siteKey.length; i += 2) {
        sum += siteKey[i];
    }
    const selectedIndex = sum % templates.length;
    return templates[selectedIndex];
}