require('dotenv').config();
const express = require("express");
const client = require('./connection');
// const client = require('./backend/connection');
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors')
const moment = require('moment')
const bcrypt = require('bcryptjs')
// const bcrypt = require('bcrypt');
const {logActivity} = require('./ActivityLogger');
const {logCardActivity} = require('./CardLogActivity');
require('./CronJob')
const {SystemNotification} = require('./SystemNotification');
// const {SystemNotification} = require('./backend/SystemNotification');



//import for upload
// const upload = require('./backend/upload');
// const cloudinary = require('./backend/CloudinaryConfig');
const upload = require('./upload');
const cloudinary = require('./CloudinaryConfig');


//TOP

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
// const PORT = process.env.PORT || 3002; // Gunakan port dari .env atau default 3002

app.use(cors({
    origin: "*", // Untuk development
    // origin: "https://5eae-118-96-151-188.ngrok-free.app", // untuk test backend url dari ngrok
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  }));


// Middleware untuk mensimulasikan login
const simulateLogin = (req, res, next) => {
  // Misalnya, ID pengguna disimulasikan dengan hardcoded atau melalui query parameter
  req.user = { id: 3 }; // ID pengguna simulasi, misalnya 1
  next();
};
app.use(simulateLogin);
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Server is running on port " + PORT);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

//ENDPOIN UPLOAD
app.post('/api/upload-attach', upload.single('file'), async (req, res) => {
  const { card_id } = req.body;

  if (!req.file || !card_id) {
    return res.status(400).json({ error: 'Missing file or card_id' });
  }

  try {
    // Upload buffer ke Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // bisa 'auto', 'raw', 'image', 'video'
          folder: 'trello_uploads',
          public_id: `${Date.now()}-${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const fileUrl = result.secure_url;
    const fileName = req.file.originalname;

    // Dapatkan ekstensi file
    const extension = fileName.split('.').pop().toLowerCase();

    // Simpan ke DB
    const dbResult = await client.query(
      `INSERT INTO uploaded_files (card_id, file_url, file_name, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [card_id, fileUrl, fileName, extension]
    );

    res.status(201).json(dbResult.rows[0]);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});


//UPLOADED FILES
// app.get('/api/uploaded-files/:cardId', async(req,res)=>{
//     const {cardId} = req.params;

//     try{
//         const result = await client.query(
//             `SELECT * FROM uploaded_files WHERE card_id = $1 ORDER BY uploaded_at DESC`,
//             [cardId]
//         );

//         res.status(200).json(result.rows);
//     }catch(error){
//         console.error('Error fetching files:', error);
//         res.status(500).json({error: 'Failed to fetch uploaded files'});
//     }
// })
app.get('/api/uploaded-files/:cardId', async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await client.query(
      `
      SELECT 
        f.id,
        f.card_id,
        f.file_url,
        f.file_name,
        f.type,
        f.uploaded_at,
        u.username,
        pr.photo_url,
        pr.profile_name
      FROM uploaded_files f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN user_profil up ON u.id = up.user_id
      LEFT JOIN profil pr ON up.profil_id = pr.id
      WHERE f.card_id = $1
      ORDER BY f.uploaded_at DESC
      `,
      [cardId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch uploaded files' });
  }
});

//get total file by cardid
app.get('/api/uploaded-files/:cardId/count', async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await client.query(
      `SELECT COUNT(*) AS total_files FROM uploaded_files WHERE card_id = $1`,
      [cardId]
    );

    res.status(200).json({ 
      card_id: cardId,
      total_files: parseInt(result.rows[0].total_files, 10) 
    });
  } catch (error) {
    console.error('Error counting files:', error);
    res.status(500).json({ error: 'Failed to count uploaded files' });
  }
});




//END ENDPOIN UPLOAD


//REGISTER
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Hash password sebelum disimpan
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Simpan username, email, dan hashedPassword ke database
      // Misalnya query untuk menyimpan data pengguna (username, email, password)
      // const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
      // const values = [username, email, hashedPassword];
  
      // Kirim response sukses (simpan di database)
      res.status(201).json({ message: 'User successfully registered' });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

