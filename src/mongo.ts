import {Db, MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config(); 

let client : MongoClient
let db : Db


export const connectToMongoDb = async (): Promise<void>=>{
    try{
        console.log("estamos dentro")
        const urlMongo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.CLUSTER}.rinwayw.mongodb.net/?appName=${process.env.CLUSTER_NAME}`;
        const urlMongoProfe = "mongodb+srv://kirk:patataEspacial@mongomake.3ta2r.mongodb.net/?appName=MongoMake"
        client = new MongoClient(urlMongo);

        await client.connect(); 
        db = client.db("EjercicioClase")

            console.log("Conectado a Mongo my g");


    } catch(error){
        console.error("Error al conectar a Mongo");
        process.exit(1); }
  
} 
export const getDB=(): Db => db; 