// if (activity.action_type === 'move') {
//               message = `${activity.username} moved "${detail.cardTitle}" 
//                         from "${detail.fromListName}" to "${detail.toListName}"`;
//             }

// if (activity.action_type === 'duplicate') {
//   if (detail.cardTitle) {
//     // kalau board sama
//     if (detail.fromBoardName === detail.toBoardName) {
//       message = `${activity.username} duplicated card as "${detail.cardTitle}" 
//                  in list "${detail.toListName}" on board "${detail.toBoardName}"`;
//     } else {
//       // kalau duplicate antar board
//       message = `${activity.username} duplicated card as "${detail.cardTitle}" 
//                  from list "${detail.fromListName}" (board "${detail.fromBoardName}") 
//                  to list "${detail.toListName}" (board "${detail.toBoardName}")`;
//     }
//   }
// }



// // {
// //     "message": "Card berhasil dipindahkan",
// //     "cardId": "485",
// //     "fromBoardId": 216,
// //     "fromBoardName": "[DESIGN] ACTIVE ORDER",
// //     "fromListId": 360,
// //     "fromListName": "2. FAHMISANS",
// //     "toBoardId": 216,
// //     "toBoardName": "[DESIGN] ACTIVE ORDER",
// //     "toListId": "360",
// //     "toListName": "2. FAHMISANS",
// //     "newPosition": 7,
// //     "newCard": {
// //         "id": "485",
// //         "title": "card contoh duplicate move duplicate again",
// //         "listId": "360",
// //         "listName": "2. FAHMISANS",
// //         "boardId": 216,
// //         "boardName": "[DESIGN] ACTIVE ORDER",
// //         "movedBy": {
// //             "id": 3,
// //             "username": "anandradoe"
// //         }
// //     }
// // }


// <ul className="space-y-3">
//   {cardActivities.map((activity) => {
//     const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
//     const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';

//     let messageElement = null;

//     if (activity.action_type === 'updated_title' && detail.new_title) {
//       messageElement = (
//         <>
//           <span className="font-semibold">{activity.username}</span> updated title to{" "}
//           <span className="font-bold">"{detail.new_title}"</span>
//         </>
//       );
//     }

//     if (activity.action_type === 'move' && detail.cardTitle) {
//       if (detail.fromBoardName === detail.toBoardName) {
//         messageElement = (
//           <>
//             <span className="font-semibold">{activity.username}</span> moved{" "}
//             <span className="font-bold">"{detail.cardTitle}"</span> from{" "}
//             <span className="text-red-500">"{detail.fromListName}"</span> to{" "}
//             <span className="text-green-600">"{detail.toListName}"</span> on board{" "}
//             <span className="italic">"{detail.toBoardName}"</span>
//           </>
//         );
//       } else {
//         messageElement = (
//           <>
//             <span className="font-semibold">{activity.username}</span> moved{" "}
//             <span className="font-bold">"{detail.cardTitle}"</span> from{" "}
//             <span className="text-red-500">"{detail.fromListName}"</span> (board{" "}
//             <span className="italic">"{detail.fromBoardName}"</span>) to{" "}
//             <span className="text-green-600">"{detail.toListName}"</span> (board{" "}
//             <span className="italic">"{detail.toBoardName}"</span>)
//           </>
//         );
//       }
//     }

//     if (activity.action_type === 'duplicate' && detail.cardTitle) {
//       if (detail.fromBoardName === detail.toBoardName) {
//         messageElement = (
//           <>
//             <span className="font-semibold">{activity.username}</span> duplicated card as{" "}
//             <span className="font-bold">"{detail.cardTitle}"</span> in list{" "}
//             <span className="text-green-600">"{detail.toListName}"</span> on board{" "}
//             <span className="italic">"{detail.toBoardName}"</span>
//           </>
//         );
//       } else {
//         messageElement = (
//           <>
//             <span className="font-semibold">{activity.username}</span> duplicated card as{" "}
//             <span className="font-bold">"{detail.cardTitle}"</span> from list{" "}
//             <span className="text-red-500">"{detail.fromListName}"</span> (board{" "}
//             <span className="italic">"{detail.fromBoardName}"</span>) to list{" "}
//             <span className="text-green-600">"{detail.toListName}"</span> (board{" "}
//             <span className="italic">"{detail.toBoardName}"</span>)
//           </>
//         );
//       }
//     }

//     return (
//       <li
//         key={activity.id}
//         className="ca-li"
//         style={{
//           padding: '0.25rem',
//           borderLeftWidth: '4px',
//           borderLeftStyle: 'solid',
//           borderLeftColor: borderColor,
//           backgroundColor: '#f8fafc',
//           borderRadius: '0.25rem',
//         }}
//       >
//         <p style={{ fontSize: '12px', margin: 0 }}>{messageElement}</p>
//         <p
//           style={{
//             fontSize: '10px',
//             width: '100%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'flex-end',
//           }}
//         >
//           {new Date(activity.created_at).toLocaleString()}
//         </p>
//       </li>
//     );
//   })}
// </ul>



//     const handleMoveCard = async () => {
//         if (!cardId || !selectedList.id) {
//             alert('Please select both board and list!');
//             return;
//         }

//         setIsMoving(true);

//         try {
//             await moveCardToList(cardId, selectedList.id);
//             showSnackbar('Card moved successfully!', 'success');
//             navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);
//             fetchCardList(selectedList.id)
//             onClose();
//         } catch (error) {
//             console.error('Error moving card:', error);
//             showSnackbar('Failed to move the card!', 'error');
//         } finally {
//             setIsMoving(false);
//         }
//     };



//   const handleMoveCard = async () => {
//   if (!cardId || !selectedList?.id) {
//     alert('Please select both board and list!');
//     return;
//   }

//   setIsMoving(true);

//   try {
//     const result = await moveCardToList(cardId, selectedList.id);
//     console.log('Card moved to target list:', result.data);

//     showSnackbar('Card moved successfully!', 'success');

//     // Navigasi ke board tujuan
//     navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

//     // Refetch board + lists + cards
//     if (fetchBoardDetail) fetchBoardDetail();
//     if (fetchCardList) fetchCardList(selectedList.id);

//     onClose();
//   } catch (error) {
//     console.error('Error moving card:', error);
//     showSnackbar('Failed to move the card!', 'error');
//   } finally {
//     setIsMoving(false);
//   }
// };
