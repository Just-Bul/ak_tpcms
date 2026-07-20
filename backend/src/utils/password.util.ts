import bcrypt from "bcrypt";
import "dotenv/config";

class PasswordManager {
    static hashRounds = parseInt(process.env.PASSWORD_SALT ?? "0");

    static async hashPassword(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, this.hashRounds);
        return hash;
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        const verified = await bcrypt.compare(password, hash);
        return verified;
    }
}

export default PasswordManager;