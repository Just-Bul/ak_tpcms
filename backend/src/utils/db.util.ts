import NodeCache from "node-cache";

export function buildUpdateQuery<T extends Record<string, unknown>>(payload: T): {setClauses: string, values: NonNullable<T[keyof T]>[]} {
    const fields = Object.keys(payload).filter(
        (key) => payload[key as keyof T] !== undefined
    );

    if (fields.length === 0) {
        return { setClauses: "", values: []}
    }

    const setClauses = fields.map(
        (field) => `${field} = ?`
    ).join(", ");

    const values = fields.map(
        (field) => payload[field as keyof T] as NonNullable<T[keyof T]>
    );

    return {setClauses, values}
}