import express from "express";
import { 
    watch,
    getUpload,
    getEdit,
    postEdit, 
    postUpload,
    deleteVideo
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middleware";

const videoRouter = express.Router(); 

videoRouter.route("/:id([0-9a-f]{24})").get(watch);  
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit); 
videoRouter.route("/:id([0-9a-f]{24})/delete").get(protectorMiddleware, deleteVideo); 
videoRouter.get("/upload", protectorMiddleware, getUpload);
videoRouter.post("/upload", protectorMiddleware, videoUpload.fields([
    { name: "video" },
    { name: "thumb" },
]), 
postUpload
);   

export default videoRouter;

