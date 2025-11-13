import {Router} from "express";
import dotenv from "dotenv";
import type { ObjectId } from "mongodb";
import { getDB } from "../mongo";
import bcrypt from "bcryptjs";
import jtw from "jsonwebtoken";
dotenv.config();

const router = Router();

const SECRET = process.env.SECRET
const coleccion = () => getDB().collection<User>("usuarios");

type User = {
    _id?: ObjectId,
    email:string,
    password:string
}
router.post("/register", async (req,res)=>{
    try{
        const {email,password} = req.body as User; //o {email:string; password:string} asigna lo que recibe del req.body en cada variable, a las nuevas variables; email y password 
        const users = await coleccion();
        const existing = await users.findOne({email}) // igual que poner ({email:email})
        if (existing){
            return res.status(404).json({message: "Ya existe un usuario con ese email"});
        }
        //para encriptar (bcrypt : encriptacion muy basica pero buena)
        const passToEncripta = await bcrypt.hash(password,10);
        await users.insertOne({email, password: passToEncripta})
            res.status(201).json({message:"Usuario creado guay"})
        }

    catch(err){
        res.status(500).json({message:err})
        }
    });

    router.post("/login", async(req,res)=>{
        try{
            const {email,password} = req.body as User;
            const users = await coleccion();
            const user = await users.findOne({email});
            if(!user){
                return res.status(404).json({message: "No existe un usuario con ese email"});
            }
            const passEncriptaYSinEncriptaIguales = await bcrypt.compare(password,user.password);
            if(!passEncriptaYSinEncriptaIguales) return res.status(401).json({message:"Contraseña Incorrecta"});

            const token = jtw.sign({id:user._id?.toString(),email:user.email},SECRET as string,{
                expiresIn: "1h"
            });
                
            res.json({message: "Login completado ESTAS DENTRO", token})
        }  

    catch(err){
        res.status(500).json({message:err})
        }
    })





export default router;