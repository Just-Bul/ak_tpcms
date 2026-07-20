import jwt from "jsonwebtoken";
import "dotenv/config"
import ApiError from "./ApiError.js";

export interface UserJwtPayload extends jwt.JwtPayload {
    auth_user_id: number,
    auth_email: string,
    auth_role_id: number
};

export class Jwt {
    static sign(payload: UserJwtPayload): string {
        if (!process.env.JWT_TOKEN) {                                                                                                               
            throw new Error("CRITICAL CONFIGURATION ERROR: JWT_TOKEN is not defined in the environment.");                                          
        }    
        return jwt.sign(payload, process.env.JWT_TOKEN || "", {expiresIn: "12h"});
    }

    static verify(token: string): UserJwtPayload {
        if (!process.env.JWT_TOKEN) {                                                                                                               
            throw new Error("CRITICAL CONFIGURATION ERROR: JWT_TOKEN is not defined in the environment.");                                          
        }   
        const decoded = jwt.verify(token, process.env.JWT_TOKEN || "");
        if (typeof decoded === "string") {
            throw new ApiError(500, "Format of decoed jwt token is broken(string)");
        }
        return decoded as UserJwtPayload; 
    }
};