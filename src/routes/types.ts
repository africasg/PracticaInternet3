import { ObjectId } from "mongodb";

export type Users = {
   _id?: ObjectId,
    username: string,
    email: string,
    passwordHash: string //hash bcrypt
    createdAt: Date
};
export type Product = {
    _id?: ObjectId,
    name: string, 
    description?: string, 
    price: number,
    stock: number, 
    createdAt: Date 
};
export type Carts = {
    _id: ObjectId
    userId: ObjectId, //(referencia a users), único por usuario
    items: Items []  //Array de objetos
}
export type Items = {
      idProducto :ObjectId,
        quantity : number
}