//WORKSPACE
//1.Get all workspace
app.get('/api/workspace', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM workspaces ORDER BY id ASC');
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error: error.message});
    }
})
//2. get workspace by id
app.get('/api/workspace/:id', async(req,res)=>{
    const {id} = req.params;
    const userId = req.user.id;
    try{
        const result = await client.query('SELECT * FROM workspaces WHERE id  = $1', [id]);
        if(result.rows.length === 0){
            return res.status(404).json({error:'Workspace not found'});
        }
        res.json(result.rows[0]);
    }catch(error){
        res.status(500).json({error:error.message});
    }
})
//3. create a new workspace
app.post("/api/workspace", async (req, res) => {
    const {name} = req.body;
    const {description} = req.body;
  try {
    const result = await client.query(
      "INSERT INTO workspaces (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//4. update a workspace
app.put('/api/workspace/:id', async(req,res)=>{
    const {id} = req.params;
    const {name} = req.body;
    const {description} = req.body;
    const userId = req.user.id;

    try{
        const result = await client.query(
            "UPDATE workspaces SET name = $1, description = $2, update_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [name, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        // Kirim respon sukses
        res.status(200).json(result.rows[0]);
    }catch(error){
        res.status(500).json({error:error.message});
    }
})
//5. delete a workspace dan mengarsipkan workspace sebelum mendelete data 
app.delete('/api/workspace/:id', async(req,res)=>{
    const {id} = req.params;
    const userId = req.user.id; 
    try {
        // Salin workspace ke archive sebelum delete
        await client.query(`
            INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
            SELECT 'workspace', id, name, description, create_at, update_at
            FROM workspaces
            WHERE id = $1
        `, [id]);

        // Hapus workspace setelah disalin
        const result = await client.query("DELETE FROM workspaces WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        res.json({ message: "Workspace archived and deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//6. archive workspace
app.post('/api/workspace/archive/:id', async(req,res)=>{
    const {id} = req.params;
    const userId = req.user.id;
    try{
        const result = await client.query(`
            INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
            SELECT 'workspace', id, name, description , create_at, update_at
            FROM workspaces
            WHERE id = $1
            `, [id]);
        if (result.rowCount > 0){
            await client.query('DELETE FROM workspaces WHERE id = $1', [id])//menambahkan logika hapus ketika workspace berhasil diarsipkan
            res.status(200).send(`Workspace dengan id ${id} berhasil diarsipkan`);
        }else{
            res.status(404).send(`Workspace dengan id ${id} tidak ditemukan.`)
        }
    }   catch(error){
        res.status(500).json({error:error.message});
    } 
})
//7. update workspace name
app.put('/api/workspace/:id/name', async(req,res)=>{
    const { id } = req.params;
    const { name } = req.body; // Hanya mengambil name
    const userId = req.user.id;
  
    try {
      const result = await client.query(
        "UPDATE workspaces SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [name, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      //Log activity untuk update
      await logActivity(
        'workspaces',
        result.rows[0].id,
        'update',
        userId,
        `Workspace name updated to '${name}' in workspace`,
        null,
        null
      )
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error updating workspace name:", error);
      res.status(500).json({ error: error.message });
    }
})
//8. update workspace description
app.put('/api/workspace/:id/description', async(req,res)=>{
    const { id } = req.params;
    const { description } = req.body; // Hanya mengambil description
    const userId = req.user.id;
  
    try {
      const result = await client.query(
        "UPDATE workspaces SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [description, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Workspace not found" });
      }

       //Log activity untuk update
       await logActivity(
        'workspaces',
        result.rows[0].id,
        'update',
        userId,
        `Workspace description updated to '${description}' `,
        null,
        null
      )
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error updating workspace description:", error);
      res.status(500).json({ error: error.message });
    }
})
//END WORKSPACE

//WORKSPACE USER
//1. create workspace user -> works
app.post('/api/workspace-user/create', async(req,res)=>{
    const {name, description, userId, role} = req.body;
    try{
        //1. insert workspace ke dalam tabel workspace
        const workspaceResult = await client.query(
            `INSERT INTO workspaces (name, description)
            VALUES ($1, $2) RETURNING id`,
            [name, description]
        );
        
        const workspaceId = workspaceResult.rows[0].id;
        console.log('endpoin ini sudah memilikii workspaceId:',workspaceId);

        //2. insert user ke dalam tabel workspace users sebagai admin
        const userResult = await client.query(
            `INSERT INTO workspaces_users (workspace_id, user_id, role) 
            VALUES ($1, $2, $3) RETURNING *`,
            [workspaceId, userId, role]
        );

        //3. log untuk create workspace
        await logActivity(
            'workspace',
            workspaceId,
            'create',
            userId,
            `Workspace '${name}' created`,
            null,
            null
        )

        //4. log activity untuk penambahan user ke workspace
        await logActivity(
          'workspace_user',
          workspaceId,
        //   userResult.rows[0].id,
          'add',
          userId,
          `User '${userResult.rows[0].user_id}' added to workspace`,
          'workspace',
          workspaceId
        );

        res.status(201).json({
            message: 'Workspace created successfully',
            workspace: workspaceResult.rows[0],
            user: userResult.rows[0],
        });
    }catch(error){
        res.status(500).json({error: error.message});
    }
})
//2. get workspace user -> works (DIEDIT)
app.get('/api/workspace/:id/users', async(req,res)=>{
    const {id} = req.params;
    try{
        const result = await client.query(
            `SELECT u.id, u.username, wu.role 
            FROM users u
            JOIN workspaces_users wu ON u.id = wu.user_id
            WHERE wu.workspace_id = $1`, [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No users found in this workspace' });
        }
        res.status(200).json(result.rows);
    }catch(error){
        res.status(500).json({error : error.message});
    }
})
//3. update workspace user -> works
app.put('/api/workspace-user/:workspaceId/user/:userId', async(req,res)=>{
    const {workspaceId, userId} = req.params;
    const {role}= req.body;
    try{
        const result = await client.query(
            `UPDATE workspaces_users
            SET role = $1
            WHERE workspace_id = $2 AND user_id = $3 RETURNING *`,
            [role, workspaceId, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found in this workspace' });
        }

        //log activity for update workspace user
        await logActivity(
            'workspaces_user',
            result.rows[0].id,
            'update',
            userId,
            `Workspace user updated in workspace`,
            null,
            null,
        )


        res.status(200).json(result.rows[0]);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. delete workspace user -> works
app.delete('/api/workspace-user/:workspaceId/user/:userId', async(req,res)=>{
    const {workspaceId, userId} = req.params;
    try {
        const result = await client.query(
            `DELETE FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2 RETURNING *`,
            [workspaceId, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found in this workspace' });
        }

        //Log activity for delete workspace user
        await logActivity(
            'workspace user',
            workspaceId,
            'delete',
            userId,
            `Workspace user deleted`,
            null,
            null,
        )
        res.status(200).json({ message: 'User removed from workspace' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//5. archive workspace user
app.post('/api/archive-workspace-user/:workspaceId', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        // Periksa apakah ada pengguna di workspace sebelum mengarsipkan
        const checkUsers = await client.query(
            `SELECT wu.user_id, u.username, wu.role 
             FROM workspaces_users wu 
             JOIN users u ON wu.user_id = u.id 
             WHERE wu.workspace_id = $1`,
            [workspaceId]
        );

        if (checkUsers.rowCount === 0) {
            return res.status(404).json({ message: `Tidak ada pengguna ditemukan untuk workspace dengan id ${workspaceId}.` });
        }

        // Masukkan data ke dalam tabel archive
        const archiveUsers = await client.query(
            `INSERT INTO archive (entity_type, entity_id, name, description, parent_id, parent_type)
             SELECT 'workspace_user', wu.user_id, u.username, wu.role, $1, 'workspace'
             FROM workspaces_users wu
             JOIN users u ON wu.user_id = u.id
             WHERE wu.workspace_id = $1
             RETURNING *`,
            [workspaceId]
        );

        // Hapus data dari workspaces_users setelah diarsipkan
        await client.query('DELETE FROM workspaces_users WHERE workspace_id = $1', [workspaceId]);


        res.status(200).json({ message: `Pengguna workspace ${workspaceId} berhasil diarsipkan`, data: archiveUsers.rows });
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).json({ error: 'Server Error saat mengarsipkan pengguna workspace!' });
    }
});


//6. get workspace milik user
app.get('/api/user/:userId/workspaces', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await client.query(
            `SELECT w.id, w.name, w.description, w.create_at, w.update_at
            FROM workspaces w
            JOIN workspaces_users wu ON w.id = wu.workspace_id
            WHERE wu.user_id = $1`, [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No workspaces found for this user' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//7. get admin name form workspace
app.get('/api/:workspaceId/admin', async (req, res) => {
    const { workspaceId } = req.params;
  
    try {
      const result = await client.query(
        `
        SELECT 
          u.id, 
          u.username, 
          u.email,
          p.profile_name,
          p.photo_url
        FROM 
          workspaces_users wu
        JOIN 
          users u ON wu.user_id = u.id
        LEFT JOIN 
          user_profil up ON u.id = up.user_id
        LEFT JOIN 
          profil p ON up.profil_id = p.id
        WHERE 
          wu.workspace_id = $1 
          AND wu.role = 'admin'
        `,
        [workspaceId]
      );
  
      res.json({ admins: result.rows });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
//8.get total user in workspace
app.get('/api/workspaces/:workspaceId/user-count', async (req, res) => {
    const { workspaceId } = req.params;
  
    const query = `
      SELECT COUNT(*) AS user_count
      FROM workspaces_users
      WHERE workspace_id = $1
    `;
  
    try {
      const result = await client.query(query, [workspaceId]);
      res.json({ workspace_id: workspaceId, user_count: parseInt(result.rows[0].user_count, 10) });
    } catch (err) {
      console.error('Error fetching user count for workspace:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

//END WORKSPACE USER

//USER
//1. create a new user
app.post('/api/users', async(req,res)=>{
    const { username, email, password } = req.body;
    try {
        const result = await client.query(
        `INSERT INTO users (username, email, password) 
        VALUES ($1, $2, $3) RETURNING id, username, email`,
        [username, email, password]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get all user
app.get('/api/users', async (req, res) => {
    try {
      const result = await client.query(
        `
        SELECT 
          u.id,
          u.username,
          u.email,
          p.photo_url,
          p.profile_name
        FROM users u
        LEFT JOIN user_profil up ON up.user_id = u.id
        LEFT JOIN profil p ON up.profil_id = p.id
        ORDER BY u.id
        `
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching all users with profile:', error);
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  });
  
//3. get user by id
app.get('/api/users/:id', async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await client.query('SELECT id, username, email, create_at FROM users WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(200).json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})

//4. update user
app.put('/api/users/:id', async(req,res)=>{
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        const result = await client.query(
        `UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email, create_at`,
        [username, email, password, id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete user
app.delete('/api/users/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//6. mengatur ulang password
app.post('/api/users/:id/password-reset', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body; // Password baru
    try {
      const result = await client.query(
        `UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username`,
        [newPassword, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// 7. GET user profile (nama, email, username, nomor wa, divisi, jabatan, photo_url)
app.get('/api/user-setting/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await client.query(`
      SELECT 
          u.username,
          u.email,
          ud.name,
          ud.nomor,
          ud.divisi,
          ud.jabatan,
          p.photo_url
      FROM 
          public.users u
      JOIN 
          public.user_data ud ON u.id = ud.user_id
      JOIN 
          public.user_profil up ON u.id = up.user_id
      JOIN 
          public.profil p ON up.profil_id = p.id
      WHERE 
          u.id = $1;
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = result.rows[0];
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//8. Edit user profile setting
app.put('/api/user-setting/:userId', async (req, res) => {
    const { userId } = req.params;
    const { username, email, name, nomor_wa, divisi, jabatan, photo_url } = req.body;
  
    try {
      // Mulai transaksi
      await client.query('BEGIN');
  
      // Update tabel users
      await client.query(`
        UPDATE public.users
        SET username = $1, email = $2
        WHERE id = $3
      `, [username, email, userId]);
  
      // Update tabel data_employees
      await client.query(`
        UPDATE public.data_employees
        SET name = $1, nomor_wa = $2, divisi = $3, jabatan = $4
        WHERE user_id = $5
      `, [name, nomor_wa, divisi, jabatan, userId]);
  
      // Ambil profil_id terlebih dahulu
      const profilResult = await client.query(`
        SELECT p.id
        FROM public.profil p
        JOIN public.user_profil up ON p.id = up.profil_id
        WHERE up.user_id = $1
      `, [userId]);
  
      if (profilResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Profil not found' });
      }
  
      const profilId = profilResult.rows[0].id;
  
      // Update tabel profil
      await client.query(`
        UPDATE public.profil
        SET photo_url = $1
        WHERE id = $2
      `, [photo_url, profilId]);
  
      // Commit transaksi
      await client.query('COMMIT');
      res.json({ message: 'User setting updated successfully' });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating user setting:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// END USER 

//ASSIGN USER
//1. mendapatkan semua user berdasarkan workspace id
app.get('/api/workspace/:workspaceId/users-profil', async (req, res) => {
    const { workspaceId } = req.params;
  
    try {
      const result = await client.query(
        `
        SELECT 
          u.id,
          u.username,
          u.email,
          wu.role,
          p.photo_url,
          p.profile_name
        FROM workspaces_users wu
        JOIN users u ON wu.user_id = u.id
        LEFT JOIN user_profil up ON up.user_id = u.id
        LEFT JOIN profil p ON up.profil_id = p.id
        WHERE wu.workspace_id = $1
        `,
        [workspaceId]
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching workspace users:', error);
      res.status(500).json({ error: 'Failed to fetch users for the workspace.' });
    }
  });
  

//2. remove user form workspace
app.delete('/api/workspace/:workspaceId/user/:userId', async(req,res)=>{
    const { workspaceId, userId } = req.params;
        try {
            await client.query(
                "DELETE FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2",
                [workspaceId, userId]
            );

            //mengambil nama workspace 
            const workspaceNameQuery = await client.query(
                `SELECT name FROM workspaces WHERE id = $1`,
                [workspaceId]
            )

            const workspaceName = workspaceNameQuery.rows[0]?.name || 'a workspace'

            //add log notification
            await SystemNotification({
                userId,
                message:`Someone remove you out of this workspace "${workspaceName}"`,
                type:'remove'
            })

            res.json({ message: "User removed from workspace" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})

//3. add user to workspace -> works
app.post('/api/workspace-user/:workspaceId/user/:userId', async(req,res)=>{
    const {workspaceId, userId} = req.params;
    const {role} = req.body;
    try {
        // Cek apakah user sudah ada di workspace
        const checkUser = await client.query(
            `SELECT * FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2`,
            [workspaceId, userId]
        );
  
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: 'User is already in this workspace' });
        }
  
        // Jika user belum ada, tambahkan ke workspace
        const result = await client.query(
            `INSERT INTO workspaces_users (workspace_id, user_id, role) 
            VALUES ($1, $2, $3) RETURNING *`,
            [workspaceId, userId, role]
        );

        //mengambil nama workspace berdasarkan workspace id untuk notifikasi
        const workspaceNameQuery = await client.query(
            `SELECT name FROM workspaces WHERE id = $1`,
            [workspaceId]
        );

        const workspaceName = workspaceNameQuery.rows[0]?.name || 'a workspace';


        //tambahkan notification
        await SystemNotification({
            userId,
            workspaceId,
            message:`You were added to workspace "${workspaceName}"`,
            type: 'workspace_assigned'
        })
  
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. search user in workspace
app.get('/api/workspace/:workspaceId/user/:userId', async(req,res)=>{
    const { workspaceId } = req.params;
        const { query } = req.query; // Pencarian berdasarkan username atau email
        try {
            const result = await client.query(
                `SELECT u.id, u.username, u.email, wu.role 
                 FROM workspaces_users wu 
                 JOIN users u ON wu.user_id = u.id 
                 WHERE wu.workspace_id = $1 
                 AND (u.username ILIKE $2 OR u.email ILIKE $2)`,
                [workspaceId, `%${query}%`]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
// END ASSIGN USER 

//BOARD
// Endpoint to get all boards
app.get('/api/boards', async (req, res) => {
    try {
        // Simple query to fetch all boards
        const query = 'SELECT * FROM public.boards';
        const result = await client.query(query);

        // Check if any boards exist
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No boards found' });
        }

        // Return the result
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching boards' });
    }
});

//1. get all board by workspace id
app.get('/api/workspaces/:workspaceId/boards', async(req,res)=>{
    const { workspaceId } = req.params;
        try {
            const result = await client.query('SELECT * FROM boards WHERE workspace_id = $1', [workspaceId]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//2. get board by id
app.get('/api/boards/:id', async(req,res)=>{
    const { id } = req.params;
        try {
            const result = await client.query('SELECT * FROM boards WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Board not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//3. create board
app.post('/api/boards', async(req,res)=>{
     const { user_id, name, description, workspace_id, } = req.body;
        try {
            const result = await client.query(
                'INSERT INTO boards (user_id, name, description, workspace_id, create_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
                [user_id, name, description, workspace_id|| []]
            );

            //mengambil board id
            boardId = result.rows[0].id;
            console.log('endpoin post ini menerima boardId', boardId);

            await logActivity(
                'board',
                boardId,
                'create',
                user_id,
                `Board '${name}' created `,
                'workspace',
                workspace_id
            )
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//4. update board
app.put('/api/boards/:id', async(req,res)=>{
    const { id } = req.params;
    const { name, description, background_image_id, assign } = req.body;

    try {
        const result = await client.query(
            'UPDATE boards SET name = $1, description = $2, background_image_id = $3, assign = $4 , update_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [name, description, background_image_id, assign, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete a board
app.delete('/api/boards/:id', async(req,res)=>{
 const { id } = req.params;
 const userId = req.user.id;

    try {
        const result = await client.query('DELETE FROM boards WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Board deleted successfully' });

            //add activity log
            await logActivity(
                'board',
                id,
                'delete',
                userId,
                `Board dengan Id ${id} deleted`,
                'workspace',
                id
            )
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
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
//7. update description boards
app.put('/api/boards/:id/description', async(req,res)=>{
    const {id} = req.params;
    const {description} = req.body;
    const userId = req.user.id;

    try{
        const result = await client.query(
            "UPDATE boards SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [description, id]
        );
        if(result.rowCount === 0){
            return res.status(404).json({error:'Boards is not found'});
        }

        //check user id
        console.log('Endpoin update desctiption ini menerima userId:', userId);

        //log activity
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board description updated to '${description}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    }catch(error){
        console.error('Error updating board name:', error);
        res.status(500).json({error: error.message});
    }

})

//8. Endpoint untuk menduplikasi board ke workspace baru
app.post('/api/duplicate-board/:boardId/to-workspace/:workspaceId', async (req, res) => {
    const { boardId, workspaceId } = req.params;
    const userId = req.user.id;


    try {
        await client.query('BEGIN');

        // 1. Salin Board ke Workspace Baru
        const boardResult = await client.query(
           `INSERT INTO boards (user_id, name, description, workspace_id, background_image_id, assign, create_at)
            SELECT user_id, name || ' (Copy)', description, $1, background_image_id, assign, CURRENT_TIMESTAMP
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
            `INSERT INTO lists (board_id, name)
             SELECT $1, name FROM lists WHERE board_id = $2
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
                `INSERT INTO cards (list_id, title, description)
                 SELECT (SELECT id FROM lists WHERE board_id = $1 AND name = $2), title, description
                 FROM cards WHERE list_id = $3`,
                [newBoardId, name, oldListId]
            );
        });

        await Promise.all(cardInsertPromises);

        //add log activity
        await logActivity(
            'board',
            newBoardId,
            'duplicate',
            userId,
            `Board dengan ID ${boardId} diduplikasi ke workspace ${workspaceId}`,
            'workspace',
            workspaceId
        )

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

//10. archive data boards
app.post('/api/boards/:boardId/archive', async (req, res) => {
    const { boardId } = req.params;
    const userId = req.user.id;

    try {
        // Ambil data board yang akan diarsipkan
        const boardQuery = 'SELECT * FROM boards WHERE id = $1';
        const boardResult = await client.query(boardQuery, [boardId]);
        
        if (boardResult.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }
        
        const board = boardResult.rows[0];
        
        // Masukkan data board ke dalam tabel archive
        const archiveQuery = `INSERT INTO archive (entity_type, entity_id, name, description, parent_id, parent_type) 
                              VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const archiveValues = ['board', board.id, board.name, board.description, board.workspace_id, 'workspace'];
        const archiveResult = await client.query(archiveQuery, archiveValues);
        
        // Hapus board dari tabel boards setelah diarsipkan
        const deleteQuery = 'DELETE FROM boards WHERE id = $1';
        await client.query(deleteQuery, [boardId]);

        //add log archive
        await logActivity(
            'board',
            boardId,
            'archive',
            userId,
            `Board dengan id '${boardId} berhasil di archive'`,
            'workspace',
            boardId
        )
        
        res.status(200).json({ message: 'Board archived successfully', archivedBoard: archiveResult.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



//END BOARDS

//BOARD PRIORITY 
//1. add priority to board -> works
app.post('/api/board-priority', async(req,res)=>{
    const { board_id, priority_id } = req.body;
    const userId = req.user.id;

    try {
        if (!board_id || !priority_id) {
            return res.status(400).json({ error: "board_id dan priority_id wajib diisi" });
        }
  
        await client.query("BEGIN");
  
        // Hapus semua prioritas lama untuk board ini (hanya jika satu prioritas diperbolehkan)
        await client.query(
            "DELETE FROM board_priorities WHERE board_id = $1",
            [board_id]
        );
  
        // Insert prioritas baru
        const result = await client.query(
            "INSERT INTO board_priorities (board_id, priority_id, create_at,update_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
            [board_id, priority_id]
        );
  
        await client.query("COMMIT");

        //add log activity
        await logActivity(
            'board priority',
            priority_id,
            'add',
            userId,
            `Board priority added`,
            'board',
            board_id
        )
  
        res.status(201).json({ message: "Prioritas berhasil ditambahkan", data: result.rows[0] });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//2. get all board priority -> works
app.get('/api/board-priority/:board_id', async(req,res)=>{
    try {
        const { board_id } = req.params;
  
        const result = await client.query(
            `SELECT p.id, p.name, p.color 
             FROM board_priorities bp
             JOIN priorities p ON bp.priority_id = p.id
             WHERE bp.board_id = $1`,
            [board_id]
        );
  
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//3. get all priority -> works
app.get('/api/priority', async(req,res)=>{
    try {
        const result = await client.query("SELECT * FROM priorities");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//4. delete prioritas from board 
app.delete('/api/board-priority-remove', async(req,res)=>{
    try {
        const { board_id, priority_id } = req.body;
  
        if (!board_id || !priority_id) {
            return res.status(400).json({ error: "board_id dan priority_id wajib diisi" });
        }
  
        const result = await client.query(
            "DELETE FROM board_priorities WHERE board_id = $1 AND priority_id = $2 RETURNING *",
            [board_id, priority_id]
        );
  
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Prioritas tidak ditemukan di board ini" });
        }
  
        res.status(200).json({ message: "Prioritas berhasil dihapus", data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
})
//END BOARD PRIORITY

//CARD PRIORITY
//1. add priority to card
app.post('/api/card-priorities', async (req, res) => {
  const userId = req.user.id;
  const { card_id, priority_id } = req.body;

  if (!card_id || !priority_id) {
    return res.status(400).json({ error: "card_id dan priority_id wajib diisi" });
  }

  try {
    await client.query('BEGIN');

    // Ambil priority lama sebelum dihapus
    const oldPriorityResult = await client.query(
      `SELECT cp.priority_id, p.name AS priority_name
       FROM card_priorities cp
       JOIN priorities p ON cp.priority_id = p.id
       WHERE cp.card_id = $1`,
      [card_id]
    );

    const oldPriorityId = oldPriorityResult.rows[0]?.priority_id || null;
    const oldPriorityName = oldPriorityResult.rows[0]?.priority_name || null;

    // Hapus semua prioritas lama untuk card ini
    await client.query(
      "DELETE FROM card_priorities WHERE card_id = $1",
      [card_id]
    );

    // Tambahkan prioritas baru
    const insertResult = await client.query(
      "INSERT INTO card_priorities (card_id, priority_id) VALUES ($1, $2) RETURNING *",
      [card_id, priority_id]
    );

    // Ambil nama prioritas baru
    const newPriorityResult = await client.query(
      "SELECT name FROM priorities WHERE id = $1",
      [priority_id]
    );
    const newPriorityName = newPriorityResult.rows[0]?.name || null;

    // Log aktivitas
    await logCardActivity({
      action: 'updated_prio',
      card_id: parseInt(card_id),
      user_id: userId,
      entity: 'priority',
      entity_id: priority_id,
      details: {
        old_priority_id: oldPriorityId,
        old_priority_name: oldPriorityName,
        new_priority_id: priority_id,
        new_priority_name: newPriorityName
      }
    });

    await client.query('COMMIT');

    res.status(201).json({
      message: "Prioritas berhasil ditambahkan",
      data: insertResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error adding priority to card:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

//2. get all card priority
app.get('/api/card-priorities', async(req,res)=>{
    try{
        const allCardPriorities = await client.query(
            "SELECT * FROM priorities"
        );
        res.json(allCardPriorities.rows);
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
})
//3. get priority of a spesific card
app.get('/api/card-priorities/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    try {
        const cardPriority = await client.query(
            "SELECT p.id AS priority_id, p.name, p.color, p.background FROM card_priorities cp JOIN priorities p ON cp.priority_id = p.id WHERE cp.card_id = $1",
            [cardId]
        );
        res.json(cardPriority.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//4. delete priority from card
app.delete('/api/card-priority', async(req,res)=>{
    const { card_id, priority_id } = req.body;
    try {    
        await client.query(
            "DELETE FROM card_priorities WHERE card_id = $1 AND priority_id = $2",
            [card_id, priority_id]
        );
        res.json({ message: "Priority removed from card" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//END CARD PRIORITY

//LISTS
//1. get all lists
app.get('/api/lists', async(req,res)=>{
    try {
            const result = await client.query("SELECT * FROM lists ORDER BY position");
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//2. get list by board_id
app.get('/api/lists/board/:board_id', async(req,res)=>{
    const { board_id } = req.params;
        try {
            const result = await client.query("SELECT * FROM lists WHERE board_id = $1 ORDER BY position", [board_id]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})

//get list by id
app.get('/api/lists/:listId', async(req,res)=>{
    const {listId} = req.params;
    try{
        const result = await client.query('SELECT * FROM lists WHERE id = $1', [listId])
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})


//3. create a new list
app.post('/api/lists', async(req,res)=>{
    const { board_id, name } = req.body;
    const userId = req.user.id;

    try {
        const positionResult = await client.query("SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM lists WHERE board_id = $1", [board_id]);
        const position = positionResult.rows[0].next_position;

        const result = await client.query(
            "INSERT INTO lists (board_id, name, position, create_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *", 
            [board_id, name, position]
        );

        const listId = result.rows[0].id;

        //added activity log
        await logActivity(
            'list',
            listId,
            'create',
            userId,
            `List '${name}' created`,
            'board',
            board_id
        )
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//4. update list
app.put('/api/lists/:id', async(req,res)=>{
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE lists SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", 
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        // add log activity 
        await logActivity(
            'list',
            id,
            'update',
            userId,
            `List name updated to '${name}' in list`,
            'board',
            id
        )

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. delete lists
app.delete('/api/lists/:id', async(req,res)=>{
    const { id } = req.params;
    const userId = req.user.id;

        try {
            const result = await client.query("DELETE FROM lists WHERE id = $1 RETURNING *", [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "List not found" });
            }

            //add log activity
            await logActivity(
                'list',
                id,
                'delete',
                userId,
                `List with id '${id}' deleted`,
                'board',
                id
            )

            res.json({ message: "List deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//6. move list to another board
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


//7. Duplicate list and all its cards to a new board
app.post('/api/duplicate-list/:listId', async (req, res) => {
    const { listId } = req.params;
    const { newBoardId } = req.body; // New board ID from request body
    const userId = req.user.id;

    try {
        // Mulai transaksi untuk memastikan konsistensi data
        await client.query('BEGIN');

        // 1. Ambil data list asli
        const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
        const list = await client.query(listQuery, [listId]);

        if (list.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'List not found' });
        }

        // 2. Dapatkan posisi terakhir di board baru
        const maxPositionQuery = 'SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM public.lists WHERE board_id = $1';
        const maxPositionResult = await client.query(maxPositionQuery, [newBoardId]);
        const newPosition = maxPositionResult.rows[0].new_position;

        // 3. Duplikasi list ke board baru
        const duplicateListQuery = `
            INSERT INTO public.lists (board_id, name, position, create_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING id`;
        const duplicatedList = await client.query(duplicateListQuery, [
            newBoardId,
            list.rows[0].name,
            newPosition
        ]);
        const duplicatedListId = duplicatedList.rows[0].id;

        // 4. Ambil semua kartu dalam list asli
        const cardsQuery = 'SELECT * FROM public.cards WHERE list_id = $1 ORDER BY position';
        const cards = await client.query(cardsQuery, [listId]);

        for (const card of cards.rows) {
            // Dapatkan posisi baru berdasarkan urutan kartu asli
            const maxCardPositionQuery = 'SELECT COALESCE(MAX(position), 0) + 1 AS new_card_position FROM public.cards WHERE list_id = $1';
            const maxCardPositionResult = await client.query(maxCardPositionQuery, [duplicatedListId]);
            const newCardPosition = maxCardPositionResult.rows[0].new_card_position;

            // Salin kartu ke list baru
            const duplicateCardQuery = `
                INSERT INTO public.cards (list_id, title, description, position, create_at)
                VALUES ($1, $2, $3, $4,CURRENT_TIMESTAMP)
                RETURNING id`;
            const newCard = await client.query(duplicateCardQuery, [
                duplicatedListId,
                card.title,
                card.description,
                newCardPosition
            ]);
            const newCardId = newCard.rows[0].id;

            // Salin seluruh data terkait kartu (checklists, cover, descriptions, etc.)
            const relations = [
                { table: 'card_checklists', columns: 'checklist_id, created_at, updated_at' },
                { table: 'card_cover', columns: 'cover_id' },
                { table: 'card_descriptions', columns: 'description, created_at, updated_at' },
                { table: 'card_due_dates', columns: 'due_date, created_at, updated_at' },
                { table: 'card_labels', columns: 'label_id' },
                { table: 'card_members', columns: 'user_id' },
                { table: 'card_priorities', columns: 'priority_id' },
                { table: 'card_status', columns: 'status_id, assigned_at' },
                { table: 'card_users', columns: 'user_id' }
            ];

            for (const { table, columns } of relations) {
                await client.query(
                    `INSERT INTO public.${table} (card_id, ${columns})
                     SELECT $1, ${columns} FROM public.${table} WHERE card_id = $2`,
                    [newCardId, card.id]
                );
            }
        }

        // Commit transaksi
        await client.query('COMMIT');

        //add log activity
        await logActivity(
            'list',
            listId,
            'duplicate',
            userId,
            `List id dengan id${listId} diduplikasi ke board id ${newBoardId}`,
            'board',
            newBoardId
        )

        return res.status(201).json({ duplicatedListId });

    } catch (err) {
        // Rollback jika terjadi error
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: 'Error duplicating list' });
    }
});

//archive data lists
app.put('/api/archive-lists/:listId', async(req,res)=>{
    const { listId } = req.params;
    const userId = req.user.id;
    
        try {
            // Retrieve the list data to be archived
            const listQuery = 'SELECT * FROM public.lists WHERE id = $1';
            const listResult = await client.query(listQuery, [listId]);
    
            if (listResult.rows.length === 0) {
                return res.status(404).json({ error: 'List not found' });
            }
    
            const list = listResult.rows[0];
    
            // Insert the list into the archive table
            const archiveQuery = `
                INSERT INTO public.archive (entity_type, entity_id, name, description, parent_id, parent_type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, entity_type, entity_id, name, description, parent_id, parent_type, archived_at
            `;
            const archiveResult = await client.query(archiveQuery, [
                'list',
                list.id,
                list.name,
                list.description,
                list.board_id,
                'board',
            ]);
    
            const archivedData = archiveResult.rows[0];
    
            // If archive is successful, delete the list from lists table
            const deleteQuery = 'DELETE FROM public.lists WHERE id = $1';
            await client.query(deleteQuery, [listId]);

            //add activity log
            await logActivity(
                'list',
                listId,
                'archive',
                userId,
                `List dengan id ${listId} berhasil di archive`,
                'board',
                listId
            )
    
            return res.status(200).json({
                message: 'List archived successfully',
                archivedData: archivedData,
            });
        } catch (error) {
            console.error('Error archiving list:', error);
            return res.status(500).json({
                error: 'An error occurred while archiving the list',
            });
        }
})

//END LISTS

//CARD
//1. get all cards
app.get('/api/cards', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM cards ORDER BY position');
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error: error.message});
    }
})
//get card by id
app.get('/api/cards/:id', async(req,res)=>{
    const {id} = req.params;
    try{
        const result = await client.query('SELECT * FROM cards WHERE id = $1', [id])
        if(result.rows.length > 0){
            res.json(result.rows[0]);
        }else{
            res.status(404).json({message:'card not found'})
        }
    }catch(error){
        res.status(500).json({ error: error.message });
    }
})
//2. get card by list id
app.get('/api/cards/list/:listId', async(req,res)=>{
    const {listId} = req.params;
    try {
            const result = await client.query("SELECT * FROM cards WHERE list_id = $1 ORDER BY position", [listId]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//3. create a new card
app.post('/api/cards', async (req, res) => {
    const { title, description, list_id } = req.body;
    const userId = req.user.id;

    try {
        if (!title || !description || !list_id) {
            return res.status(400).json({ error: "Title, description, and list_id are required" });
        }

        // Cek apakah list_id ada di database
        const listCheck = await client.query("SELECT id FROM lists WHERE id = $1", [list_id]);
        if (listCheck.rows.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        // Dapatkan posisi terakhir dalam list tersebut
        const positionResult = await client.query(
            "SELECT COALESCE(MAX(position), 0) + 1 AS new_position FROM cards WHERE list_id = $1",
            [list_id]
        );
        const newPosition = positionResult.rows[0].new_position;

        // Tambahkan kartu ke dalam list yang sesuai
        const result = await client.query(
            "INSERT INTO cards (title, description, list_id, position, create_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *",
            [title, description, list_id, newPosition]
        );

        const cardId = result.rows[0].id;
        console.log('Endpoin post card ini menerima cardId:',cardId)

        //add log activity
        await logActivity(
            'card',
            cardId,
            'create',
            userId,
            `Card ${title} created`,
            'list',
            list_id
        )

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//4. delete card
app.delete('/api/cards/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    const userId = req.user.id;

        try {
            const result = await client.query("DELETE FROM cards WHERE id = $1 RETURNING *", [cardId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Card not found" });
            }

            //add log activity
            await logActivity(
                'card',
                cardId,
                'delete',
                userId,
                `Card with id ${cardId} deleted`,
                'list',
                cardId
            )

            res.json({ message: "Card deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})

//5. duplicate card
// Endpoint untuk duplikasi card ke list tertentu
app.post('/api/duplicate-card-to-list/:cardId/:listId', async (req, res) => {
    const { cardId, listId } = req.params;
    const userId = req.user.id;

    try {
        // Mulai transaksi untuk memastikan konsistensi data
        await client.query('BEGIN');

        // 1. Salin data card utama dan masukkan ke dalam list yang dituju
        const result = await client.query(
            `INSERT INTO public.cards (title, description, list_id, position) 
             SELECT title, description, $1, 
                    (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $1)
             FROM public.cards 
             WHERE id = $2 
             RETURNING id`,
            [listId, cardId]
        );
        
        //fungsi untuk mendapatkan id
        const newCardId = result.rows[0].id;

        // 2. Salin relasi terkait (checklists, cover, etc.)

        // Salin checklists
        await client.query(
            `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
             SELECT $1, checklist_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_checklists
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin cover
        await client.query(
            `INSERT INTO public.card_cover (card_id, cover_id)
             SELECT $1, cover_id
             FROM public.card_cover
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin descriptions
        await client.query(
            `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at)
             SELECT $1, description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_descriptions
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin due dates
        await client.query(
            `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
             SELECT $1, due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_due_dates
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin labels
        await client.query(
            `INSERT INTO public.card_labels (card_id, label_id)
             SELECT $1, label_id
             FROM public.card_labels
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin members
        await client.query(
            `INSERT INTO public.card_members (card_id, user_id)
             SELECT $1, user_id
             FROM public.card_members
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin priorities
        await client.query(
            `INSERT INTO public.card_priorities (card_id, priority_id)
             SELECT $1, priority_id
             FROM public.card_priorities
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin status
        await client.query(
            `INSERT INTO public.card_status (card_id, status_id, assigned_at)
             SELECT $1, status_id, CURRENT_TIMESTAMP
             FROM public.card_status
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Salin users
        await client.query(
            `INSERT INTO public.card_users (card_id, user_id)
             SELECT $1, user_id
             FROM public.card_users
             WHERE card_id = $2`,
            [newCardId, cardId]
        );

        // Commit transaksi
        await client.query('COMMIT');

        //add log activity
        await logActivity(
            'card',
            newCardId,
            'duplicate',
            userId,
            `Card dengan ID ${cardId} diduplikasi ke list ${listId}`,
            'list',
            listId
        )
        
        // Mengembalikan response dengan id card baru yang telah disalin
        res.status(201).json({ newCardId });

    } catch (err) {
        // Rollback transaksi jika ada error
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyalin card ke list yang baru' });
    }
});

//6. move card
app.put('/api/move-card-to-list/:cardId/:listId', async(req,res)=>{
    const { cardId, listId } = req.params;
    const userId = req.user.id;

    try {
        // Mulai transaksi untuk memastikan konsistensi data
        await client.query('BEGIN');

        // Ambil informasi kartu yang akan dipindahkan
        const cardResult = await client.query(
            `SELECT list_id, position FROM public.cards WHERE id = $1`,
            [cardId]
        );
        
        if (cardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Card tidak ditemukan' });
        }

        const { list_id: oldListId, position: oldPosition } = cardResult.rows[0];

        // Update posisi kartu dalam list lama dengan menggeser posisi yang lebih tinggi ke atas
        await client.query(
            `UPDATE public.cards 
             SET position = position - 1 
             WHERE list_id = $1 AND position > $2`,
            [oldListId, oldPosition]
        );

        // Tentukan posisi baru dalam list tujuan
        const newPositionResult = await client.query(
            `SELECT COALESCE(MAX(position), 0) + 1 AS new_position 
             FROM public.cards WHERE list_id = $1`,
            [listId]
        );
        
        const newPosition = newPositionResult.rows[0].new_position;

        // Perbarui list_id dan posisi kartu yang dipindahkan dan update_at
        await client.query(
            `UPDATE public.cards 
             SET list_id = $1, position = $2 , update_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [listId, newPosition, cardId]
        );

        // Update data terkait dengan card ke list baru

        // Pindahkan checklists
        await client.query(
            `UPDATE public.card_checklists 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan cover
        await client.query(
            `UPDATE public.card_cover 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan descriptions
        await client.query(
            `UPDATE public.card_descriptions 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan due dates
        await client.query(
            `UPDATE public.card_due_dates 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan labels
        await client.query(
            `UPDATE public.card_labels 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan members
        await client.query(
            `UPDATE public.card_members 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan priorities
        await client.query(
            `UPDATE public.card_priorities 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan status
        await client.query(
            `UPDATE public.card_status 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Pindahkan users
        await client.query(
            `UPDATE public.card_users 
             SET card_id = $1 
             WHERE card_id = $2`,
            [cardId, cardId]
        );

        // Commit transaksi
        await client.query('COMMIT');

        //add activity log
        await logActivity(
            'card',
            cardId,
            'move',
            userId,
            `Card dengan id ${cardId} dipindahkan ke list baru dengan id ${listId}`,
            'list',
            listId
        )
        
        res.status(200).json({ message: 'Card berhasil dipindahkan', cardId, listId, newPosition });
    } catch (err) {
        // Rollback transaksi jika terjadi kesalahan
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan saat memindahkan card' });
    }
})

//7. archive card data
app.put('/api/archive-card/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    const userId = req.user.id;

    try {
        // Retrieve the card data to be archived
        const cardQuery = 'SELECT * FROM public.cards WHERE id = $1';
        const cardResult = await client.query(cardQuery, [cardId]);

        if (cardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const card = cardResult.rows[0];

        // Insert the card into the archive table
        const archiveQuery = `
            INSERT INTO public.archive (entity_type, entity_id, name, description, parent_id, parent_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, entity_type, entity_id, name, description, parent_id, parent_type, archived_at
        `;
        const archiveResult = await client.query(archiveQuery, [
            'card',               // entity_type
            card.id,              // entity_id
            card.title,           // name
            card.description,     // description
            card.list_id,         // parent_id (list)
            'list',               // parent_type
        ]);

        const archivedData = archiveResult.rows[0];

        // Delete the card from the cards table
        const deleteQuery = 'DELETE FROM public.cards WHERE id = $1';
        await client.query(deleteQuery, [cardId]);


        //add log activity
        await logActivity(
            'card',
            cardId,
            'archive',
            userId,
            `Card dengan ID ${cardId} berhasil di archive`,
            'list',
            cardId
        )

        return res.status(200).json({
            message: 'Card archived successfully',
            archivedData: archivedData,
        });


    } catch (error) {
        console.error('Error archiving card:', error);
        return res.status(500).json({
            error: 'An error occurred while archiving the card',
        });
    }
})
//END CARD

//CARD USER
//1. get semua user yang disa di assign ke card
app.get('/api/cards/:cardId/assignable-users', async(req,res)=>{
    const { cardId } = req.params;

    try {
        const query = `
        SELECT 
            u.id AS user_id,
            u.username,
            u.email,
            p.photo_url
        FROM users u
        JOIN user_profil up ON up.user_id = u.id
        JOIN profil p ON p.id = up.profil_id
        JOIN workspaces_users wu ON wu.user_id = u.id
        JOIN boards b ON b.workspace_id = wu.workspace_id
        JOIN lists l ON l.board_id = b.id
        JOIN cards c ON c.list_id = l.id
        WHERE c.id = $1;
        `;
  
        const result = await client.query(query, [cardId]);
  
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//2. assign user to card
app.post('/api/cards/:cardId/users/:userId', async(req,res)=>{
    const { cardId, userId } = req.params;
    const usersId = req.user.id;

    try {
        const validationQuery = `
        SELECT 1
        FROM workspaces_users wu
        JOIN boards b ON b.workspace_id = wu.workspace_id
        JOIN lists l ON l.board_id = b.id
        JOIN cards c ON c.list_id = l.id
        WHERE wu.user_id = $1 AND c.id = $2
        LIMIT 1;
        `;
        const validation = await client.query(validationQuery, [userId, cardId]);

        if (validation.rowCount === 0) {
            return res.status(403).json({ error: 'User not in the same workspace as this card' });
        }

        const insert = await client.query(
            `INSERT INTO card_users (card_id, user_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING RETURNING *`,
            [cardId, userId]
        );

        //mengambil nama card 
        const cardNameQuery = await client.query(
            `SELECT title FROM cards WHERE id = $1`,
            [cardId]
        );

        const cardName = cardNameQuery.rows[0]?.title || ' a card';

        //add log notification
        await SystemNotification({
            userId,
            cardId,
            message:`Your were added to card name "${cardName}"`,
            type: 'card_assigned',
        })

        //add log card activity
        await logCardActivity({
            action:'add_user',
            card_id:cardId,
            user_id:usersId,
            entity:'users',
            entity_id:userId,
            details:''
        })

        res.status(200).json({ message: 'User assigned to card', data: insert.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//3. remove user from card
app.delete('/api/cards/:cardId/users/:userId', async (req, res) => {
  const { cardId, userId } = req.params;
  const usersId = req.user.id;

  try {
      const result = await client.query(
          `DELETE FROM card_users WHERE card_id = $1 AND user_id = $2 RETURNING *`,
          [cardId, userId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Assignment not found' });
      }

      //get card name 
      const cardNameQuery = await client.query(
        `SELECT title FROM cards WHERE id = $1`,
        [cardId]
      );

      const cardName = cardNameQuery.rows[0]?.title || 'a card';

      //add log notification
      await SystemNotification({
        userId,
        message:`You were removed from card name "${cardName}"`,
        type: 'card_unassigned',
      })

      //add log card activity
      await logCardActivity({
        action:'remove_user',
        card_id:cardId,
        user_id:usersId,
        entity:'users',
        entity_id:userId,
        details:''
      })

      res.status(200).json({ message: 'User unassigned from card' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

//4. get all users assigned to a card
app.get('/api/cards/:cardId/users', async (req, res) => {
    const { cardId } = req.params;
  
    try {
        const result = await client.query(
            `SELECT 
                u.id AS user_id,
                u.username,
                u.email,
                p.photo_url
             FROM card_users cu
             JOIN users u ON cu.user_id = u.id
             JOIN user_profil up ON up.user_id = u.id
             JOIN profil p ON up.profil_id = p.id
             WHERE cu.card_id = $1`,
            [cardId]
        );
  
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

//END CARD USER

//UPDATE CARD
//1. update title card
app.put('/api/cards/:id/title', async(req,res)=>{
    const {id} = req.params;
    const {title} = req.body;
    const userId = req.user.id;

    console.log('Endpoin update ini menerima data userId:', userId);
    try {
        // Ambil data lama dulu buat dicatat di log
        const oldResult = await client.query("SELECT title FROM cards WHERE id = $1", [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: "Card not found" });
    
        const oldTitle = oldResult.rows[0].title;
    
        const result = await client.query(
          "UPDATE cards SET title = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
          [title, id]
        );
    
        // ✅ Tambahkan log aktivitas
        await logCardActivity({
          action: 'updated_title',
          card_id: parseInt(id),
          user_id: userId,
          entity: 'title',
          entity_id: null,
          details: {
            old_title: oldTitle,
            new_title: title
          }
        });
    
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error updating card title:", error);
        res.status(500).json({ error: error.message });
      }
})
//2. update title description
app.put('/api/cards/:id/desc', async(req,res)=>{
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

        try {
            const result = await client.query("UPDATE cards SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [description, id]);
            if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
            
            //add log card activity
            await logCardActivity({
                action: 'updated_desc',
                card_id: parseInt(id),
                user_id: userId,
                entity: 'description',
                entity_id: null,
                details:''
            })

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//3. update due_date
app.put('/api/cards/:id/due_date', async(req,res)=>{
    const { id } = req.params;
        const { due_date } = req.body;
        try {
            const result = await client.query("UPDATE cards SET due_date = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [due_date, id]);
            if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//4. update cover_id
app.put('/api/cards/:id/cover', async(req,res)=>{
    const { id } = req.params;
    const { cover_id } = req.body;
    try {
        const result = await client.query("UPDATE cards SET cover_id = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [cover_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. update label_id
app.put('/api/cards/:id/label', async(req,res)=>{
    const { id } = req.params;
    const { label_id } = req.body; // array of label IDs
    try {
        const result = await client.query("UPDATE cards SET label_id = $1 WHERE id = $2 RETURNING *", [label_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//6. update image
app.put('/api/cards/:id/image', async(req,res)=>{
    const { id } = req.params;
    const { image_id } = req.body;
    try {
        const result = await client.query("UPDATE cards SET image_id = $1 WHERE id = $2 RETURNING *", [image_id, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//7. update assign
app.put('/api/cards/:id/assign', async(req,res)=>{
    const { id } = req.params;
    const { assign } = req.body; // array of user IDs
    try {
        const result = await client.query("UPDATE cards SET assign = $1 WHERE id = $2 RETURNING *", [assign, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// END UPDATE CARD 

//CARD COVER
//1. mendapatkan cover berdasarkan card_id -> works
app.get('/api/card-cover/:cardId', async(req,res)=>{
    const { cardId } = req.params;
        try {
            const result = await client.query(
                `SELECT c.* FROM cover c 
                 INNER JOIN card_cover cc ON c.id = cc.cover_id 
                 WHERE cc.card_id = $1`, 
                [cardId]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})
//2. menambahkan cover ke card -> works
app.post('/api/add-cover', async(req,res)=>{
    const { card_id, cover_id } = req.body;
    const userId = req.user.id;

    try {
        const checkExisting = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1", 
            [card_id]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ message: "Card already has a cover. Please update instead." });
        }

        const result = await client.query(
            "INSERT INTO card_cover (card_id, cover_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, cover_id]
        );

        //add log card activity
        await logCardActivity({
            action:'add_cover',
            card_id:card_id,
            user_id:userId,
            entity:'cover',
            entity_id:cover_id,
            details:''
        })

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//3. mengupdate cover pada card -> works
app.put('/api/update-cover', async(req,res)=>{
    const { card_id, cover_id } = req.body;
    try {
        const result = await client.query(
            "UPDATE card_cover SET cover_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2 RETURNING *",
            [cover_id, card_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//4. menghapus cover dari card -> works
app.delete('/api/delete-cover/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    const userId = req.user.id;
    
    try {
        // Ambil dulu data cover sebelum dihapus
        const coverResult = await client.query(
            "SELECT * FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        if (coverResult.rowCount === 0) {
            return res.status(404).json({ message: "No cover found for this card." });
        }

        const cover = coverResult.rows[0]; // Data cover sebelum dihapus

        // Hapus cover
        await client.query(
            "DELETE FROM card_cover WHERE card_id = $1",
            [cardId]
        );

        // Log aktivitas penghapusan cover
        await logCardActivity({
            card_id: parseInt(cardId),
            user_id: userId,
            action: "delete",
            entity: "cover",
            entity_id: cover.id, // Ini id cover yang dihapus
            details: ''
        });

        res.json({ message: "Cover removed successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//5. mendapatkan semua cover yang tersedia
app.get('/api/covers', async(req,res)=>{
    try {
        const result = await client.query("SELECT * FROM cover");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//END CARD COVER

//DUE DATE
//1. get all due date
app.get('/api/card-due-dates', async(req,res)=>{
    try {
        const result = await client.query("SELECT * FROM card_due_dates ORDER BY due_date ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//2. get due date by id
app.get('/api/card-due-date/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_due_dates WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//3. Ambil semua due date berdasarkan card_id (Berguna untuk fitur DatePicker)
app.get('/api/card-due-date/card/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_due_dates WHERE card_id = $1 ORDER BY due_date ASC", [cardId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//4. add new due date
app.post('/api/card-due-dates', async(req,res)=>{
    const { card_id, due_date } = req.body;
    try {
        const result = await client.query(
            "INSERT INTO card_due_dates (card_id, due_date, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
            [card_id, due_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//5.update due date by id
//5. update due date by id
app.put('/api/card-due-date/:id', async (req, res) => {
  const { id } = req.params;
  const { due_date } = req.body;
  const userId = req.user.id;

  try {
    // Ambil cardId dan due date lama
    const existing = await client.query(
      "SELECT * FROM card_due_dates WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Due date not found" });
    }

    const oldDueDate = existing.rows[0].due_date;
    const cardId = existing.rows[0].card_id;

    // Update due date
    const result = await client.query(
      "UPDATE card_due_dates SET due_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [due_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Due date not found after update" });
    }

    const updatedDueDate = result.rows[0].due_date;

    // Format tanggal ke: Wednesday, 11 June 2025
    const formatDate = (dateStr) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateStr));
    };

    // Log aktivitas update
    await logCardActivity({
      action: 'updated_due',
      card_id: cardId,
      user_id: userId,
      entity: 'due date',
      entity_id: null,
      details: {
        old_title: formatDate(oldDueDate),
        new_title: formatDate(updatedDueDate),
      }
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//6. delete due date by ID
app.delete('/api/card-due-date/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM card_due_dates WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Due date not found" });
        }
        res.json({ message: "Due date deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})
//END DUE DATE

//REMINDERS
// 1. Endpoint untuk menambahkan pengingat baru
app.post('/api/card-due-date/:cardId/set-reminder', async (req, res) => {
    const { cardId } = req.params;
    const { reminder_date } = req.body;
  
    // Validate reminder_date
    if (!reminder_date) {
        return res.status(400).json({ error: 'Reminder date is required' });
    }

    try {
        const result = await client.query(`
            INSERT INTO reminders (card_id, reminder_date)
            VALUES ($1, $2) RETURNING id, card_id, reminder_date, reminder_sent, created_at, updated_at
        `, [cardId, reminder_date]);

        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to create reminder' });
        }
  
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error setting reminder:', err);
        res.status(500).json({ error: 'Failed to set reminder' });
    }
});



// 2.Endpoint untuk mengambil pengingat berdasarkan cardId
app.get('/api/card-due-date/:cardId/get-reminder', async (req, res) => {
    const { cardId } = req.params;
  
    try {
      const result = await client.query(`
        SELECT * FROM reminders
        WHERE card_id = $1
      `, [cardId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No reminder found for this card' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching reminder:', err);
      res.status(500).json({ error: 'Failed to fetch reminder' });
    }
});


//3. Endpoint untuk memperbarui pengingat
app.put('/api/card-due-date/:cardId/update-reminder', async (req, res) => {
    const { cardId } = req.params;
    const { reminder_date } = req.body;
  
    try {
      const result = await client.query(`
        UPDATE reminders
        SET reminder_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $2 RETURNING *
      `, [reminder_date, cardId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Reminder not found for this card' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating reminder:', err);
      res.status(500).json({ error: 'Failed to update reminder' });
    }
});


// 4. Endpoint untuk menghapus pengingat berdasarkan cardId
app.delete('/api/card-due-date/:cardId/delete-reminder', async (req, res) => {
    const { cardId } = req.params;
  
    try {
      const result = await client.query(`
        DELETE FROM reminders
        WHERE card_id = $1 RETURNING *
      `, [cardId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Reminder not found for this card' });
      }
  
      res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (err) {
      console.error('Error deleting reminder:', err);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
});


//5. Endpoint untuk mengambil semua pengingat
app.get('/api/card-due-date', async (req, res) => {
    try {
      const result = await client.query(`
        SELECT * FROM reminders
        ORDER BY reminder_date ASC
      `);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching all reminders:', err);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});


//6. Endpoint untuk menandai reminder yang sudah dikirim
app.put('/api/card-due-date/:cardId/mark-reminder-sent', async (req, res) => {
    const { cardId } = req.params;
  
    try {
      const result = await client.query(`
        UPDATE reminders
        SET reminder_sent = true, updated_at = CURRENT_TIMESTAMP
        WHERE card_id = $1 RETURNING *
      `, [cardId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Reminder not found for this card' });
      }
  
      res.status(200).json({ message: 'Reminder marked as sent' });
    } catch (err) {
      console.error('Error marking reminder as sent:', err);
      res.status(500).json({ error: 'Failed to mark reminder as sent' });
    }
});

//END REMINDERS

//CARD DESCRIPTION
//1. Endpoint untuk membuat dan mengubah card description
app.post('/api/card-description', async(req,res)=>{
    const {card_id, description}=req.body;
    try{
        const existingDesription = await client.query(
            'SELECT * FROM card_descriptions WHERE card_id = $1',
            [card_id]
        );
        if(existingDesription.rows.length> 0){
            //jika desktipsi sudah ada, lakukan update
            await client.query(
                'UPDATE card_descriptions SET description = $1, updated_at = NOW() WHERE card_id = $2',
                [description, card_id]
            );
        }else{
            await client.query(
                'INSERT INTO card_descriptions (card_id, description) VALUES ($1, $2)',
                [card_id, description]
            );
        }
        res.json({ success: true, message: 'Deskripsi berhasil disimpan' });
    }catch(error){
        console.error('Gagal menyimpan deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
})

//2. get card description by card id
app.get('/api/card-description/:card_id', async(req,res)=>{
    const {card_id} = req.params;
    try {
        const result = await client.query(
          'SELECT description FROM card_descriptions WHERE card_id = $1',
          [card_id]
        );
    
        if (result.rows.length > 0) {
          res.json({ success: true, description: result.rows[0].description });
        } else {
          res.json({ success: true, description: 'masukkan teks...' }); // Jika tidak ada, return string kosong
        }
      } catch (error) {
        console.error('Gagal mengambil deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
      }
})

//3. update card description
app.put('/api/card-description/:card_id', async(req,res)=>{
    const {card_id} = req.params;
    const {description}=req.body;

    try {
        await client.query(
            'UPDATE card_descriptions SET description = $1 WHERE card_id = $2',
            [description, card_id]
        );
        res.json({ success: true, message: 'Deskripsi berhasil diperbarui' });
    } catch (error) {
        console.error('Gagal menyimpan deskripsi:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
})

//CHECKLIST 
//1. get all checklist 
app.get('/api/checklists', async(req,res)=>{
    try{
        const result = await client.query(
            'SELECT * FROM checklists ORDER BY id DESC')
            res.json(result.rows) 
    }catch(error){
        res.status(500).json({error: error.message})
    }
})
//2. get checklist by id
app.get('/api/checklist/:id', async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await client.query("SELECT * FROM checklists WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//3. create new Checklist
app.post('/api/checklist', async(req,res)=>{
    const {name} = req.body;
    try {
        const result = await client.query(
          "INSERT INTO checklists (name) VALUES ($1) RETURNING *",
          [name]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//4. update checklist
app.put('/api/checklist/:id', async(req,res)=>{
    const {id} = req.params;
    const {name} = req.body;
    try {
        const result = await client.query(
          "UPDATE checklists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
          [name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//5. delete checklist
app.delete('/api/checklist/:id', async(req,res)=>{
    const {id} = req.params;
    try {
        const result = await client.query("DELETE FROM checklists WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Checklist not found" });
        res.json({ message: "Checklist deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//END CHECKLIST

//CARD CHECKLIST
//create new checklist using two tabel card checklist and checklist
app.post('/api/cards/:cardId/checklists', async (req, res) => {
    const { cardId } = req.params;
    const { name } = req.body; // Nama checklist yang akan ditambahkan

    if (!name) {
        return res.status(400).json({ error: "Checklist name is required" });
    }

    try {
        await client.query("BEGIN"); // Mulai transaksi

        // 1. Tambahkan checklist baru ke tabel `checklists`
        const checklistResult = await client.query(
            `INSERT INTO checklists (name) VALUES ($1) RETURNING id`,
            [name]
        );
        const checklistId = checklistResult.rows[0].id;

        // 2. Hubungkan checklist dengan card dalam tabel `card_checklists`
        await client.query(
            `INSERT INTO card_checklists (card_id, checklist_id) VALUES ($1, $2)`,
            [cardId, checklistId]
        );

        await client.query("COMMIT"); // Selesaikan transaksi

        res.status(201).json({
            message: "Checklist created and linked to card successfully",
            checklist_id: checklistId,
        });
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback jika terjadi error
        console.error("Error creating checklist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/checklists/:id
app.get('/api/checklists-items/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch checklist berdasarkan ID
      const checklistResult = await client.query('SELECT * FROM public.checklists WHERE id = $1', [id]);
      
      // Pastikan checklist ditemukan
      if (checklistResult.rows.length === 0) {
        return res.status(404).json({ message: 'Checklist not found' });
      }
  
      // Fetch checklist items yang terkait dengan checklist_id
      const checklistItemsResult = await client.query('SELECT * FROM public.checklist_items WHERE checklist_id = $1', [id]);
  
      // Gabungkan hasil checklist dengan checklist items
      const checklist = checklistResult.rows[0];
      checklist.items = checklistItemsResult.rows;
  
      res.json(checklist);
    } catch (error) {
      console.error('Error fetching checklist and items:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

//1. get all card checklist
app.get('/api/card-checklists', async(req,res)=>{
    try {
      const result = await client.query("SELECT * FROM card_checklists ORDER BY id DESC");
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
})
//2.get card checklist by id
app.get('/api/card-checklist/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM card_checklists WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card checklist not found" });
        res.json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//

//3.get card checklist by card id
app.get('/api/card-checklist/card/:card_id', async(req,res)=>{
    const card_id = parseInt(req.params.card_id, 10);
    
      if (isNaN(card_id)) {
          return res.status(400).json({ error: "Invalid card_id" });
      }
    
      try {
          const result = await client.query(
              `SELECT 
                  cc.card_id, 
                  json_agg(json_build_object('id', c.id, 'name', c.name)) AS checklists
               FROM card_checklists cc
               JOIN checklists c ON cc.checklist_id = c.id
               WHERE cc.card_id = $1
               GROUP BY cc.card_id`,
              [card_id]
          );
    
          if (result.rows.length === 0) {
              return res.status(404).json({ error: `No checklists found for card_id ${card_id}` });
          }
    
          res.json(result.rows[0]); // Mengembalikan satu objek JSON, bukan array
      } catch (error) {
          console.error('❌ Database error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
})

//4. create card checklist
app.post('/api/card-checklist', async(req,res)=>{
    const {card_id, checklist_id} = req.body;
    try {
        const result = await client.query(
          "INSERT INTO card_checklists (card_id, checklist_id,created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
          [card_id, checklist_id]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//5. update card checklist
app.put('/api/card-checklist/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query("DELETE FROM card_checklists WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Card checklist not found" });
        res.json({ message: "Card checklist deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
//6. delete card checklist
app.delete('/api/card-checklist/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
        const result = await client.query("DELETE FROM card_checklists WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Card checklist not found or already deleted" });
        }

        res.json({ message: "Card checklist deleted successfully", deletedData: result.rows[0] });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//END CARD CHECKLIST

//CHECKLIST ITEM
//1. get all checklist item for a checklist
app.get('/api/checklists/:checklist_id/items', async(req,res)=>{
    const {checklist_id} = req.params;
    try {
        const result = await client.query(
            'SELECT * FROM checklist_items WHERE checklist_id = $1 ORDER BY id DESC',
            [checklist_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
//2. get checklist item by id
app.get('/api/checklists/:checklistId/items/:itemId', async(req,res)=>{
    const { checklistId, itemId } = req.params;
  try {
      const result = await client.query(
          'SELECT * FROM checklist_items WHERE id = $1 AND checklist_id = $2',
          [itemId, checklistId]
      );
      if (result.rows.length === 0) {
          return res.status(404).json({ error: "Checklist item not found" });
      }
      res.json(result.rows[0]);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
})

//get checklist item by checklist id
app.get('/api/checklist-items/:checklist_id', async(req,res)=>{
    const checklist_id = parseInt(req.params.checklist_id, 10);

    if (isNaN(checklist_id)) {
        return res.status(400).json({ error: "Invalid checklist_id" });
    }

    try {
        const result = await client.query(
            `SELECT 
                ci.id,
                ci.name,
                ci.is_checked,
                ci.created_at,
                ci.updated_at
            FROM checklist_items ci
            WHERE ci.checklist_id = $1`,
            [checklist_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No checklist items found for checklist_id ${checklist_id}` });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//3. create checklist item
app.post('/api/checklists/:checklistId/items', async (req, res) => {
    const { checklistId } = req.params;
    const { name } = req.body;
    
    // Pastikan is_checked diset false jika tidak ada dalam request body
    const is_checked = false;

    try {
        const result = await client.query(
            'INSERT INTO checklist_items (checklist_id, name, is_checked) VALUES ($1, $2, $3) RETURNING *',
            [checklistId, name, is_checked]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//4. update checklist item
app.put('/api/checklists/:checklistId/items/:itemId/name', async (req, res) => {
    const { checklistId, itemId } = req.params;
    const { name } = req.body;
    try {
        const result = await client.query(
            'UPDATE checklist_items SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND checklist_id = $3 RETURNING *',
            [name, itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//5. update checklist item is_checked
app.put('/api/checklists/:checklistId/items/:itemId/check', async (req, res) => {
    const { checklistId, itemId } = req.params;
    const { is_checked } = req.body;
    try {
        const result = await client.query(
            'UPDATE checklist_items SET is_checked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND checklist_id = $3 RETURNING *',
            [is_checked, itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//5. delete checklist item
app.delete('/api/checklists/:checklistId/items/:itemId', async (req, res) => {
    const { checklistId, itemId } = req.params;
    try {
        const result = await client.query(
            'DELETE FROM checklist_items WHERE id = $1 AND checklist_id = $2 RETURNING *',
            [itemId, checklistId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Checklist item not found" });
        }
        res.json({ message: "Checklist item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

//6. get checklist total by cardId
app.get('/api/:cardId/checklist-total', async(req, res)=>{
    const {cardId} = req.params;
    try {
        const result = await client.query(`
          SELECT COUNT(*) AS total
          FROM card_checklists cc
          JOIN checklists c ON cc.checklist_id = c.id
          JOIN checklist_items ci ON c.id = ci.checklist_id
          WHERE cc.card_id = $1;
        `, [cardId]);
    
        res.json({ cardId: parseInt(cardId), total: parseInt(result.rows[0].total) });
      } catch (error) {
        console.error('Error getting total checklist items:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
})
//7. get checklist item "checked"
app.get('/api/:cardId/checklist-checked', async(req,res)=>{
    const {cardId} = req.params;
    try {
      const result = await client.query(`
        SELECT COUNT(*) AS checked
        FROM card_checklists cc
        JOIN checklists c ON cc.checklist_id = c.id
        JOIN checklist_items ci ON c.id = ci.checklist_id
        WHERE cc.card_id = $1 AND ci.is_checked = true;
      `, [cardId]);

      res.json({ cardId: parseInt(cardId), checked: parseInt(result.rows[0].checked) });
    } catch (error) {
      console.error('Error getting checked checklist items:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
})

//8. get checklist item "unchecked"
app.get('/api/:cardId/checklist-unchecked', async(req,res)=>{
    const {cardId} = req.params;
    try {
      const result = await client.query(`
        SELECT COUNT(*) AS unchecked
        FROM card_checklists cc
        JOIN checklists c ON cc.checklist_id = c.id
        JOIN checklist_items ci ON c.id = ci.checklist_id
        WHERE cc.card_id = $1 AND ci.is_checked = false;
      `, [cardId]);

      res.json({ cardId: parseInt(cardId), unchecked: parseInt(result.rows[0].unchecked) });
    } catch (error) {
      console.error('Error getting unchecked checklist items:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

})
//END CHECKLIST ITEM


//GABUNGAN KETIGA TABEL (CARD_CHECKLIST, CHECKLIST, CHECKLIST_ITEM)
// 1.Endpoint untuk mendapatkan checklist beserta checklist items berdasarkan card_id
app.get('/api/checklists-with-items/:card_id', async (req, res) => {
    const { card_id } = req.params;

    try {
        const checklistsWithItems = await client.query(`
            SELECT 
                c.id AS checklist_id,
                c.name AS checklist_name,
                ci.id AS item_id,
                ci.name AS item_name,
                ci.is_checked
            FROM public.checklists c
            JOIN public.card_checklists cc ON c.id = cc.checklist_id
            LEFT JOIN public.checklist_items ci ON c.id = ci.checklist_id
            WHERE cc.card_id = $1
        `, [card_id]);

        if (checklistsWithItems.rows.length === 0) {
            return res.status(404).json({ message: 'No checklists or items found for this card' });
        }

        // Organize data into checklist format
        const result = checklistsWithItems.rows.reduce((acc, row) => {
            const { checklist_id, checklist_name, item_id, item_name, is_checked } = row;

            // Find existing checklist in accumulator
            let checklist = acc.find(c => c.checklist_id === checklist_id);

            if (!checklist) {
                checklist = {
                    checklist_id,
                    checklist_name,
                    items: []
                };
                acc.push(checklist);
            }

            // Add items to the checklist
            if (item_id) {
                checklist.items.push({
                    item_id,
                    item_name,
                    is_checked
                });
            }

            return acc;
        }, []);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//2.menambahkan checklist baru dan menghubungkannya dengan card
app.post('/api/checklists-fix', async(req,res)=>{
    const { card_id, name } = req.body;
        try {
            const checklistResult = await client.query(
                'INSERT INTO public.checklists (name) VALUES ($1) RETURNING id',
                [name]
            );
            const checklist_id = checklistResult.rows[0].id;
            
            await client.query(
                'INSERT INTO public.card_checklists (card_id, checklist_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [card_id, checklist_id]
            );
    
            res.status(201).json({ checklist_id, message: 'Checklist berhasil ditambahkan' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
})
//3. mengupdate nama checklist
app.put('/api/checklists-fix/:id', async(req,res)=>{
    const { id } = req.params;
    const { name } = req.body;
    try {
        await client.query('UPDATE public.checklists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, id]);
        res.json({ message: 'Checklist berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//4. menghapus checklist dari sebuah card
app.delete('/api/checklists-fix/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        // Hapus dulu dari tabel relasi card_checklists
        await client.query('DELETE FROM public.card_checklists WHERE checklist_id = $1', [id]);
        // Baru hapus dari checklists
        await client.query('DELETE FROM public.checklists WHERE id = $1', [id]);

        res.json({ message: 'Checklist berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//CHECKLIST ITEM

//5. menambahkan checklist item baru ke checklist
app.post('/api/checklists-fix-items', async(req,res)=>{
    const { checklist_id, name } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO public.checklist_items (checklist_id, name) VALUES ($1, $2) RETURNING id',
            [checklist_id, name]
        );
        res.status(201).json({ item_id: result.rows[0].id, message: 'Checklist item berhasil ditambahkan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//6. mengupdate status is_checked pada checklist items
app.put('/api/checklists-fix-items/:id/check', async(req,res)=>{
    const { id } = req.params;
    const { is_checked } = req.body;
    try {
        await client.query('UPDATE public.checklist_items SET is_checked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [is_checked, id]);
        res.json({ message: 'Status checklist item berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//7. mengupdate name checklist item
app.put('/api/checklists-fix-items/:id/name', async(req,res)=>{
    const { id } = req.params;
    const { name } = req.body;
    try {
        await client.query('UPDATE public.checklist_items SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, id]);
        res.json({ message: 'Checklist item berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})
//8. menghapus checklist item
app.delete('/api/checklists-fix-items/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        await client.query('DELETE FROM public.checklist_items WHERE id = $1', [id]);
        res.json({ message: 'Checklist item berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

//LABEL
// 1. get label by card id 
app.get('/api/cards/:cardId/labels', async (req, res) => {
  const { cardId } = req.params;

  const query = `
    SELECT 
      l.id AS label_id,
      l.name AS label_name,
      c.hex_code AS bg_color
    FROM card_labels cl
    JOIN labels l ON cl.label_id = l.id
    LEFT JOIN colors c ON l.bg_color_id = c.id
    WHERE cl.card_id = $1
  `;

  try {
    const result = await client.query(query, [cardId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching labels by cardId:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

//2. menampilkan semua label 
app.get('/api/labels', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT 
            l.id,
            l.name,
            c.hex_code AS bg_color
            FROM labels l
            LEFT JOIN colors c ON l.bg_color_id = c.id

        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching labels with color:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




//CARD_LABELS
// 3. menghapus label dari card id 
app.delete('/api/cards/:cardId/labels/:labelId', async(req,res)=>{
    const { cardId, labelId } = req.params;
    const userId = req.user.id;

    try {
        await client.query(
            `DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2`, 
            [cardId, labelId]
        );

        //add log card activity
        await logCardActivity({
            action:'remove_label',
            card_id:cardId,
            user_id:userId,
            entity:'label',
            entity_id:labelId,
            details:''
        })

        res.json({ message: "Label removed from card successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
})
//4. membuat label baru
app.post('/api/labels', async(req,res)=>{
    const { name } = req.body; // Hanya menerima nama label

    try {
        const result = await client.query(
            `INSERT INTO labels (name,color,create_at) VALUES ($1, $2,CURRENT_TIMESTAMP) RETURNING *`,
            [name,'#333']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
})

//5. add label to card
app.post('/api/cards/:cardId/labels/:labelId', async(req,res)=>{
    const {cardId, labelId} = req.params;
    const userId = req.user.id;

    try {
        // Check if the card and label exist
        const cardExists = await client.query('SELECT 1 FROM cards WHERE id = $1', [cardId]);
        const labelExists = await client.query('SELECT 1 FROM labels WHERE id = $1', [labelId]);

        if (!cardExists.rows.length || !labelExists.rows.length) {
            return res.status(400).json({ message: 'Card or Label does not exist.' });
        }

        // Insert label to card in card_labels table
        const result = await client.query(
            'INSERT INTO card_labels (card_id, label_id, create_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
            [cardId, labelId]
        );

        //add log card activity
        await logCardActivity({
            action:'add_label',
            card_id:cardId,
            user_id:userId,
            entity:'add label',
            entity_id:labelId,
            details:''
        })

        return res.status(201).json({
            message: 'Label added to card successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding label to card:', error);
        return res.status(500).json({ message: 'Server error' });
    }
})

//6. delete label from labels
app.delete('/api/delete-label/:id', async(req,res)=>{
    const { id } = req.params;
    
    try {
      const result = await client.query('DELETE FROM labels WHERE id = $1', [id]);
    
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Label not found' });
      }
    
      res.json({ message: 'Label deleted successfully' });
    } catch (error) {
      console.error('Error deleting label:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
})

//7. update nama label 
app.put('/api/update-label-name/:id', async(req,res)=>{
    const { id } = req.params;
    const { name } = req.body;

    try {
      const result = await client.query(
        'UPDATE labels SET name = $1, update_at = NOW() WHERE id = $2 RETURNING *',
        [name, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Label not found' });
      }

      res.json({ message: 'Label updated successfully', label: result.rows[0] });
    } catch (error) {
      console.error('Error updating label:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
})

//8.add color id to label for bg 
app.put('/api/label/:labelId/bg_color', async(req,res)=>{
    const { labelId } = req.params;
    const {bg_color_id} = req.body;

    try {
    const updateQuery = `
      UPDATE labels
      SET bg_color_id = $1,
          update_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await client.query(updateQuery, [bg_color_id, labelId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// END LABEL 

//COLORS
//1. get all data colors
app.get('/api/colors', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM colors');
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error: error.message})
    }
})
//END COLORS


//CARD STATUS
//1. get status card by card id
app.get('/api/cards/:cardId/status', async (req, res) => {
    const { cardId } = req.params;
    // console.log("Received cardId:", cardId);

    try {
        const result = await client.query(
            `SELECT s.status_id, s.status_name, s.text_color,s.background_color, cs.assigned_at
            FROM card_status cs
            JOIN status s ON cs.status_id = s.status_id
            WHERE cs.card_id = $1`, 
            [cardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tidak ada status untuk cardId ini' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Gagal mengambil status', detail: error.message });
    }
});

app.get('/api/card-status/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    
        try {
            const result = await client.query(
                `SELECT  s.status_name, s.text_color,s.background_color
                 FROM card_status cs
                 JOIN status s ON cs.status_id = s.status_id
                 WHERE cs.card_id = $1`,
                [cardId]
            );
    
            res.json(result.rows);
        } catch (error) {
            console.error('Error mengambil status berdasarkan cardId:', error);
            res.status(500).json({ message: 'Gagal mengambil status' });
        }
})

//2. get all status
app.get('/api/status', async(req,res)=>{
    try {
        const result = await client.query(`SELECT * FROM status`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil daftar status' });
    }
})

//3. add/update status card id
app.post('/api/cards/:cardId/status', async(req,res)=>{
    const { cardId } = req.params;
    const { statusId } = req.body;
    const userId = req.user.id;
    
    try {
        // Cek apakah kartu sudah memiliki status
        const check = await client.query(`SELECT * FROM card_status WHERE card_id = $1`, [cardId]);

        if (check.rows.length > 0) {
            // Jika ada, update status
            await client.query(`UPDATE card_status SET status_id = $1, update_at = CURRENT_TIMESTAMP WHERE card_id = $2`, [statusId, cardId]);
            res.json({ message: 'Status kartu berhasil diperbarui' });
        } else {
            // Jika belum ada, tambahkan status baru
            await client.query(`INSERT INTO card_status (card_id, status_id, assigned_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`, [cardId, statusId]);
            res.json({ message: 'Status kartu berhasil ditambahkan' });
        }

        //add log card activity
        await logCardActivity({
            action:'updated_status',
            card_id:cardId,
            user_id:userId,
            entity:'status',
            entity_id:statusId,
            details:''
        })

    } catch (error) {
        res.status(500).json({ error: 'Gagal menambahkan/memperbarui status kartu' });
    }
})

//4. delete status card id
app.delete('/api/cards/:cardId/status', async(req,res)=>{
    const { cardId } = req.params;
    try {
        await client.query(`DELETE FROM card_status WHERE card_id = $1`, [cardId]);
        res.json({ message: 'Status berhasil dihapus dari kartu' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus status kartu' });
    }
})



//DATA_EMPLOYEE
//1. add data employee
app.post('/api/data-employees', async (req, res) => {
    const {name, nomor_wa, divisi, jabatan, email_employee, username} = req.body
    try{
        const result = await client.query(
            `INSERT INTO data_employees (name, nomor_wa, divisi, jabatan, email_employee,username, create_at, update_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
            [name, nomor_wa, divisi, jabatan, email_employee, username]
        );
        res.status(201).json(result.rows[0]);
    }catch(error){
        res.status(500).json({error: error.message});
    }
});

//2. delete data employee
app.delete('/api/employees/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const query = `DELETE FROM data_employees WHERE id = $1 RETURNING *;`;
        const result = await client.query(query, [id]);
    
        if (result.rowCount === 0) {
          return res.status(404).json({ error: "Data employee tidak ditemukan" });
        }
    
        res.json({ message: "Data employee berhasil dihapus" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal menghapus data employee" });
      }
})


//3.Mendapatkan semua data employee
app.get('/api/employees', async (req, res) => {
  try {
      const result = await client.query(`
        SELECT 
            de.id AS employee_id,
            de.name,
            de.nomor_wa,
            de.divisi,
            de.jabatan,
            de.email_employee,
            de.username,
            ep.id AS employee_profile_id,
            p.id AS profile_id,
            p.profile_name,
            p.photo_url,
            p.created_at AS profile_created_at
        FROM 
            data_employees de
        LEFT JOIN 
            employee_profiles ep ON de.id = ep.employee_id
        LEFT JOIN 
            profil p ON ep.profil_id = p.id
      `);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching employee with profile', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

//4. get data employee by id
app.get('/api/employees/:id', async(req,res)=>{
    const {id} = req.params;
   try {
      const result = await client.query(`
      SELECT 
          de.id AS employee_id,
          de.name,
          de.nomor_wa,
          de.divisi,
          de.jabatan,
          de.email_employee,
          de.username,
          ep.id AS employee_profile_id,
          p.id AS profile_id,
          p.profile_name,
          p.photo_url,
          p.created_at AS profile_created_at
        FROM 
            data_employees de
        JOIN 
            employee_profiles ep ON de.id = ep.employee_id
        JOIN 
            profil p ON ep.profil_id = p.id
        WHERE 
            de.id = $1
        `, [id]); 
      if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
})

//5. update data employee
app.put('/api/employees/:id', async(req,res)=>{
    const {id} = req.params;
    const {name, nomor_wa, divisi, jabatan, email_employee, username} = req.body;

   try {
       const result = await client.query(
        `UPDATE data_employees SET 
            name = $1, nomor_wa = $2, divisi = $3, jabatan = $4, email_employee = $5, username = $6, update_at = CURRENT_TIMESTAMP
        WHERE id = $7 RETURNING *`,
        [name, nomor_wa, divisi, jabatan, email_employee, username, id]
        );
       if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
       res.json(result.rows[0]);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
})


//DATA MARKERING
//1. get all marketing data
app.get('/api/marketing', async(req,res)=>{
    try {
        const result = await client.query("SELECT * FROM data_marketing");
        res.json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
})

//2. get data marketing by id
app.get('/api/marketing/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query("SELECT * FROM data_marketing WHERE marketing_id = $1", [id]);
    
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }
    
        res.json(result.rows[0]);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
})

// 3. update data marketing
app.put('/api/marketing/:id', async (req, res) => {
  const { id } = req.params;
  const {
    card_id,
    input_by,
    acc_by,
    buyer_name,
    code_order,
    jumlah_track,
    order_number,
    account,
    deadline,
    jumlah_revisi,
    order_type,
    offer_type,
    jenis_track,
    genre,
    price_normal,
    price_discount,
    discount,
    basic_price,
    gig_link,
    required_files,
    project_type,
    duration,
    reference_link,
    file_and_chat_link,
    detail_project,
    is_accepted // <- Tambahan kolom baru
  } = req.body;

  try {
    const result = await client.query(
      `UPDATE data_marketing SET 
        card_id = $1, input_by = $2, acc_by = $3, buyer_name = $4, 
        code_order = $5, jumlah_track = $6, order_number = $7, account = $8, 
        deadline = $9, jumlah_revisi = $10, order_type = $11, offer_type = $12, 
        jenis_track = $13, genre = $14, price_normal = $15, price_discount = $16, 
        discount = $17, basic_price = $18, gig_link = $19, required_files = $20, 
        project_type = $21, duration = $22, reference_link = $23, 
        file_and_chat_link = $24, detail_project = $25, is_accepted = $26, 
        update_at = CURRENT_TIMESTAMP
      WHERE marketing_id = $27 RETURNING *`,
      [
        card_id, input_by, acc_by, buyer_name, code_order, jumlah_track, order_number,
        account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
        price_normal, price_discount, discount, basic_price, gig_link, required_files,
        project_type, duration, reference_link, file_and_chat_link, detail_project,
        is_accepted, // posisi ke-26
        id           // posisi ke-27
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


//4. menghapus data marketing
app.delete("/api/marketing/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query("DELETE FROM data_marketing WHERE marketing_id = $1 RETURNING *", [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
  
      res.json({ message: "Data berhasil dihapus" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
//5. membuat data baru
app.post("/api/marketing", async (req, res) => {
    try {
      const {
        // card_id,
        input_by,
        acc_by,
        buyer_name,
        code_order,
        jumlah_track,
        order_number,
        account,
        deadline,
        jumlah_revisi,
        order_type,
        offer_type,
        jenis_track,
        genre,
        price_normal,
        price_discount,
        discount,
        basic_price,
        gig_link,
        required_files,
        project_type,
        duration,
        reference_link,
        file_and_chat_link,
        detail_project,
      } = req.body;
  
      const result = await client.query(
        `INSERT INTO data_marketing 
        (input_by, acc_by, buyer_name, code_order, jumlah_track, order_number, 
        account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre, 
        price_normal, price_discount, discount, basic_price, gig_link, required_files, 
        project_type, duration, reference_link, file_and_chat_link, detail_project, create_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
        $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP) RETURNING *`,
        [
          input_by, acc_by, buyer_name, code_order, jumlah_track, order_number,
          account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
          price_normal, price_discount, discount, basic_price, gig_link, required_files,
          project_type, duration, reference_link, file_and_chat_link, detail_project
        ]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

  //6. mengubah data marketing menjadi cards
  app.put('/api/create-card-marketing/:listId/:marketingId', async(req,res)=>{
    const { listId, marketingId } = req.params;
    
    try {
      // Ambil data marketing berdasarkan marketingId
      const marketingData = await client.query('SELECT * FROM data_marketing WHERE marketing_id = $1 AND card_id IS NULL', [marketingId]);
      
      if (marketingData.rows.length === 0) {
        return res.status(404).json({ message: 'Data marketing tidak ditemukan atau sudah memiliki card_id' });
      }
  
      const marketing = marketingData.rows[0];

      const description = `
        📦 Order Code: ${marketing.code_order}
        👤 Input By: ${marketing.input_by}
        ✅ Approved By: ${marketing.acc_by}
        🧑‍💼 Buyer: ${marketing.buyer_name}
        📋 Order Number: ${marketing.order_number}
        🏷️ Account: ${marketing.account}
        ⏰ Deadline: ${marketing.deadline ? new Date(marketing.deadline).toISOString().split('T')[0] : 'N/A'}
        🔁 Jumlah Revisi: ${marketing.jumlah_revisi}
        🎚️ Order Type: ${marketing.order_type}
        🎁 Offer Type: ${marketing.offer_type}
        🥁 Jenis Track: ${marketing.jenis_track}
        🎵 Genre: ${marketing.genre}
        🎧 Jumlah Track: ${marketing.jumlah_track}
        💰 Normal Price: $${marketing.price_normal}
        💸 Discount: ${marketing.discount ?? 'N/A'}
        💵 Basic Price: $${marketing.basic_price ?? 'N/A'}
        📁 Required Files: ${marketing.required_files}
        🎤 Project Type: ${marketing.project_type}
        ⏳ Duration: ${marketing.duration}
        🔗 Gig Link: ${marketing.gig_link}
        🔍 Reference: ${marketing.reference_link}
        📎 File & Chat: ${marketing.file_and_chat_link}
        📝 Detail: ${marketing.detail_project}
    `.trim();

  
      // Membuat card baru berdasarkan data marketing
      const newCard = await client.query(
        `INSERT INTO cards (list_id, title, description, position, due_date) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          listId,
          `${marketing.genre} - ${marketing.buyer_name} (${marketing.account})`,
        //   marketing.detail_project,
        description,
          0, // position default, sesuaikan dengan kebutuhan
          marketing.deadline
        ]
      );
  
      // Update card_id di data marketing dengan id card yang baru dibuat
      await client.query('UPDATE data_marketing SET card_id = $1 WHERE marketing_id = $2', [
        newCard.rows[0].id,
        marketingId
      ]);
  
      return res.status(201).json({
        message: 'Card berhasil dibuat dari data marketing.',
        cardId: newCard.rows[0].id
      });
  
    } catch (error) {
      console.error('Error creating card from marketing data:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan saat membuat card dari data marketing.' });
    }
  })

  //7. get card id by marketing id
  app.get('/api/get-card-id/:marketingId', async(req,res)=>{
    const {marketingId} = req.params;
    try {
        const query = `
          SELECT card_id
          FROM public.data_marketing
          WHERE marketing_id = $1
        `;
        const result = await client.query(query, [marketingId]);
    
        if (result.rows.length > 0) {
          const { card_id } = result.rows[0]; // Mengambil card_id dari hasil query
          return res.json({ cardId: card_id });
        } else {
          return res.status(404).json({ error: 'Card not found for the provided marketing_id' });
        }
      } catch (error) {
        console.error('Error executing query', error.stack);
        return res.status(500).json({ error: 'Internal server error' });
      }
  })
  //8. check card id in marketing id (null or not)
  app.get('/api/check-card-id/:marketingId', async(req,res)=>{
    const { marketingId } = req.params;
        try {
                const query = 'SELECT card_id FROM public.data_marketing WHERE marketing_id = $1';
                const result = await client.query(query, [marketingId]);
        
                if (result.rows.length > 0) {
                    // If card_id exists, return the card_id
                    return res.status(200).json({ card_id: result.rows[0].card_id });
                } else {
                    // No card_id found for the given marketing_id
                    return res.status(404).json({ message: 'No card_id found for this marketing_id' });
                }
            } catch (error) {
                console.error('Error checking card_id:', error);
                return res.status(500).json({ message: 'Server error' });
            }
  })

//9. menampilkan data marketing yang card idnya tidak null
app.get('/api/data-marketing-cardId', async(req,res)=>{
    try{
        const result = await client.query(`
            SELECT * FROM public.data_marketing
            WHERE card_id IS NOT NULL
            ORDER BY marketing_id DESC
        `);
        res.json(result.rows);
    }catch(error){
        console.error('Error fetching marketing data:', error);
        res.status(500).json({message:'Internal server error'});
    }
})

//10. menampilkan data marketing while cardId null
app.get('/api/data-marketing-cardId-null', async(req,res)=>{
    try{
        const result = await client.query(`
            SELECT * FROM public.data_marketing
            WHERE card_id IS NULL
            ORDER BY marketing_id DESC    
        `)
        res.json(result.rows)
    }catch(error){
        console.error('Error fetching data marketing cardId null:', error);
        res.json(500).json({message:'Internal server error'})
    }
})

//11. menampilkan data yang accepted
app.get('/api/data-marketing-accepted', async(req,res)=>{
    try{
        const result = await client.query(`
                SELECT * FROM public.data_marketing
                WHERE is_accepted = true
            `);
            res.json(result.rows)
    }catch(error){
        console.error('Error Fetching data marketing accepted:', error);
        res.json(500).json({message:'Internal server error'})
    }
})
//12. menampilkan data yang rejected
app.get('/api/data-marketing-rejected', async(req,res)=>{
    try{
        const result = await client.query(`
            SELECT * FROM public.data_marketing
            WHERE is_accepted = false    
        `);
        res.json(result.rows)
    }catch(error){
        console.error('Error Fetching data marketing rejected:', error);
        res.json(500).json({message:'Internal server error'})
    }
})

//13. archive data marketing
app.post('/api/archive-data-marketing/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO archive (
                entity_type, entity_id, name, description, parent_id, parent_type, create_at, update_at, archived_at
            )
            SELECT 
                'data_marketing',
                dm.marketing_id,
                dm.buyer_name,
                dm.detail_project,
                dm.card_id,
                'card',
                dm.create_at,
                dm.update_at,
                NOW()
            FROM data_marketing dm
            WHERE dm.marketing_id = $1
        `, [id]);

        if (result.rowCount > 0) {
            await client.query(`DELETE FROM data_marketing WHERE marketing_id = $1`, [id]);
            res.status(200).send(`Data marketing dengan id ${id} berhasil diarsipkan`);
        } else {
            res.status(404).send(`Data marketing dengan id ${id} tidak ditemukan`);
        }
    } catch (error) {
        console.error(`Error archive data marketing with id ${id}`, error);
        res.status(500).json({ error: error.message });
    }
});


//DATA MARKETING DESIGN
//1. menampilkan semua data
app.get('/api/marketing-design', async(req,res)=>{
    try {
        const result = await client.query('SELECT * FROM marketing_design');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
//2. menampilkan data berdasarkan id
app.get('/api/marketing-design/:id', async(req,res) =>{
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM marketing_design WHERE marketing_design_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/marketing-design', async (req, res) => {
    let {
        input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
        jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
        discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted
    } = req.body;

     // ✅ Default value jika is_accepted tidak dikirim
    if (typeof is_accepted === 'undefined' || is_accepted === null) {
        is_accepted = false;
    }

    console.log("Received data:", req.body); // 🟡 log data yang dikirim dari frontend

    try {
        const result = await client.query(
            `INSERT INTO marketing_design (
                input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
                jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
                discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted, create_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP
            ) RETURNING *`,
            [
                input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline,
                jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount,
                discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by, is_accepted
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Insert Error:", err); // 🔴 tampilkan error detail
        res.status(500).json({ error: err.message });
    }
});


//4. mengupdate data 
app.put('/api/marketing-design/:id', async(req,res)=>{
    const { id } = req.params;
    const { input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline, jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount, discount_percentage, required_files, project_type, reference, file_and_chat, detail_project, acc_by,is_accepted } = req.body;
     try {
        const result = await client.query(
            `UPDATE marketing_design SET 
                 input_by = $1, buyer_name = $2, code_order = $3, jumlah_design = $4, order_number = $5, account = $6, deadline = $7, jumlah_revisi = $8, order_type = $9, offer_type = $10, style = $11, resolution = $12, price_normal = $13, price_discount = $14, discount_percentage = $15, required_files = $16, project_type = $17, reference = $18, file_and_chat = $19, detail_project = $20, acc_by = $21, is_accepted = $22, update_at = CURRENT_TIMESTAMP
             WHERE marketing_design_id = $23 RETURNING *`, 
            [input_by, buyer_name, code_order, jumlah_design, order_number, account, deadline, jumlah_revisi, order_type, offer_type, style, resolution, price_normal, price_discount, discount_percentage, required_files, project_type, reference, file_and_chat, detail_project,acc_by,is_accepted, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//5. menghapus data
app.delete('/api/marketing-design/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query('DELETE FROM marketing_design WHERE marketing_design_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//6. check card id if null or not
app.get('/api/check-card-id-design/:marketing_design_id', async (req, res) => {
    const { marketing_design_id } = req.params;

    try {
        const query = 'SELECT card_id FROM marketing_design WHERE marketing_design_id = $1';
        const result = await client.query(query, [marketing_design_id]);

        console.log('Query Result:', result.rows[0]); // Debug hasil query di terminal

        if (result.rows.length > 0) {
            const cardId = result.rows[0].card_id;
            return res.status(200).json({ message: 'card_id found', card_id: cardId });
        } else {
            return res.status(404).json({ message: 'No card_id found for this marketing_design_id' });
        }
    } catch (error) {
        console.error('Error checking card_id:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

//7. mengubah data marketing design menjadi card design
app.put('/api/create-card-marketing-design/:listId/:marketingDesignId', async (req, res) => {
    const { listId, marketingDesignId } = req.params;
    
    try {
        // Ambil data marketing_design berdasarkan marketingDesignId
        const marketingData = await client.query(
            'SELECT * FROM marketing_design WHERE marketing_design_id = $1 AND card_id IS NULL',
            [marketingDesignId]
        );

        if (marketingData.rows.length === 0) {
            return res.status(404).json({ message: 'Data marketing design tidak ditemukan atau sudah memiliki card_id' });
        }

        const marketing = marketingData.rows[0];

        const deadlineFormatted = marketing.deadline 
        ? new Date(marketing.deadline).toLocaleString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
            }) 
        : '-';

        const description = `
            📦 Code Order: ${marketing.code_order}
            👤 Input By: ${marketing.input_by}
            🧑‍💼 Buyer: ${marketing.buyer_name}
            📋 Order Number: ${marketing.order_number}
            🏷️ Account: ${marketing.account}
            🎨 Design Count: ${marketing.jumlah_design}
            ⏰ Deadline: ${deadlineFormatted}
            🔁 Revisi: ${marketing.jumlah_revisi}
            📐 Order Type: ${marketing.order_type}
            🎁 Offer Type: ${marketing.offer_type}
            💅 Style: ${marketing.style}
            🖼️ Resolution: ${marketing.resolution}
            💰 Normal Price: ${marketing.price_normal}
            💸 Discount Price: ${marketing.price_discount}
            🎯 Discount: ${marketing.discount_percentage}%
            📁 Required Files: ${marketing.required_files}
            📂 Project Type: ${marketing.project_type}
            🔍 Reference: ${marketing.reference}
            📎 File/Chat: ${marketing.file_and_chat}
            📝 Detail: ${marketing.detail_project}
            ✅ Approved By: ${marketing.acc_by}
        `.trim();

        // Membuat card baru berdasarkan data marketing design
        const newCard = await client.query(
            `INSERT INTO cards (list_id, title, description, position, due_date, create_at) 
             VALUES ($1, $2, $3, $4, $5,CURRENT_TIMESTAMP) 
             RETURNING id`,
            [
                listId,
                `${marketing.buyer_name} - ${marketing.order_number} (${marketing.account})`,
                // marketing.detail_project,
                description,
                0, // posisi default, bisa disesuaikan
                marketing.deadline
            ]
        );

        // Update card_id di tabel marketing_design dengan id card yang baru dibuat
        await client.query(
            'UPDATE marketing_design SET card_id = $1, update_at = CURRENT_TIMESTAMP WHERE marketing_design_id = $2',
            [newCard.rows[0].id, marketingDesignId]
        );

        return res.status(201).json({
            message: 'Card berhasil dibuat dari data marketing design.',
            cardId: newCard.rows[0].id
        });
    } catch (error) {
        console.error('Error creating card from marketing design data:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat card dari data marketing design.' });
    }
});




// //9. mengambil semua data marketing yang memiliki cardId yang sama
// app.get('/api/cards/:cardId/marketing-detail', async (req, res) => {
//   const { cardId } = req.params;

//   try {
//     const result = await client.query(`
//       SELECT 
//         'design' AS type,
//         md.card_id,
//         md.input_by,
//         md.buyer_name,
//         md.code_order,
//         md.order_number,
//         md.account,
//         md.deadline,
//         md.jumlah_revisi,
//         md.order_type,
//         md.offer_type,
//         NULL AS jenis_track,
//         NULL AS genre,
//         md.price_normal,
//         md.price_discount,
//         CAST(md.discount_percentage AS varchar) AS discount,
//         NULL AS basic_price,
//         NULL AS gig_link,
//         md.required_files,
//         md.project_type,
//         NULL AS duration,
//         NULL AS reference_link,
//         NULL AS file_and_chat_link,
//         md.detail_project,
//         md.marketing_design_id AS marketing_id,
//         md.create_at,
//         md.update_at,
//         md.is_accepted
//       FROM marketing_design md
//       WHERE md.card_id = $1

//       UNION ALL

//       SELECT 
//         'musik' AS type,
//         dm.card_id,
//         dm.input_by,
//         dm.buyer_name,
//         dm.code_order,
//         dm.order_number,
//         dm.account,
//         dm.deadline,
//         dm.jumlah_revisi,
//         dm.order_type,
//         dm.offer_type,
//         dm.jenis_track,
//         dm.genre,
//         dm.price_normal,
//         dm.price_discount,
//         dm.discount,
//         dm.basic_price,
//         dm.gig_link,
//         dm.required_files,
//         dm.project_type,
//         dm.duration,
//         dm.reference_link,
//         dm.file_and_chat_link,
//         dm.detail_project,
//         dm.marketing_id,
//         dm.create_at,
//         dm.update_at,
//         dm.is_accepted
//       FROM data_marketing dm
//       WHERE dm.card_id = $1
//     `, [cardId]);

//     if (result.rows.length === 0) {
//     //   return res.status(404).json({ message: 'Tidak ada data marketing untuk card ini.' });
//       return console.log('Tidak ada data cardId untuk card ini ')
//     }

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching marketing data:', error);
//     res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
//   }
// });



//8. get card id by marketing design id
app.get('/api/card-id-design/:marketingDesignId', async(req,res)=>{
    const { marketingDesignId } = req.params;
    try {
        const query = `
          SELECT card_id
          FROM public.marketing_design
          WHERE marketing_design_id = $1
        `;
        const result = await client.query(query, [marketingDesignId]);
    
        if (result.rows.length > 0) {
          const { card_id } = result.rows[0]; // Mengambil card_id dari hasil query
          return res.json({ cardId: card_id });
        } else {
          return res.status(404).json({ error: 'Card not found for the provided marketing_design_id' });
        }
      } catch (error) {
        console.error('Error executing query', error.stack);
        return res.status(500).json({ error: 'Internal server error' });
      }  
})

//9. archive data marketing design
app.post('/api/archive-data-marketing-design/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO archive (
                entity_type, entity_id, name, description, parent_id, parent_type, create_at, update_at, archived_at
            )
            SELECT 
                'marketing_design',
                md.marketing_design_id,
                md.buyer_name,
                md.detail_project,
                md.card_id,
                'card',
                md.create_at,
                md.update_at,
                NOW()
            FROM marketing_design md
            WHERE md.marketing_design_id = $1
        `, [id]);

        if (result.rowCount > 0) {
            await client.query(`DELETE FROM marketing_design WHERE marketing_design_id = $1`, [id]);
            res.status(200).send(`Marketing design dengan id ${id} berhasil diarsipkan`);
        } else {
            res.status(404).send(`Data marketing design dengan id ${id} tidak ditemukan`);
        }
    } catch (error) {
        console.error(`Error archive data marketing design with id ${id}`, error);
        res.status(500).json({ error: error.message });
    }
});

//10. get data marketing design by data accepted
app.get('/api/marketing-design-accepted', async (req, res) => {
    try {
        // const accepted = req.query.is_accepted === 'true'; // untuk parameter query
        const result = await client.query(
            `SELECT * FROM marketing_design WHERE is_accepted = true`, 
            // [true]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).json({ error: err.message });
    }
});

//11. get data marketing by data not accepted
app.get('/api/marketing-design-not-accepted', async (req, res) => {
    try {
        // const accepted = req.query.is_accepted === 'true'; // untuk parameter query
        const result = await client.query(
            `SELECT * FROM marketing_design WHERE is_accepted = false`, 
            // [true]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).json({ error: err.message });
    }
});




//ENDPOIN UNTUK MENDAPATKAN WORKSPACE ID DAN BOARD ID BERDASARKAN LIST ID DAN CARD ID
app.post('/api/get-workspaceid-boardid', async (req, res) => {
    const { listId, cardId } = req.body; // menggunakan req.body
    try {
      const query = `
        SELECT b.workspace_id, l.board_id
        FROM public.cards c
        JOIN public.lists l ON c.list_id = l.id
        JOIN public.boards b ON l.board_id = b.id
        WHERE c.id = $1
      `;
      const result = await client.query(query, [cardId]);
    
      if (result.rows.length > 0) {
        const { workspace_id, board_id } = result.rows[0];
        return res.json({ workspaceId: workspace_id, boardId: board_id });
      } else {
        return res.status(404).json({ error: 'Card not found' });
      }
    } catch (error) {
      console.error('Error executing query', error.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

//ENDPOIN UNTUK MENAMPILKAN DATA MARKETING UNTUK CARD ID YANG TIDAK NULL
app.get('/api/marketing-designs', async(req,res)=>{
    try {
        const result = await client.query(`
          SELECT * FROM public.marketing_design 
          WHERE card_id IS NOT NULL
          ORDER BY marketing_design_id DESC;
        `);
    
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching marketing designs:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
})

//ENDPOIN UNTUK MENAMPILKAN DATA MARKETING UNTUK CARD ID NULL
app.get('/api/marketing-designs-null', async(req,res)=>{
    try{
        const result = await client.query(`
            SELECT * FROM public.marketing_design
            WHERE card_id IS NULL
            ORDER BY marketing_design_id DESC
            `);

            res.json(result.rows);
    }catch(error){
        console.error('Error fetching marketing designs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//ARCHIVE UNIVERSAL
//1. get all data archive
app.get('/api/archive-data', async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM archive_universal ORDER BY archived_at DESC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: error.message });
  }
});
//2. archive data berdasarkan entity
app.post('/api/archive/:entity/:id', async (req, res) => {
    const { entity, id } = req.params;

    const entityMap = {
        workspaces_user : {table: 'workspaces_users', idField:'workspace_id'} ,
        workspaces : { table: 'workspaces', idField: 'id' },
        boards :{table:'boards', idField:'id'},
        lists : { table:'lists', idField:'id'},
        cards: { table: 'cards', idField: 'id' },
        data_marketing: { table: 'data_marketing', idField: 'marketing_id' },
        marketing_design: {table: 'marketing_design', idField:'marketing_design_id'}
        // tambahkan entitas lainnya jika perlu
    };

    const config = entityMap[entity];
    if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

    try {
        const { table, idField } = config;

        // 1. Ambil data dari tabel asli
        const result = await client.query(
            `SELECT * FROM ${table} WHERE ${idField} = $1`, [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Data ${entity} dengan ID ${id} tidak ditemukan` });
        }

        const data = result.rows[0];

        // 2. Masukkan ke archive_universal
        await client.query(`
            INSERT INTO archive_universal (entity_type, entity_id, data)
            VALUES ($1, $2, $3)
        `, [entity, id, data]);

        // 3. Hapus dari tabel aslinya
        await client.query(
            `DELETE FROM ${table} WHERE ${idField} = $1`, [id]
        );

        res.status(200).json({ message: `Data ${entity} ID ${id} berhasil diarsipkan` });
    } catch (err) {
        console.error('Archive error:', err);
        res.status(500).json({ error: err.message });
    }
});

//3. delete data archive by id
app.delete('/api/archive-data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(`DELETE FROM archive_universal WHERE id = $1`, [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: `Archive with id ${id} deleted` });
    } else {
      res.status(404).json({ error: `Archive with id ${id} not found` });
    }
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ error: error.message });
  }
});

//4. restore data archive 
app.post('/api/restore/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;

  const entityMap = {
    workspaces_users: {table:'workspaces_users'},
    workspaces: {table:'workspace'},
    board: { table: 'boards' },
    lists: {table:'lists'},
    cards: { table: 'cards' },
    data_marketing: { table: 'data_marketing' },
    marketing_design: { table: 'marketing_design'}
    // tambah sesuai entity kamu
  };

  const config = entityMap[entity];
  if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

  try {
    // 1. Ambil data dari archive_universal
    const archiveResult = await client.query(
      `SELECT data FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    if (archiveResult.rows.length === 0) {
      return res.status(404).json({ error: `Data ${entity} dengan id ${id} tidak ditemukan di archive` });
    }

    const data = archiveResult.rows[0].data;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    // 2. Insert kembali ke tabel aslinya
    const insertQuery = `
      INSERT INTO ${config.table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;
    await client.query(insertQuery, values);

    // 3. Hapus dari archive_universal
    await client.query(
      `DELETE FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    res.status(200).json({ message: `Data ${entity} berhasil direstore.` });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: err.message });
  }
});

//END ARCHIVE UNIVERSAL


  
// ARCHIVE DATA 
//1. get all workspace archive
app.get('/api/archive-workspace', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['workspace']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data workspace yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})

// archive workspace user
app.get('/api/archive-workspace-user', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['workspace_user']);

        if(result.rows.length > 0) {
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data workspace user yang ditemukan');
        }
    }catch(error){
        console.error('Error fetching data archive workspace user:', error.stack)
        res.status(500).send({message:'Server error saat mengambil data dari database'});
    }
})

//2. get all boards archive
app.get('/api/archive-board', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['board']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data board yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//3. get all list archive
app.get('/api/archive-list', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['list']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data list yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//4. get all card archive
app.get('/api/archive-card', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['card']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data card yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//5. get all marketing data archive
app.get('/api/archive-marketing', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['marketing']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data marketing yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})
//6. get all marketing design data archive
app.get('/api/archive-marketing-design', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM archive WHERE entity_type = $1', ['marketing_design']);

        if(result.rows.length > 0){
            res.status(200).json(result.rows);
        }else{
            res.status(404).send('Tidak ada data marketing design yang ditemukan');
        }
    }catch(error){
        console.error('Error executing query:', error.stack);
        res.status(500).send('Server error saat mengambil data dari database!')
    }
})

//TABEL WORKSPACE SUMMARY
app.get('/api/workspaces/:userId/summary', async (req, res) => {
    const { userId } = req.params;
  
    const query = `
      SELECT 
        w.id AS workspace_id,
        w.name AS workspace_name,
        COUNT(DISTINCT b.id) AS board_count,
        COUNT(DISTINCT l.id) AS list_count,
        COUNT(c.id) AS card_count
      FROM workspaces_users wu
      JOIN workspaces w ON wu.workspace_id = w.id
      LEFT JOIN boards b ON b.workspace_id = w.id
      LEFT JOIN lists l ON l.board_id = b.id
      LEFT JOIN cards c ON c.list_id = l.id
      WHERE wu.user_id = $1
      GROUP BY w.id
      ORDER BY w.name
    `;
  
    try {
      const result = await client.query(query, [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No workspace summary found for this user' });
      }
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching workspace summary:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  //get summary form a workspace 
  app.get('/api/workspaces/:userId/summary/:workspaceId', async (req, res) => {
  const { userId, workspaceId } = req.params;

  const query = `
    SELECT 
      w.id AS workspace_id,
      w.name AS workspace_name,
      COUNT(DISTINCT b.id) AS board_count,
      COUNT(DISTINCT l.id) AS list_count,
      COUNT(c.id) AS card_count
    FROM workspaces_users wu
    JOIN workspaces w ON wu.workspace_id = w.id
    LEFT JOIN boards b ON b.workspace_id = w.id
    LEFT JOIN lists l ON l.board_id = b.id
    LEFT JOIN cards c ON c.list_id = l.id
    WHERE wu.user_id = $1 AND w.id = $2
    GROUP BY w.id
    ORDER BY w.name
  `;

  try {
    const result = await client.query(query, [userId, workspaceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workspace summary not found for this user' });
    }

    res.json(result.rows[0]); // hanya satu workspace
  } catch (err) {
    console.error('Error fetching workspace summary by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//PERSONAL NOTE
app.get('/api/all-note', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM personal_note ORDER BY id DESC');
        res.json(result.rows)
    }catch(error){
        res.status(500).json({error:'Gagal mengambil data semua personal note'});
    }
})

// PROFILE 
//1. get all profile
app.get('/api/profile', async(req,res)=>{
     try {
        const result = await client.query('SELECT * FROM profil ORDER BY id DESC');
        res.json(result.rows);
      } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil profil' });
      }
})

//2. get profile by id
app.get('/api/profile/:id', async(req,res)=>{
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM profil WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Profil tidak ditemukan' });
        res.json(result.rows[0]);
      } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil profil' });
      }
})

//USER PROFIL 
//1. get profile by user 
app.get('/api/profile-user/:userId', async(req,res)=>{
  const { userId } = req.params;
    try {
      const result = await client.query(`
        SELECT up.*, p.photo_url 
        FROM user_profil up 
        JOIN profil p ON up.profil_id = p.id 
        WHERE up.user_id = $1
      `, [userId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Profil untuk user tidak ditemukan' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Gagal mengambil profil user' });
    }  
})

//2. add profile to user 
app.post('/api/profile-user', async(req,res)=>{
    const { user_id, profil_id } = req.body;

    try {
        const existing = await client.query(
        'SELECT * FROM user_profil WHERE user_id = $1',
        [user_id]
        );

        if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'User sudah memiliki profil' });
        }

        const created = await client.query(
        'INSERT INTO user_profil (user_id, profil_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
        [user_id, profil_id]
        );

        res.status(201).json({ message: 'Profil berhasil ditambahkan ke user', data: created.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menambahkan profil ke user' });
    }
})

//3. delete user profil
app.delete('/api/profile-user/:userId', async(req,res)=>{
    const { userId } = req.params;
      try {
        const deleted = await client.query(
          'DELETE FROM user_profil WHERE user_id = $1 RETURNING *',
          [userId]
        );
    
        if (deleted.rows.length === 0) {
          return res.status(404).json({ error: 'Mapping profil user tidak ditemukan' });
        }
    
        res.json({ message: 'Mapping profil user berhasil dihapus', data: deleted.rows[0] });
      } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus mapping profil user' });
      }
})

//4. update profile user
app.put('/api/profile-user/:userId', async(req,res)=>{
    const userId = req.params.userId;
    const { profil_id } = req.body;
  
    try {
      const existing = await client.query(
        'SELECT * FROM user_profil WHERE user_id = $1',
        [userId]
      );
  
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Profil untuk user ini belum ada' });
      }
  
      const updated = await client.query(
        'UPDATE user_profil SET profil_id = $1, update_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
        [profil_id, userId]
      );
  
      res.json({ message: 'Profil user berhasil diperbarui', data: updated.rows[0] });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Gagal memperbarui profil user' });
    }
})

//LOG ACTIVITY USER
//1. menampilkan semua activity berdasarkan userId
app.get('/api/activity-logs/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Query untuk mengambil semua aktivitas berdasarkan userId
    const result = await client.query(
      `SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY "timestamp" DESC`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No activity found for user with ID ${userId}` });
    }

    // Mengembalikan daftar aktivitas yang ditemukan
    res.status(200).json({
      message: `Activities for user ID ${userId}`,
      activities: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//LOG ACTIVITY CARD
app.get('/api/activity-card/card/:cardId', async(req,res)=>{
    const {cardId} = req.params;

    try {
    const result = await client.query(`
      SELECT ca.*, u.username
      FROM card_activities ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.card_id = $1
      ORDER BY ca.created_at DESC
    `, [cardId]);

    res.json({
      message: `Activities for card ID ${cardId}`,
      activities: result.rows,
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/api/activity-log', async (req, res) => {
    const { entityType, entityId, action, userId, details, parentEntity, parentEntityId } = req.body;
  
    try {
      // Validasi input
      if (!entityType || !entityId || !action || !userId) {
        return res.status(400).json({ error: 'Missing required fields: entityType, entityId, action, userId' });
      }
  
      // Menambahkan log aktivitas ke dalam tabel activity_logs
      const result = await client.query(
        `INSERT INTO activity_logs (entity_type, entity_id, action, user_id, details, parent_entity, parent_entity_id, "timestamp")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
        [entityType, entityId, action, userId, details, parentEntity, parentEntityId]
      );
  
      // Menanggapi jika log berhasil ditambahkan
      res.status(201).json({
        message: 'Activity log added successfully',
        logId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error adding activity log:', error);
      res.status(500).json({ error: error.message });
    }
  });
  

//END

//CHAT ROOM
//1. mengambil semua data chat room
app.get('/api/cards/:cardId/chats', async (req, res) => {
    const { cardId } = req.params;
  
    try {
      const result = await client.query(
        `SELECT 
           cc.*, 
           u.username,
           p.profile_name,
           p.photo_url
         FROM card_chats cc
         JOIN users u ON cc.user_id = u.id
         LEFT JOIN user_profil up ON u.id = up.user_id
         LEFT JOIN profil p ON up.profil_id = p.id
         WHERE cc.card_id = $1 AND cc.deleted_at IS NULL
         ORDER BY cc.send_time ASC`,
        [cardId]
      );
  
      const allChats = result.rows;
  
      // Buat map ID ke chat
      const chatMap = {};
      allChats.forEach(chat => {
        chat.replies = [];
        chatMap[chat.id] = chat;
      });
  
      // Susun struktur nested
      const chatTree = [];
      allChats.forEach(chat => {
        if (chat.parent_message_id) {
          const parent = chatMap[chat.parent_message_id];
          if (parent) {
            parent.replies.push(chat);
          }
        } else {
          chatTree.push(chat);
        }
      });
  
      res.status(200).json(chatTree);
    } catch (err) {
      console.error('Error fetching chats:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
//2. post mention, create new chat 
app.post('/api/cards/:cardId/chats', async (req,res)=>{
  try {
    const { cardId } = req.params;
    const { user_id, message, parent_message_id } = req.body;

    // Step 1: Simpan chat dulu
    const result = await client.query(
      `INSERT INTO card_chats (card_id, user_id, message, parent_message_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cardId, user_id, message, parent_message_id]
    );

    const newChat = result.rows[0];

    // Step 2: Notifikasi balasan
    if (parent_message_id) {
    const parent = await client.query(
        `SELECT user_id FROM card_chats WHERE id = $1`,
        [parent_message_id]
    );

    const parentUserId = parent.rows[0]?.user_id;

    if (parentUserId && parentUserId !== user_id) {
        // Ambil username dari pengirim pesan (bukan parent)
        const senderResult = await client.query(
        `SELECT username FROM users WHERE id = $1`,
        [user_id]
        );

        const senderUsername = senderResult.rows[0]?.username || 'Someone';

        await client.query(
        `INSERT INTO notifications (user_id, chat_id, message, type)
        VALUES ($1, $2, $3, 'reply')`,
        [parentUserId, newChat.id, `${senderUsername} replied to your message`]
        );
    }
    }


    // Step 3: Mention detection
    const mentionMatches = message.match(/@(\w+)/g);
    let mentionedUserIds = [];

    if (mentionMatches) {
      for (const mention of mentionMatches) {
        const username = mention.slice(1); // Hapus "@"

        const userResult = await client.query(
          `SELECT id FROM users WHERE username = $1`,
          [username]
        );

        if (userResult.rows.length > 0) {
          const mentionedUserId = userResult.rows[0].id;
          mentionedUserIds.push(mentionedUserId);

          // Simpan notifikasi mention
          await client.query(
            `INSERT INTO notifications (user_id, chat_id, message, type)
             VALUES ($1, $2, $3, 'mention')`,
            [mentionedUserId, newChat.id, message]
          );
        }
      }

      // Step 4: Simpan list user_id ke kolom mentions (jsonb)
      await client.query(
        `UPDATE card_chats SET mentions = $1 WHERE id = $2`,
        [JSON.stringify(mentionedUserIds), newChat.id]
      );
    }

    // Step 5: Ambil data chat setelah mentions di-update
    const updatedChat = await client.query(
      `SELECT * FROM card_chats WHERE id = $1`,
      [newChat.id]
    );

    res.status(201).json(updatedChat.rows[0]);

  } catch (err) {
    console.error('Error post chat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//3. soft delete message
app.delete('/api/chats/:chatId', async(req,res)=>{
    const { chatId } = req.params;
  
    try {
      // Tandai pesan sebagai dihapus
      await client.query(
        `UPDATE card_chats 
         SET deleted_at = NOW(), message = '[pesan dihapus]' 
         WHERE id = $1`,
        [chatId]
      );
  
      res.status(200).json({ message: 'Pesan berhasil dihapus (soft delete)' });
    } catch (err) {
      console.error('Error deleting chat:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
})

//4. get total message card
app.get('/api/chats-total/cards/:cardId', async(req,res)=>{
    const { cardId } = req.params;
    
    try {
      const result = await client.query(
        `SELECT COUNT(*) AS message_count FROM card_chats WHERE card_id = $1 AND deleted_at IS NULL`,
        [cardId]
      );

      res.json({ cardId, messageCount: parseInt(result.rows[0].message_count) });
    } catch (err) {
      console.error('Error getting message count:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
})

//5. menampilkan mention 
app.get('/api/notification-mention/:userId', async(req,res)=>{
    const { userId } = req.params;

  try {
    const result = await client.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

//6. endpoin untuk menampilkan endpoin yang sudah dibaca
app.patch('/api/notification-read/:id', async(req, res)=>{
    const {id} = req.params;

    try{
        await client.query(
        `UPDATE notifications SET is_read = true WHERE id = $1`,
        [id]
        );

        res.json({success:true});
    }catch(error){
        console.error('Error markeing notification is read:', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//7. endpoin delete notification by user
app.delete('/api/notifications/:id', async(req,res)=>{
    const {id} = req.params;

    try{
        const result = await client.query(
            `DELETE FROM notifications WHERE id = $1`,
            [id]
        );

        res.json({success: true, message: `Delete notifications with id ${id}`});
    }catch(error){
        console.error('Error deleting notifications:',error);
        res.status(500).json({error:'Internal server error'});
    }
})



//SCHEDULE
//1. create new schedule, but just 1 day
app.post('/api/schedule', async(req,res)=>{
    const { user_id, day_id, shift_id } = req.body;
      try {
        const result = await client.query(
          `INSERT INTO user_weekly_schedule (user_id, day_id, shift_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, day_id) DO UPDATE SET shift_id = EXCLUDED.shift_id
           RETURNING *`,
          [user_id, day_id, shift_id]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({ message: 'Failed to add schedule' });
      }
})

//2. update shedule 
app.put('/api/update-schedule/:scheduleId', async(req,res)=>{
    const { scheduleId } = req.params;
    const { shift_id } = req.body;

    try {
      const result = await client.query(
        `UPDATE user_weekly_schedule
         SET shift_id = $1, updated_at = NOW()
         WHERE schedule_id = $2
         RETURNING *`,
        [shift_id, scheduleId]
      );
      res.status(200).json({
        message: 'Jadwal berhasil diperbarui',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: 'Failed to update schedule' });
    }
})

//3. delete schedule per hari
app.delete('/api/delete-schedule/:scheduleId', async(req,res)=>{
    const { scheduleId } = req.params;
      try {
        await client.query(
          `DELETE FROM user_weekly_schedule WHERE schedule_id = $1`,
          [scheduleId]
        );
        res.json({ message: 'Schedule deleted' });
      } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete schedule' });
      }
})

//4. get schedule by user 
app.get('/api/user-schedule/:userId', async(req,res)=>{
    const {userId} = req.params;
    try{
        const result = await client.query(
            `SELECT s.schedule_id, d.days_name, sh.status_shift, sh.keterangan
            FROM user_weekly_schedule s
            JOIN days_of_week d ON s.day_id = d.days_id
            JOIN shift_schedule sh ON s.shift_id = sh.shift_id
            WHERE s.user_id = $1
            ORDER BY d.days_id ASC`,
            [userId]
        );
        res.json(result.rows);
    }catch(error){
        console.error('Fetch error:', error);
        res.status(500).json({message:'Failed to fetch schedule'});
    }
})

//5. get all shift
app.get('/api/shift', async(req,res)=>{
    try{
        const result = await client.query(
            'SELECT * FROM shift_schedule'
        )
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

//update employee shift
app.put('/api/schedule-weekly', async (req, res) => {
  const { employee_id, day_id, shift_id } = req.body;

  if (!employee_id || !day_id) {
    return res.status(400).json({ message: 'employee_id dan day_id wajib diisi' });
  }

  const today = new Date().toISOString().slice(0, 10); // format: YYYY-MM-DD

  try {
    // Cek apakah data sudah ada berdasarkan employee_id dan schedule_date
    const checkQuery = `
      SELECT id FROM employee_schedule 
      WHERE employee_id = $1 AND schedule_date = $2 AND day_id = $3
    `;
    const checkResult = await client.query(checkQuery, [employee_id, today, day_id]);

    if (checkResult.rows.length > 0) {
      // Sudah ada, update
      const updateQuery = `
        UPDATE employee_schedule
        SET shift_id = $1
        WHERE employee_id = $2 AND schedule_date = $3 AND day_id = $4
      `;
      await client.query(updateQuery, [shift_id || null, employee_id, today, day_id]);
    } else {
      // Belum ada, insert
      const insertQuery = `
        INSERT INTO employee_schedule (employee_id, day_id, shift_id, schedule_date)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertQuery, [employee_id, day_id, shift_id || null, today]);
    }

    res.json({ message: 'Shift berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// NEW EMPLOYEE SCHEDULE
//1. get all schedule
app.get('/api/schedules', async(req,res)=>{
    try {
        const result = await client.query(`
          SELECT es.id, es.schedule_date, sd.day_name, ss.status_shift, de.name AS employee_name
          FROM employee_schedule es
          JOIN data_employees de ON es.employee_id = de.id
          LEFT JOIN shift_schedule ss ON es.shift_id = ss.shift_id
          LEFT JOIN schedule_day sd ON es.day_id = sd.day_id
          ORDER BY de.name, es.schedule_date
        `);
    res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
})
//2. get schedule by employee
app.get('/api/schedule-employee/:employeeId', async(req,res)=>{
    const { employeeId } = req.params;
    try {
      const result = await client.query(`
        SELECT es.id, es.schedule_date, sd.day_name, ss.status_shift
        FROM employee_schedule es
        LEFT JOIN shift_schedule ss ON es.shift_id = ss.shift_id
        LEFT JOIN schedule_day sd ON es.day_id = sd.day_id
        WHERE es.employee_id = $1
        ORDER BY es.schedule_date
      `, [employeeId]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
})

// 3. get all employee shedule dalam seminggu
app.get('/api/schedule-weekly', async(req,res)=>{
    try {
        const query = `
          SELECT 
            e.id AS employee_id,
            e.name AS employee_name,
            e.divisi AS employee_divisi,
            d.day_id,
            d.day_name,
            COALESCE(s.status_shift, 'Libur') AS shift
          FROM data_employees e
          CROSS JOIN schedule_day d
          LEFT JOIN employee_schedule es 
            ON es.employee_id = e.id AND es.day_id = d.day_id
          LEFT JOIN shift_schedule s 
            ON s.shift_id = es.shift_id
          ORDER BY e.id, d.day_id;
        `;
        
        const { rows } = await client.query(query);
    
        // Transform data menjadi format tabel:
        const result = {};
        rows.forEach(row => {
          const { employee_id,employee_divisi, employee_name, day_name, shift } = row;
          if (!result[employee_id]) {
            result[employee_id] = { employee_id,employee_divisi,Nama: employee_name };
          }
          result[employee_id][day_name] = shift;
        });
    
        // Convert object to array
        const formatted = Object.values(result);
    
        res.json(formatted);
      } catch (error) {
        console.error('Error getting employee schedules:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
})

//SCHEDULE DAY
//1. get all days
app.get('/api/schedule-days', async(req,res)=>{
    try{
        const result = await client.query('SELECT * FROM schedule_day')
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

//2. get schedule per hari berdasarkan employee id
app.get('/api/day-schedule-employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  try {
    const result = await client.query(
      `
      SELECT 
        sd.day_id, 
        sd.day_name, 
        ss.status_shift
      FROM schedule_day sd
      LEFT JOIN employee_schedule es ON es.day_id = sd.day_id AND es.employee_id = $1
      LEFT JOIN shift_schedule ss ON ss.shift_id = es.shift_id
      ORDER BY sd.day_id;
      `,
      [employeeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employee schedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//END CHAT ROOM


//SYSTEM NOTIFICATION

//1. get notification by user id
app.get('/api/system-notification/user/:userId', async(req,res)=>{
    const {userId} = req.params;

    try{
        const result = await client.query('SELECT * FROM system_notifications WHERE user_id = $1', [userId])
        res.json(result.rows);

    }catch(error){
        res.status(500).json({error:error.message})
    }
})

//2. mark notification as read
app.patch('/api/system-notification/:id', async(req,res)=>{
    const {id} = req.params;
    try{
        await client.query(
            `UPDATE system_notifications SET is_read = true WHERE id = $1`,
            [id]
        );

        res.json({success:true})
    }catch(error){
        console.error('Error marking notification as read:', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//3. delete notification by user
app.delete('/api/system-notification/:id', async(req,res)=>{
    const {id} = req.params;

    try{
        const result = await client.query(
            `DELETE FROM system_notifications WHERE id = $1`,[id]
        );

        res.json({success:true, message:`Delete notifications with id ${id}`})
    }catch(error){
        res.status(500).json({error:'Internal server error'});
    }
})


// Misalnya di file server.js / routes.js kamu
// 5. Get chat message detail by chat_id and user_id (for mention or reply notification)
app.get('/api/chat/:chatId/user/:userId', async (req, res) => {
  const { chatId, userId } = req.params;

  try {
    const result = await client.query(
      `SELECT 
         cc.id, cc.card_id, cc.user_id, cc.message, cc.parent_message_id,
         cc.mentions, cc.send_time, cc.created_at, u.username
       FROM card_chats cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.id = $1`,
      [chatId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat message not found' });
    }

    const chat = result.rows[0];

    // Cek apakah user_id termasuk dalam mentions
    const isMentioned = chat.mentions && Array.isArray(chat.mentions)
      ? chat.mentions.includes(parseInt(userId))
      : false;

    res.json({ 
      chat,
      isMentioned
    });
  } catch (error) {
    console.error('Error fetching chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

//6. endpoin untuk mengetahui total notifikasi yang belum dibaca dari dua tabel (system_notifikasi dan notifikasi pesan)
app.get('/api/notifications/unread-count/:userId', async(req,res)=>{
    const {userId} = req.params;

    try{
        const result = await client.query(`
        SELECT 
            (SELECT COUNT(*) FROM system_notifications WHERE user_id = $1 AND is_read = false) AS unread_system,
            (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false) AS unread_chat;
        `, [userId]);

        const unreadSystem = parseInt(result.rows[0].unread_system, 10);
        const unreadChat = parseInt(result.rows[0].unread_chat, 10);

        res.status(200).json({
            unread_system: unreadSystem,
            unread_chat: unreadChat,
            total_unread: unreadSystem + unreadChat
        });
        
    }catch(error){
        console.error('Error fetching unread counts:', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//7. gabungan kedua notifikasi (chat + system) menampilkan semua notifikasi
app.get('/api/all-notif/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Query chat notifications
        const chatResult = await client.query(`
            SELECT id, chat_id, message, is_read, created_at, type, 'chat' AS source 
            FROM notifications
            WHERE user_id = $1
        `, [userId]);

        // Query system notifications
        const systemResult = await client.query(`
            SELECT id, card_id, message, is_read, created_at, type, 'system' AS source
            FROM system_notifications
            WHERE user_id = $1
        `, [userId]);

        // Gabungkan & urutkan berdasarkan waktu terbaru
        const allNotifications = [...chatResult.rows, ...systemResult.rows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ success: true, data: allNotifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
});


//mendapatkan data workspace, board, list berdasarkan data (cardId dan listId)
// Endpoint untuk ambil lokasi lengkap dari card
app.get('/api/card/:cardId/user/:userId/location', async (req, res) => {
    const { cardId, userId } = req.params;

    try {
        const result = await client.query(
            `SELECT 
                cards.id AS card_id,
                cards.list_id,
                lists.board_id,
                boards.workspace_id
             FROM cards
             JOIN lists ON cards.list_id = lists.id
             JOIN boards ON lists.board_id = boards.id
             WHERE cards.id = $1`,
            [cardId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Card not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET path info from chatId and userId
app.get('/api/chat/:chatId/path', async (req, res) => {
    const { chatId } = req.params;

    try {
        const result = await client.query(`
            SELECT 
                cc.card_id, 
                c.list_id, 
                l.board_id, 
                b.workspace_id
            FROM card_chats cc
            JOIN cards c ON cc.card_id = c.id
            JOIN lists l ON c.list_id = l.id
            JOIN boards b ON l.board_id = b.id
            WHERE cc.id = $1
        `, [chatId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const { card_id, list_id, board_id, workspace_id } = result.rows[0];

        res.json({
            workspaceId: workspace_id,
            boardId: board_id,
            listId: list_id,
            cardId: card_id
        });

    } catch (error) {
        console.error('Error fetching path:', error);
        res.status(500).json({ error: error.message });
    }
});

//GET PATH info from workspaceId and cardId
app.get('/api/card/:cardId/card-location', async (req, res) => {
  const { cardId } = req.params;

  if (!cardId) {
    return res.status(400).json({ error: 'cardId wajib diisi' });
  }

  try {
    console.log("Fetching location for cardId:", cardId);

    const result = await client.query(`
      SELECT 
        w.id AS workspace_id,
        b.id AS board_id,
        l.id AS list_id,
        c.id AS card_id
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE c.id = $1
      LIMIT 1
    `, [cardId]);

    if (result.rows.length === 0) {
      console.log("Card not found or broken relation");
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Gagal mengambil lokasi card:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data', detail: error.message });
  }
});

