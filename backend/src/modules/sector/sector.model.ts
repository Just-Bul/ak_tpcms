import prisma from "../../config/db.prisma.js";
export class Sector {
  static async findAll() {
    return prisma.sector_table.findMany({
      orderBy: {
        sector_id: 'asc',
      },
      select: {
        sector_id: true,
        sector_name: true,
        sector_shorthand: true,
      },
    })
  }
}