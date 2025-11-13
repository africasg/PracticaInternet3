import {Router} from "express";
import dotenv from "dotenv";
import type { ObjectId } from "mongodb";
import { getDB } from "../mongo";
import bcrypt from "bcryptjs";
import jtw from "jsonwebtoken";
import type { Users } from "./types";
dotenv.config();

const router = Router();

const SECRET = process.env.SECRET
const coleccionUsers = () => getDB().collection<Users>("users");


router.post("/register", async (req,res)=>{
    try{
        const {username,email,passwordHash} = req.body as Users; 
        const users = await coleccionUsers();
        const existing = await users.findOne({email}) 
        if (existing){
            return res.status(409).json({error: "El usuario o email ya existe"});
        }
        //para encriptar (bcrypt : encriptacion muy basica pero buena)
        const passToEncripta = await bcrypt.hash(passwordHash,10);
        const fecha : Date = new Date;
        await users.insertOne({username, email, passwordHash: passToEncripta, createdAt:fecha})
            res.status(201).json({message:"User created"})
        }

    catch(err){
        res.status(500).json({message:err})
        }
    });

    router.post("/login", async(req,res)=>{
        try{
            const {email,passwordHash} = req.body as Users;
            const users = await coleccionUsers();
            const user = await users.findOne({email});
            if(!user){
                return res.status(404).json({message: "No existe un usuario con ese email"});
            }
            const passEncriptaYSinEncriptaIguales = await bcrypt.compare(passwordHash,user.passwordHash);
            if(!passEncriptaYSinEncriptaIguales) return res.status(401).json({message:"Contraseña Incorrecta"});

            const token = jtw.sign({id:user._id?.toString(),email:user.email},SECRET as string,{
                expiresIn: "1h"
            });
             res.status(200).json({token:token})   
            // res.json({message: "Login completado ESTAS DENTRO", token})
        }  

    catch(err){
        res.status(404).json({message:err})
        }
    })





export default router;