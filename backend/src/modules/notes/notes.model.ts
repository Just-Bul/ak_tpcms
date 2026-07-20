import prisma from "../../config/db.prisma.js"

class Notes {
    static async create(data: {
        creator_id: number,
        title: string,
        description?: string | null,
        note_url: string
    }) {
        const note = await prisma.note_table.create({
            data
        });
        return note;
    }

    static async findAll() {
        const noteList = await prisma.note_table.findMany();
        return noteList;
    }

    static async findById(note_id: number) {
        const note = await prisma.note_table.findUnique({
            where: {
                note_id
            }
        });
        return note;
    }

    static async findByCreatorId(creator_id: number) {
        const noteList = await prisma.note_table.findMany({
            where: {
                creator_id
            }
        });
        return noteList;
    }
}

export default Notes;