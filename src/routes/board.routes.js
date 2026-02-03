const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');

// reorder
router.patch("/:boardId/new-position", boardController.reorderBoardPosition);
router.put("/reorder", boardController.bulkReorderBoards);

// get
router.get("/", boardController.getAllBoards);
router.get("/:id", boardController.getBoardById);
router.get("/workspace/:workspaceId", boardController.getBoardsByWorkspace);
router.get("/recycle/all", boardController.getRecycleBoards);

// create & update
router.post("/", boardController.createBoard);
router.put("/:id", boardController.updateBoard);
router.put("/:id/name", boardController.updateBoardName);
router.put("/:id/description", boardController.updateBoardDescription);

// delete
router.delete("/:id", boardController.softDeleteBoard);
router.delete("/recycle/:id", boardController.hardDeleteBoard);
router.patch("/:id/restore", boardController.restoreBoard);

// move & duplicate
router.post("/:boardId/duplicate/:workspaceId", boardController.duplicateBoard);
router.post("/:boardId/move/:workspaceId", boardController.moveBoard);

// archive
router.post("/:boardId/archive", boardController.archiveBoard);

module.exports = router;
