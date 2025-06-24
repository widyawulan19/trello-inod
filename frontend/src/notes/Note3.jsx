// // GET /api/uploaded-files/:cardId
// app.get('/api/uploaded-files/:cardId', async (req, res) => {
//   const { cardId } = req.params;

//   try {
//     const result = await client.query(
//       `SELECT * FROM uploaded_files WHERE card_id = $1 ORDER BY uploaded_at DESC`,
//       [cardId]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching files:', error);
//     res.status(500).json({ error: 'Failed to fetch uploaded files' });
//   }
// });

// // DELETE /api/uploaded-files/:id
// app.delete('/api/uploaded-files/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Ambil dulu file_url untuk referensi hapus dari Cloudinary kalau perlu
//     const findResult = await client.query(
//       `SELECT file_url FROM uploaded_files WHERE id = $1`,
//       [id]
//     );

//     if (findResult.rows.length === 0) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     const fileUrl = findResult.rows[0].file_url;

//     // (Opsional) Hapus file dari Cloudinary kalau disimpan di sana
//     // Pastikan kamu parsing public_id dari URL
//     // const publicId = ... // logic parsing
//     // await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

//     // Hapus dari database
//     await client.query(`DELETE FROM uploaded_files WHERE id = $1`, [id]);

//     res.status(200).json({ message: 'File deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting file:', error);
//     res.status(500).json({ error: 'Failed to delete file' });
//   }
// });


// <div className="de-panel">
//             <div className="dep-right">
//               <h3>👋 Meet the Team</h3>
//               <div className="dep-desc">
//                 <strong style={{fontSize:'12px'}}>Satu Tim. Banyak Cerita. Satu Visi.</strong>
//                 <p>
//                   Halaman ini adalah tempat kamu bisa mengenal lebih dekat siapa saja orang-orang hebat yang membangun dan menggerakkan Inod Studio, mulai dari latar belakang mereka, peran di tim, hingga kontribusinya di setiap proyek.
//                 </p>
//               </div>
//             </div>

//             <div className="dep-left">
//                 <div className="dep-btn">
//                   <button onClick={handleShowForm} >
//                     <HiPlus className='mr-1'/>
//                     ADD DATA
//                   </button>
//                   <button onClick={()=> setIsDropdownOpen(!isDropdownOpen)}>
//                       <HiOutlineFilter style={{marginRight:'3px'}}/>
//                       FILTER
//                   </button>
//                 </div>
//                 {/* SHOW FILTER DROPDOWN */}
//                 {isDropdownOpen && (
//                   <ul className="dropdown-menu" ref={isDropdownOpenRef}>
//                     <div className="dm-title">
//                       Filter by:
//                     </div>
//                     <li onClick={() => handleFilterData('')}>All DATA</li>
//                     <li onClick={() => handleFilterData('produksi')}>PRODUKSI</li>
//                     <li onClick={() => handleFilterData('marketing')}>MARKETING</li>
//                     <li onClick={() => handleFilterData('desain')}>DESAIN</li>
//                     <li onClick={() => handleFilterData('operational')}>OPERATIONAL</li>
//                   </ul>
//                 )}

//                 <div className='dep-search'>
//                   <div className="dep-search-box">
//                       <HiOutlineSearch />
//                       {/* Input pencarian */}
//                       <input
//                           type="text"
//                           placeholder="Search by name..."
//                           value={searchTerm}
//                           onChange={handleSearchChange}
//                       />
//                   </div>
//                 </div>
//             </div>
//           </div>

//           <div className="view-toggle">
//               <button
//                 className={viewMode === 'table' ? 'active' : ''}
//                 onClick={() => setViewMode('table')}
//               >
//                 <HiMiniTableCells size={15}/>
//                 Table View
//               </button>
//               <button
//                 className={viewMode === 'card' ? 'active' : ''}
//                 onClick={() => setViewMode('card')}
//               >
//                 <HiOutlineCreditCard size={15}/>
//                 Card View
//               </button>
//           </div>