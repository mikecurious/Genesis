const normalizePhoneNumber = (rawNumber) => {
    if (!rawNumber) return null;
    const cleaned = String(rawNumber).replace('whatsapp:', '').trim();
    if (!cleaned) return null;

    const hasPlus = cleaned.startsWith('+');
    const digits = cleaned.replace(/\D/g, '');
    if (!digits) return null;

    return hasPlus ? `+${digits}` : `+${digits}`;
};

module.exports = {
    normalizePhoneNumber
};
