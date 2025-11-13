import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

const SECRET = process.env.SECRET;

export interface AuthRequest extends Request { //si el middleware esta bien, se ejecutará esto
    user?: string | jwt.JwtPayload; //los datos que te devuelven jwt, es como un json
};


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction):void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        res.status(401).json({ message: "No hay token" });
        return;
    };

    jwt.verify(token, SECRET as string, (err, decoded) => {
        if(err){
            res.status(403).json({ message: "Invalid access token" });
            return;
        }
        req.user = decoded;
        next();
    })
}