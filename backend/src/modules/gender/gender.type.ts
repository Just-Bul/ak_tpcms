import type { gender_table } from "@prisma/client";

export interface IGender extends gender_table{};
// export interface IGender {
//     gender_id: number,
//     gender: string,
// }