import type { Carts, Product, Users } from "./types";
import {Router} from "express";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { getDB } from "../mongo";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";
dotenv.config();

const router = Router();
const coleccionCarts = () => getDB().collection<Carts>("carts");
const coleccionUsers = () => getDB().collection<Users>("usuarios");
const coleccionProducts = () => getDB().collection<Product>("products");

type UserJwt = {
    id:string,
    email:string
}


router.get("/",verifyToken,async (req:AuthRequest,res)=>{
    try{
    const usuario = req.user as UserJwt
    const userId = new ObjectId(usuario.id)
    
    const carts = await coleccionCarts();
    const cart = await carts.findOne({userId: userId});

    res.status(200).json({cart});
} catch (error){
    console.error("Get /api/cart error", error);
    res.status(500).json({message:"Error interno"})
}

})

router.put("/add",verifyToken, async (req:AuthRequest,res)=>{
    try{
        const usuario = req.user as UserJwt
        const userId = new ObjectId(usuario.id)
        if((!req.body.id && !req.body.quantity) || typeof(req.body) !== "object"){
        return res.status(400).json({ message: "Invalid JSON body" });
        }
        const { id,quantity } = req.body as {id:string, quantity:number};
        if(!id||!quantity||quantity<=0){
            return res.status(400).json({message:"Datos inválidos"});
        }
        const producto = await coleccionProducts().findOne({_id:new ObjectId(id)})
        if(!producto){
             return res.status(404).json({message:"Product not found"}); 
        }
        if(producto.stock < quantity){
            return res.status(400).json({message:"Insufficient stock"}); 
        }
        const result = await coleccionProducts().updateOne( { _id: new ObjectId(id) },{ $inc: { stock: -quantity } });

        let carrito = await coleccionCarts().findOne({ userId });
        if(!carrito){
            const carritos = {
                _id: new ObjectId,
                userId: userId,
                items: []
            }
            await coleccionCarts().insertOne(carritos)
        }
        await coleccionCarts().updateOne({ userId }, { $push: { items: { idProducto: new ObjectId(id), quantity } } });

    res.json({message: "Stock actualizado correctamente " , cart:result });
    
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Error al actualizar el carrito"})

    }
    })
export default router;