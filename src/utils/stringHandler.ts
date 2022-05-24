const escapeRegExpMatch = function (s: string) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const isExactMatch = (str: string, match: string) => {
    return new RegExp(`\\b${escapeRegExpMatch(match)}\\b`).test(str);
};
