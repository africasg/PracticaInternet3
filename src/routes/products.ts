import {Router} from "express";
import { Product } from "./types";
import dotenv from "dotenv";
import { getDB } from "../mongo";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";
dotenv.config();
const router = Router();

const coleccionProducts = () => getDB().collection<Product>("products");

router.get("/", async (req,res)=>{
    try{
        const productos = await coleccionProducts().find().toArray();
        res.status(200).json({productos});
    }catch(err){
        console.log("get /api/products error", err);
        res.status(500).json({message:"error interno"});
    }
})

router.post("/",verifyToken, async (req:AuthRequest,res)=>{
    try {
        if((!req.body.name && !req.body.price && !req.body.stock && !req.body.description) || typeof(req.body) !== "object"){
        return res.status(400).json({ message: "Invalid JSON body" });
    }
        const {name, description,price,stock} = req.body as Product;
        
        if(!name || typeof name !== "string" || name.trim().length === 0){
            return res.status(400).json({message: "El campo 'name' es obligatorio"});
        }

        if(price === undefined || typeof price !== "number"){
            return res.status(400).json({message: "El campo 'price' es obligatorio y debe ser número"});
        }

        if(price <= 0){
            return res.status(400).json({message: "El 'price' debe ser mayor que 0"});
        }

        if(stock === undefined || typeof stock !== "number"){
            return res.status(400).json({message: "Campo 'stock' es obligatorio y debe ser número"});
        }

        if(stock < 0){
            return res.status(400).json({message: "El 'stock' debe ser >= 0"});
        }
       
        const productoAInsertar : Product ={
            name,
            description: typeof description === "string" ? description.trim() : "",
            price,
            stock,
            createdAt: new Date()
        }

        const resultado = await coleccionProducts().insertOne(productoAInsertar);
        const creado = await coleccionProducts().findOne({_id: resultado.insertedId});

        res.status(201).json({message:"Producto creado guay", creado});

    }catch(err){
        console.log("post /api/products error",err);
        res.status(500).json({message:"error interno"});
    }

})
export default router;
