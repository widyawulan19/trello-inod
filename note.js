router.get('/search', async (req, res) => {
  const { keyword, workspaceId } = req.query;

  if (!keyword || !workspaceId) {
    return res.status(400).json({ error: 'Keyword and workspaceId are required' });
  }

  const searchKeyword = `%${keyword}%`;

  try {
    const query = `
      SELECT 
        cards.id AS card_id,
        cards.title,
        cards.description,
        lists.name AS list_name,
        boards.name AS board_name,
        workspaces.name AS workspace_name
      FROM 
        cards
      JOIN 
        lists ON cards.list_id = lists.id
      JOIN 
        boards ON lists.board_id = boards.id
      JOIN 
        workspaces ON boards.workspace_id = workspaces.id
      WHERE 
        workspaces.id = $2 AND (
          LOWER(cards.title) ILIKE LOWER($1)
          OR LOWER(cards.description) ILIKE LOWER($1)
      )
    `;

    const result = await pool.query(query, [searchKeyword, workspaceId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
