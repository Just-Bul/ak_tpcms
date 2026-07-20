import type { NextFunction, Request, Response } from "express";

export const uploadController = async (
    req: Request, 
    res: Response,
    next: NextFunction
) => { 
    try {
        if (!req.file && !req.files) {                                                                                                                        
            return res.status(400).json({                                                                                                       
                success: false,                                                                                                                 
                message: "No file uploaded"                                                                                                     
            });                                                                                                                                 
        }

        let fileUrl = null
        if (req.file) {
            fileUrl = `${req.protocol}://${req.get("host")}/${req.file.destination}${req.file.filename}`
        } else if (Array.isArray(req.files)) {
            fileUrl = req.files.map((file) => `${req.protocol}://${req.get("host")}/${file.destination}${file.filename}`)
        }

        res.status(200).json({                                                                                                                  
            success: true,                                                                                                                      
            message: "File uploaded successfully",                                                                                              
            fileUrl: fileUrl                                                                 
        });                                                                                                                                     
    } catch (error) {
        next(error);
    }                                  
}    