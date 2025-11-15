import { connectToMongoDb } from "./mongo";
import express from "express";
import rutasAuth from "./routes/auth";
import rutasProducto from "./routes/products";
import rutasCarts from "./routes/carts";

import {Db, MongoClient} from "mongodb";


let client: MongoClient;
let db: Db;

connectToMongoDb();
const app = express();
app.use(express.json())
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     if (err instanceof SyntaxError && "body" in err) {
//         return res.status(400).json({ message: "Invalid JSON body" });
//     }
//     next();
// });

app.use("/api/auth", rutasAuth);
app.use("/api/products",rutasProducto);
app.use("/api/cart",rutasCarts);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});




app.listen(3000, ()=>{console.log("esto funciona y esta en el puerto 3000")})

