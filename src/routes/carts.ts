import type { Carts, Product, Users } from "./types";
import {Router} from "express";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { getDB } from "../mongo";
import bcrypt from "bcryptjs";
import jtw from "jsonwebtoken";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";
dotenv.config();

const router = Router();
const coleccionCarts = () => getDB().collection<Carts>("carts");
const coleccionUsers = () => getDB().collection<Users>("usuarios");
const coleccionProducts = () => getDB().collection<Product>("products");

router.get("/",verifyToken,async (req:AuthRequest,res)=>{
    const username = req.user;
    const users = await coleccionUsers();
    const usuario = await coleccionUsers().findOne({username});
    const idUser = usuario?._id;

    const carts = await coleccionCarts();
    const cart = await coleccionCarts().findOne({userId: idUser});

    res.status(200).json({cart});
})

router.put("/add",async (req:AuthRequest,res)=>{
    try{
        const user = await coleccionUsers().findOne({username:req.user});
        let userId = new ObjectId;
        user ? userId = user._id : new ObjectId()

        const { id,quantity } = req.body as {id:string, quantity:number};
        if(!id||!quantity||quantity<=0){
            return res.status(400).json({message:"Datos inválidos"});
        }
        const producto = await coleccionProducts().findOne({_id:new ObjectId(id)})
        if(!producto){
             return res.status(404).json({message:"No existe el producto "}); //mirar
        }

        if(producto.stock < quantity){
            return res.status(400).json({message:"Insufficient stock"}); 
        }
        const result = await coleccionProducts().updateOne(
            {_id:new ObjectId(id)},
            {$inc:{stock: -quantity}} // se resta la cantidad del stock
        );

        const carritos = await coleccionCarts().findOne({userId})
        carritos?.items.push({quantity:quantity, idProducto: new ObjectId(id)});
        
        res.json({message: "Stock actualizado correctamente " , cart:result });
    
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Error al actualizar el carrito"})

    }
    })
export default router;