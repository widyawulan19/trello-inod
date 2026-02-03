const boardService = require("../services/board.service");

exports.reorderBoardPosition = async (req, res) => {
  try {
    const result = await boardService.reorderPosition(req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBoardsByWorkspace = async (req, res) => {
  try {
    const boards = await boardService.getBoardsByWorkspace(req);
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// pola controller kamu SELALU gini 👇
exports.createBoard = async (req, res) => {
  try {
    const board = await boardService.createBoard(req);
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// SERVICE 
const client = require("../db/client");
const logActivity = require("../utils/logActivity");

exports.reorderPosition = async (req) => {
  const { boardId } = req.params;
  const { newPosition, workspaceId } = req.body;

  await client.query("BEGIN");

  try {
    const { rows } = await client.query(
      `SELECT position FROM boards WHERE id = $1 AND workspace_id = $2`,
      [boardId, workspaceId]
    );

    if (!rows.length) throw new Error("Board not found");

    const oldPosition = rows[0].position;

    if (newPosition > oldPosition) {
      await client.query(
        `UPDATE boards SET position = position - 1
         WHERE workspace_id = $1 AND position > $2 AND position <= $3`,
        [workspaceId, oldPosition, newPosition]
      );
    } else if (newPosition < oldPosition) {
      await client.query(
        `UPDATE boards SET position = position + 1
         WHERE workspace_id = $1 AND position >= $2 AND position < $3`,
        [workspaceId, newPosition, oldPosition]
      );
    }

    await client.query(
      `UPDATE boards SET position = $1, update_at = NOW()
       WHERE id = $2 AND workspace_id = $3`,
      [newPosition, boardId, workspaceId]
    );

    await client.query("COMMIT");

    return { success: true, boardId, newPosition };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
};
