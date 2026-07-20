
class Data {
    static filterUndefined(dataObject: Object): Object {
        return Object.fromEntries(
            Object.entries(dataObject).filter(([_, value]) => value !== undefined)
        );
    }

    static sanitize(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;
        const clone = { ...obj };
        delete clone.password;
        if (clone.user_table && typeof clone.user_table === 'object') {
            clone.user_table = { ...clone.user_table };
            delete clone.user_table.password;
        }
        return clone;
    }
}

export default Data;