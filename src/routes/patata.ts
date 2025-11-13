import {Router} from "express";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";

const router = Router();



router.get("/",verifyToken, async (req:AuthRequest,res)=>{
    res.json({
        message:"Todo correcto",
        user: req.user
    })
}
)
export default router;