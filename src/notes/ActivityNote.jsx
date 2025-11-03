//ACTIVITY CREATE
await logActivity(
  'board',              // entity_type
  boardResult.rows[0].id, // entity_id
  'create',             // action
  userId,               // user_id
  `Board '${name}' created`, // details
  'workspace',          // parent_entity
  workspaceId           // parent_entity_id
);

//CARI ID 
const workspaceId = workspaceResult.rows[0].id;

//DETAILS UPDATE


//6. update board name
app.put('/api/boards/:id/name', async(req,res)=>{
    const {id} = req.params;
    const {name} = req.body;
    const userId = req.user.id;
    
    try{
        const result = await client.query(
            "UPDATE boards SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );
        if(result.rowCount === 0){
            return res.status(404).json({error:'Boards is not found'});
        }

        //CHECK USER ID
        console.log('endpoin update board name ini menerima userId:', userId);

        //LOG ACTIVITY 
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board name updated to '${name}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    }catch(error){
        console.error('Error updating board name:', error);
        res.status(500).json({error: error.message});
    }
})

//duplicate + activity log
app.post('/api/duplicate-board/:boardId/to-workspace/:workspaceId', async (req, res) => {
    const { boardId, workspaceId } = req.params;
    const userId = req.user.id; // pastikan tersedia dari autentikasi

    try {
        await client.query('BEGIN');

        // 1. Salin Board ke Workspace Baru
        const boardResult = await client.query(
           `INSERT INTO boards (user_id, name, description, workspace_id, background_image_id, assign, create_at)
            SELECT user_id, name || ' (Copy)', description, $1, background_image_id, assign, CURRENT_TIMESTAMP
            FROM boards WHERE id = $2
            RETURNING id, name`,
            [workspaceId, boardId]
        );

        if (boardResult.rowCount === 0) {
            throw new Error('Board tidak ditemukan.');
        }

        const newBoardId = boardResult.rows[0].id;

        // 2. Salin Lists dari Board Lama ke Board Baru
        const listResult = await client.query(
            `INSERT INTO lists (board_id, name)
             SELECT $1, name FROM lists WHERE board_id = $2
             RETURNING id, name`,
            [newBoardId, boardId]
        );

        const listMap = {};
        listResult.rows.forEach((list) => {
            listMap[list.id] = list.name;
        });

        // 3. Salin Cards dari List Lama ke List Baru
        const cardInsertPromises = Object.entries(listMap).map(async ([oldListId, name]) => {
            return client.query(
                `INSERT INTO cards (list_id, title, description)
                 SELECT (SELECT id FROM lists WHERE board_id = $1 AND name = $2), title, description
                 FROM cards WHERE list_id = $3`,
                [newBoardId, name, oldListId]
            );
        });

        await Promise.all(cardInsertPromises);

        // 4. Log activity untuk duplikasi board
        await logActivity(
            'board',
            newBoardId,
            'duplicate',
            userId,
            `Board dengan ID ${boardId} diduplikasi ke workspace ${workspaceId}`,
            'workspace',
            workspaceId
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: `Board berhasil diduplikasi ke workspace ${workspaceId}.`,
            newBoardId: newBoardId
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error duplicating board:', err.stack);
        res.status(500).json({ error: 'Server error saat menduplikasi board!' });
    }
});



//move
//9. move board to workspace
app.post('/api/move-board/:boardId/to-workspace/:workspaceId', async (req, res) => {
    const { boardId, workspaceId } = req.params;
    const userId = req.user.id;

    try {
        await client.query('BEGIN');

        // 1. Salin Board ke Workspace Baru
        const boardResult = await client.query(
            `INSERT INTO boards (user_id, name, description, workspace_id, background_image_id, assign,update_at)
             SELECT user_id, name, description, $1, background_image_id, assign, CURRENT_TIMESTAMP
             FROM boards WHERE id = $2
             RETURNING id`,
            [workspaceId, boardId]
        );

        if (boardResult.rowCount === 0) {
            throw new Error('Board tidak ditemukan.');
        }

        const newBoardId = boardResult.rows[0].id;
        // const newBoardName = boardResult.rows[0].name;

        // 2. Salin Lists yang ada di Board Lama ke Board Baru
        const listResult = await client.query(
            `INSERT INTO lists (board_id, name, position)
             SELECT $1, name, position FROM lists WHERE board_id = $2
             RETURNING id, name`,
            [newBoardId, boardId]
        );

        const listMap = {};
        listResult.rows.forEach((list) => {
            listMap[list.id] = list.name; // Simpan mapping ID list lama ke list baru
        });

        // 3. Salin Cards yang ada di Lists Lama ke Lists Baru
        const cardInsertPromises = Object.entries(listMap).map(async ([oldListId, name]) => {
            return client.query(
                `INSERT INTO cards (list_id, title, description, position)
                 SELECT (SELECT id FROM lists WHERE board_id = $1 AND name = $2), title, description, position
                 FROM cards WHERE list_id = $3`,
                [newBoardId, name, oldListId]
            );
        });

        await Promise.all(cardInsertPromises);
        
        //add log activity
        await logActivity(
            'board',
            newBoardId,
            'move',
            userId,
            `Board dengan ID ${newBoardId} dipindahan ke workspace ${workspaceId}`,
            'workspace',
            workspaceId
        )

        // 4. Hapus Board Lama
        await client.query(`DELETE FROM boards WHERE id = $1`, [boardId]);

        await client.query('COMMIT');

        res.status(200).json({
            message: `Board berhasil dipindahkan ke workspace ${workspaceId}.`,
            newBoardId: newBoardId
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error moving board:', err.stack);
        res.status(500).json({ error: 'Server error saat memindahkan board!' });
    }
});


app.put('/api/move-list/:listId', async (req, res) => {
    const { listId } = req.params;
    const { newBoardId } = req.body;
    const userId = req.user.id;

    try {
        // 1. Cek apakah list ada
        const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
        const list = await client.query(listQuery, [listId]);

        if (list.rows.length === 0) {
            return res.status(404).json({ message: 'List not found' });
        }

        // 2. Update list ke board baru
        const updateQuery = `
            UPDATE public.lists
            SET board_id = $1, update_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *`;
        const updatedList = await client.query(updateQuery, [newBoardId, listId]);

        // 3. Tambahkan log aktivitas
        await logActivity(
            'list',
            parseInt(listId),
            'move',
            userId,
            `List dengan ID ${listId} dipindahkan ke board ID ${newBoardId}`,
            'board',
            parseInt(newBoardId)
        );

        // 4. Kirim respons dengan list dan board ID tujuan
        return res.status(200).json({
            message: 'List berhasil dipindahkan',
            list: updatedList.rows[0],
            destinationBoardId: parseInt(newBoardId)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error moving list' });
    }
});
