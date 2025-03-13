import express from "express";
import { createGroup, deleteGroup, getGroupById, getGroups, updateGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup); // for updating all fields *
router.patch('/:id', updateGroup); // for updating only a few fields
router.delete('/:id', deleteGroup);

export default router;