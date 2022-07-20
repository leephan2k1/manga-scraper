export function isEmptyObject(obj: any) {
    if (
        obj &&
        Object.keys(obj).length === 0 &&
        Object.getPrototypeOf(obj) === Object.prototype
    ) {
        return true;
    }

    return false;
}
