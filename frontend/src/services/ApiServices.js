import axios from 'axios';

// const API_URL = 'http://localhost:3002/api'; //untuk development
const API_URL = 'https://trello-inod-production.up.railway.app/api'
// const API_URL = 'https://5eae-118-96-151-188.ngrok-free.app/api'; //kalau pakai ngrok


//UPLOAD FILE
export const uploadFile = (file, cardId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('card_id', cardId);

  return axios.post(`${API_URL}/upload-attach`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

//UPLOADED FILE
export const getAllUploadFiles = (cardId) => axios.get(`${API_URL}/uploaded-files/${cardId}`);
export const getTotalFile = (cardId) =>  axios.get(`${API_URL}/uploaded-files/${cardId}/count`);

//WORKSPACE
export const getWorkspaces = () => axios.get(`${API_URL}/workspace`)
export const getWorkspaceById = (id) => axios.get(`${API_URL}/workspace/${id}`)
export const createWorkspace = (data) => axios.post(`${API_URL}/workspace`, data);
export const updateWorkspace = (id, data) => axios.put(`${API_URL}/workspace/${id}`,data)
export const updateWorkspaceName = (id, name) => axios.put(`${API_URL}/workspace/${id}/name`, name)
export const updateWorkspaceDescription = (id, description) => axios.put(`${API_URL}/workspace/${id}/description`, description)
export const deleteWorkspace = (id) => axios.delete(`${API_URL}/workspace/${id}`)
export const archiveWorkspace = (id) => axios.post(`${API_URL}/workspace/archive/${id}`)

//WORKSPACE USER
export const createWorkspaceUser = (data) => axios.post(`${API_URL}/workspace-user/create`, data);
export const getWorkspaceUsers = (id) => axios.get(`${API_URL}/workspace/${id}/users`);
export const updateWorkspaceUser = (workspaceId, userId, data) => axios.put(`${API_URL}/workspace-user/${workspaceId}/user/${userId}`, data);
export const deleteWorkspaceUser = (workspaceId, userId) => axios.delete(`${API_URL}/workspace-user/${workspaceId}/user/${userId}`);
export const archiveWorkspaceUser = (workspaceId) => axios.post(`${API_URL}/archive-workspace-user/${workspaceId}`);
export const getWorkspacesByUserId = (userId) => axios.get(`${API_URL}/user/${userId}/workspaces`);
export const getAdminFromWorkspace = (workspaceId) => axios.get(`${API_URL}/${workspaceId}/admin`)

//ASSIGN USER TO WORKSPACE
export const getAllUsersWorkspace = (workspaceId) => axios.get(`${API_URL}/workspace/${workspaceId}/users`)
export const getAllUsersWorkspaceAndProfil = (workspaceId) => axios.get(`${API_URL}/workspace/${workspaceId}/users-profil`)
export const removeUserFromWorkspace = (workspaceId, userId) => axios.delete(`${API_URL}/workspace/${workspaceId}/user/${userId}`)
export const addUserToWorkspace = (workspaceId, userId, data) => axios.post(`${API_URL}/workspace-user/${workspaceId}/user/${userId}`, data);
export const getTotalUserWorkspace = (workspaceId) => axios.get(`${API_URL}/workspaces/${workspaceId}/user-count`)


//USER
export const createUser = (username, email, password) => axios.post(`${API_URL}/users`, { username, email, password });
export const getAllUsers = () => axios.get(`${API_URL}/users`);
export const getUserById = (userId) => axios.get(`${API_URL}/api/${userId}`);
export const updateUser = (userId, username, email, password) =>  axios.put(`${API_URL}/users/${userId}`, { username, email, password });
export const deleteUser = (userId) => axios.delete(`${API_URL}/users/${userId}`);
export const resetPassword = (userId, newPassword) =>axios.post(`${API_URL}/users/${userId}/password-reset`, { newPassword });
export const getUserSettingData = (userId) => axios.get(`${API_URL}/user-setting/${userId}`);
export const updateUserSettingData = (userId, data) => axios.put(`${API_URL}/user-setting/${userId}`, data)

//BOARDS
export const getBoards = () => axios.get(`${API_URL}/boards`);
export const getBoardsWorkspace = (workspaceId) => axios.get(`${API_URL}/workspaces/${workspaceId}/boards`);
export const getBoardById = (id) => axios.get(`${API_URL}/boards/${id}`)
export const createBoard = (data) => axios.post(`${API_URL}/boards`, data)
export const updateBoard = (id, data) => axios.put(`${API_URL}/boards/${id}`, data)
export const deleteBoard = (id) => axios.delete(`${API_URL}/boards/${id}`)
export const updateBoardName = (id, name) => axios.put(`${API_URL}/boards/${id}/name`, name)
export const updateBoardDescription = (id, description) => axios.put(`${API_URL}/boards/${id}/description`, description)
export const duplicateBoards = (boardId, workspaceId) => axios.post(`${API_URL}/duplicate-board/${boardId}/to-workspace/${workspaceId}`)
export const moveBoardToWorkspace = (boardId, workspaceId) => axios.post(`${API_URL}/move-board/${boardId}/to-workspace/${workspaceId}`)
export const archiveBoard = (boardId) => axios.post(`${API_URL}/boards/${boardId}/archive`);


//BOARD PRIORITY
export const addPriorityToBoard = (boardId, priorityId) => axios.post(`${API_URL}/board-priority`, {board_id:boardId, priority_id:priorityId})
export const getBoardPriorities = (boardId) => axios.get(`${API_URL}/board-priority/${boardId}`) 
export const getALlPriorities = () => axios.get(`${API_URL}/priority`)
export const deletePropertyFromBoard = (boardId, priorityId) => axios.delete(`${API_URL}/board-priority-remove`,{ data: {board_id:boardId, priority_id:priorityId}})

//CARD PRIORITY
export const addPriorityToCard = (card_id, priority_id) => axios.post(`${API_URL}/card-priorities`, {card_id, priority_id})
export const getAllCardPriority = () => axios.get(`${API_URL}/card-priorities`)
export const getCardPriority = (cardId) => axios.get(`${API_URL}/card-priorities/${cardId}`)
export const deletePriorityFromCard = (card_id, priority_id) => axios.delete(`${API_URL}/card-priority`, {data: {card_id, priority_id}})

//LISTS
export const getAllLists = () => axios.get(`${API_URL}/lists`)
export const getListById = (listId) => axios.get(`${API_URL}/lists/${listId}`)
export const getListByBoard = (boardId) => axios.get(`${API_URL}/lists/board/${boardId}`)
export const createLists = (boardId, name) => axios.post(`${API_URL}/lists`,{board_id:boardId, name})
export const updateLists = (id, name) => axios.put(`${API_URL}/lists/${id}`, name)
export const deleteLists = (id) => axios.delete(`${API_URL}/lists/${id}`)
export const moveListToBoard = (listId, data) => axios.put(`${API_URL}/move-list/${listId}`, data)
export const duplicateList = (listId, data) => axios.post(`${API_URL}/duplicate-list/${listId}`, data)
export const archiveList = (listId) => axios.put(`${API_URL}/archive-lists/${listId}`)

//CARDS
export const getAllCard = () => axios.get(`${API_URL}/cards`)
export const getCardById = (id) => axios.get(`${API_URL}/cards/${id}`)
export const getCardByList = (listId) => axios.get(`${API_URL}/cards/list/${listId}`)
export const createCard = (data) => axios.post(`${API_URL}/cards`, data)
export const deleteCard = (cardId) => axios.delete(`${API_URL}/cards/${cardId}`)
export const duplicateCard = (cardId, listId) => axios.post(`${API_URL}/duplicate-card-to-list/${cardId}/${listId}`)
export const moveCardToList = (cardId, listId) => axios.put(`${API_URL}/move-card-to-list/${cardId}/${listId}`)
export const archiveCard = (cardId) => axios.put(`${API_URL}/archive-card/${cardId}`, cardId);

//CARD USERS
export const getAllUserAssignToCard = (cardId) => axios.get(`${API_URL}/cards/${cardId}/assignable-users`)
export const assignUserToCard = (cardId, userId) => axios.post(`${API_URL}/cards/${cardId}/users/${userId}`)
export const deleteUserFromCard = (cardId, userId) => axios.delete(`${API_URL}/cards/${cardId}/users/${userId}`)
export const getAllCardUsers = (cardId) => axios.get(`${API_URL}/cards/${cardId}/users`)

//UPDATE CARDS
export const updateTitleCard = (id, title) => axios.put(`${API_URL}/cards/${id}/title`, title)
export const updateDescCard = (id, description) => axios.put(`${API_URL}/cards/${id}/desc`, description)
export const updateDueDataCard = (id, due_date) => axios.put(`${API_URL}/cards/${id}/due_date`, due_date)
export const updateCoverCard = (id, cover_id) => axios.put(`${API_URL}/cards/${id}/cover`, cover_id)
export const updateLabelCard = (id, label_id) => axios.put(`${API_URL}/cards/${id}/label`, label_id)
export const updateImageCard = (id, image_id) => axios.put(`${API_URL}/cards/${id}/image`, image_id)
export const updateAssignCard = (id, assign) => axios.put(`${API_URL}/cards/${id}/assign`, assign)

//CARD COVER
export const getCoverByCard = (id) => axios.get(`${API_URL}/card-cover/${id}`)
export const addCoverCard = (data) => axios.post(`${API_URL}/add-cover`, data)
export const updateCardCover = (data) => axios.put(`${API_URL}/update-cover`, data)
export const deleteCoverCard = (cardId) => axios.delete(`${API_URL}/delete-cover/${cardId}`)

//COVER 
export const getAllCovers = () => axios.get(`${API_URL}/covers`)

//CARD DUE DATE
export const getAllDueDate = () => axios.get(`${API_URL}/card-due-date`)
export const getDueDateById = (id) => axios.get(`${API_URL}/card-due-date/${id}`)
export const getAllDueDateByCardId = (cardId) => axios.get(`${API_URL}/card-due-date/card/${cardId}`)
export const addNewDueDate = (data) => axios.post(`${API_URL}/card-due-dates`, data)
export const updateDueDate = (id, data) => axios.put(`${API_URL}/card-due-date/${id}`, data)
export const deleteDueDate = (id) => axios.delete(`${API_URL}/card-due-date/${id}`)

//REMINDERS
export const addNewReminder = (cardId, reminder_date) => axios.post(`${API_URL}/card-due-date/${cardId}/set-reminder`, reminder_date);
export const getReminderByCardId = (cardId) => axios.get(`${API_URL}/card-due-date/${cardId}/get-reminder`);
export const updateReminder = (cardId, reminder_date) => axios.put(`${API_URL}/card-due-date/${cardId}/update-reminder`, reminder_date);
export const deleteReminder = (cardId) => axios.delete(`${API_URL}/card-due-date/${cardId}/delete-reminder`);
export const getAllReminders = () => axios.get(`${API_URL}/card-due-date`);
export const markReminderAsSent = (cardId) => axios.put(`${API_URL}/card-due-date/${cardId}/mark-reminder-sent`);


//DESCRIPTION CARD
export const saveCardDescriptions = (cardId, description) => axios.post(`${API_URL}/card-description`, {card_id: cardId, description:description});
export const getCardDescription = (cardId) => axios.get(`${API_URL}/card-description/${cardId}`)
export const updateCardDescription = (cardId, description) => axios.put(`${API_URL}/card-description/${cardId}`, description)
//NOTE
// periksa cover, karena jika satu button cover di buka dan menampilkan select cover pada cardid lainnya juga akan terbuka

//GABUNGAN CHECKLIST, CARD_CHECKLIST, CHECKLIST_ITEM
export const getChecklistsWithItemsByCardId = (cardId) => axios.get(`${API_URL}/checklists-with-items/${cardId}`)
export const createChecklist = (data) => axios.post(`${API_URL}/checklists-fix`, data)
export const updateChecklistName = (id,data) => axios.put(`${API_URL}/checklists-fix/${id}`,data)
export const deleteChecklist = (id) => axios.delete(`${API_URL}/checklists-fix/${id}`)
export const createChecklistItem = (data) => axios.post(`${API_URL}/checklists-fix-items`, data)
export const updateCheckItem = (id, data) => axios.put(`${API_URL}/checklists-fix-items/${id}/check`, data)
export const updateNameItem = (id,data) => axios.put(`${API_URL}/checklists-fix-items/${id}/name`, data)
export const deleteChecklistItem = (id) => axios.delete(`${API_URL}/checklists-fix-items/${id}`)

//CHECKLIST ITEM (TOTAL)
export const getTotalChecklistItemByCardId = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-total`)
export const getChecklistItemChecked = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-checked`)
export const getChecklistItemUnchecked = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-unchecked`)

//LABELS
export const getLabelByCard = (cardId) => axios.get(`${API_URL}/cards/${cardId}/labels`)
export const getAllLabels = ()=> axios.get(`${API_URL}/labels`)
export const deleteLabels = (cardId, labelId) => axios.delete(`${API_URL}/cards/${cardId}/labels/${labelId}`)
export const createLabel = (data) => axios.post(`${API_URL}/labels`, data) 
export const addLabelToCard = (cardId, labelId) => axios.post(`${API_URL}/cards/${cardId}/labels/${labelId}`)
export const deleteLabelFromLabels = (labelId) => axios.delete(`${API_URL}/delete-label/${labelId}`)
export const updateLabelName = (id, data) => axios.put(`${API_URL}/update-label-name/${id}`, data)
export const addColorToBgColorLabel = (labelId, data) => axios.put(`${API_URL}/label/${labelId}/bg_color`, data)

//COLORS
export const getAllColor = () => axios.get(`${API_URL}/colors`)

//CARD STATUS
export const getStatusByCardId = (cardId) => axios.get(`${API_URL}/cards/${cardId}/status`)
export const getAllStatus = () => axios.get(`${API_URL}/status`)
export const updateStatus = (cardId, statusId) => axios.post(`${API_URL}/cards/${cardId}/status`, statusId)
export const getStatusCard = (cardId) => axios.get(`${API_URL}/card-status/${cardId}`);

//DATA EMPLOYEE
export const getEmployee = () => axios.get(`${API_URL}/employees`)
export const getEmployeeById = (id) => axios.get(`${API_URL}/employees/${id}`)
export const updateDataEmployee = (id,data) => axios.put(`${API_URL}/employees/${id}`, data)
export const addEmployeeData = (data) => axios.post(`${API_URL}/data-employees`, data)
export const deleteDataEmployee = (id) => axios.delete(`${API_URL}/employees/${id}`)
// export const updateDataEmployeeLengkap = (id, data) => axios.put(`${API_URL}/data-employees/${id}`, data)
// export const getEmployeeByUserId = (user_id) => axios.get(`${API_URL}/employees/${user_id}`)
// export const getEmployeeSchedule = () => axios.get(`${API_URL}/work-schedule`)

//NEW DATA EMPLOYEE


//EMPLOYEE
export const addDataEmployee = (data) => axios.post(`${API_URL}/employees`, data)
export const getAllEmploye = () => axios.get(`${API_URL}/employee`)
export const getEmployeeDataById = (id) => axios.get(`${API_URL}/employee/${id}`)
export const updateEmployee = (id,data) => axios.put(`${API_URL}/employee/${id}`, data)
// export const deleteEmployeeData = (id) => axios.delete(`${API_URL}/employee/${id}`)

//EMPLOYEE DETAIL
export const createNewDataEmployee = (data) => axios.post(`${API_URL}/employee-data`, data)
export const getAllDataEmployee = () => axios.get(`${API_URL}/employee-details`)
export const getDataEmployeeById = (id) => axios.get(`${API_URL}/employee-details/${id}`)
export const getDataEmployeeByUserId = (userId) => axios.get(`${API_URL}/employee-details/user/:${userId}`)
export const updateEmployeeData = (id, data) => axios.put(`${API_URL}/employee-details/${id}`, data)
export const deleteEmployeeData = (id) => axios.delete(`${API_URL}/employee-details/${id}`)
export const getAllScheduleEmployee = () => axios.get(`${API_URL}/employee-schedule`)
export const getScheduleEmployeeById = (id) => axios.get(`${API_URL}/employee-schedule/${id}`)
export const updateScheduleEmployee = (id, data) => axios.put(`${API_URL}/employee-schedule/${id}`, data)

//EMPLOYEE SCHEDULE
export const getScheduleEmployee = () => axios.get(`${API_URL}/schedule`)
export const updateSchedule = (data) => axios.put(`${API_URL}/schedule`,data)

//NEW EMPLOYEE SCHEDULE
export const getAllEmployeeSchedule = () => axios.get(`${API_URL}/schedules`);
export const getEmployeeByEmployeeId = (id) => axios.get(`${API_URL}/schedule-employee/${id}`) 
export const getWeeklyEmployeeSchedule = () => axios.get(`${API_URL}/schedule-weekly`)

//DAYS
export const getDays = () => axios.get(`${API_URL}/days`)
export const getDaysEmployee = (employeeId) => axios.get(`${API_URL}/day-schedule-employee/${employeeId}`);

//SHIFT
export const getAllShift = () => axios.get(`${API_URL}/shift`)
export const updateEmployeeShift = (data) => axios.put(`${API_URL}/schedule-weekly`,data)

//USER SCHEDULE
export const createNewSchedule = (data) => axios.post(`${API_URL}/schedule`, data);
export const updateScheduleUser = (scheduleId, data) => axios.put(`${API_URL}/update-schedule/${scheduleId}`,data)
export const deleteSchedule = (scheduleId) => axios.delete(`${API_URL}/delete-schedule/${scheduleId}`);
export const getScheduleUser = (userId) => axios.get(`${API_URL}/user-schedule/${userId}`) 


// DATA MARKETING 
export const getAllDataMarketing = () => axios.get(`${API_URL}/marketing`)
export const getCardIdMarketingByMarketingId = (id) => axios.get(`${API_URL}/get-card-id/${id}`)
export const getDataMarketingById = (id) => axios.get(`${API_URL}/marketing/${id}`)
export const updateDataMarketing = (id, data) => axios.put(`${API_URL}/marketing/${id}`,data)
export const deleteDataMarketing = (id) => axios.delete(`${API_URL}/marketing/${id}`)
export const addDataMarketing = (data) => axios.post(`${API_URL}/marketing`, data)
export const createCardFromMarketing = (listId,marketingId) => axios.put(`${API_URL}/create-card-marketing/${listId}/${marketingId}`)
export const checkCardIdNullOrNot = (id) => axios.get(`${API_URL}/check-card-id/${id}`)
export const getDataMarketingWithCardId = () => axios.get(`${API_URL}/data-marketing-cardId`)
export const getDataMarketingWithCardIdNull = () => axios.get(`${API_URL}/data-marketing-cardId-null`)
export const getDataMarketingAccepted = () => axios.get(`${API_URL}/data-marketing-accepted`)
export const getDataMarketingRejected = () => axios.get(`${API_URL}/data-marketing-rejected`)
export const archiveDataMarketing = (id) => axios.post(`${API_URL}/archive-data-marketing/${id}`);

//DATA MARKERING DESIGN
export const getAllDataMarketingDesign = () => axios.get(`${API_URL}/marketing-design`)
export const getCardIdMarketingDesignByMarketingId = (id) => axios.get(`${API_URL}/card-id-design/${id}`)
export const getDataMarketingDesignById = (id) => axios.get(`${API_URL}/marketing-design/${id}`)
export const createDataMarketingDesign = (data) => axios.post(`${API_URL}/marketing-design`, data)
export const updateDataMarketingDesign = (id,data) => axios.put(`${API_URL}/marketing-design/${id}`, data)
export const deleteDataMarketingDesign = (id) => axios.delete(`${API_URL}/marketing-design/${id}`)
export const checkCardIdNullOrNotForDesign = (id) => axios.get(`${API_URL}/check-card-id-design/${id}`)
export const createCardFromMarketingDesign = (listId, marketingDesignId) => axios.put(`${API_URL}/create-card-marketing-design/${listId}/${marketingDesignId}`)
export const getDataWhereCardIdNotNull = () => axios.get(`${API_URL}/marketing-designs`);
export const getDataWhereCardIdIsNull = () => axios.get(`${API_URL}/marketing-designs-null`);
export const getDataMarketingDesignNotAccept = () => axios.get(`${API_URL}/marketing-design-not-accepted`)
export const getDataMarketingDesignAccept = () => axios.get(`${API_URL}/marketing-design-accepted`);
export const archiveDataMarektingDesign = (id) => axios.post(`${API_URL}/archive-data-marketing-design/${id}`);

//menampilkan semua detai data (marketing, design) dalm card
export const getAllDataMarketingCard = (cardId) => axios.get(`${API_URL}/cards/${cardId}/marketing-detail`);

//GET WORKSPACE ID & BOARD ID FORM LISTS&CARD ID
export const getWorkspaceIdAndBoardId = (data) => axios.post(`${API_URL}/get-workspaceid-boardid`, data)

//membuat card dari data marketing (design, musik)

export const createCardFromDataMarketing = (listId, marketingDesignId) => axios.put(`${API_URL}/create-card-marketing/${listId}/${marketingDesignId}`)
//ARCHIVE

export const getArchiveWorkspace = () => axios.get(`${API_URL}/archive-workspace`)
export const getArchiveWorkspaceUser = () => axios.get(`${API_URL}/archive-workspace-user`);
export const getArchiveBoard = () => axios.get(`${API_URL}/archive-board`)
export const getArchiveList = () => axios.get(`${API_URL}/archive-list`)
export const getArchiveCard = () => axios.get(`${API_URL}/archive-card`)
export const getArchiveMarketing = () => axios.get(`${API_URL}/archive-marketing`)
export const getArchiveMarketingDesign = () => axios.get(`${API_URL}/archive-marketing-design`)

//WORKSPACE USER SUMMARY
export const getWorkspaceSummary = (userId) => axios.get(`${API_URL}/workspaces/${userId}/summary`)
export const getWorkspaceSummaryByWorkspaceId = (userId,workspaceId) => axios.get(`${API_URL}/workspaces/${userId}/summary/${workspaceId}`)

//PROFILE
export const getAllProfile = () => axios.get(`${API_URL}/profile`)
export const getProfileById = (id) => axios.get(`${API_URL}/profile/${id}`)

//USER PROFILE
export const getProfileByUserId = (userId) => axios.get(`${API_URL}/profile-user/${userId}`)
export const addProfileToUser = (data) => axios.post(`${API_URL}/profile-user`, data)
export const deleteUserProfile = (userId) => axios.delete(`${API_URL}/profile-user/${userId}`)
export const updateProfileUser = (userId, data) => axios.put(`${API_URL}/profile-user/${userId}`,data)


//LOG ACTIVITY FOR USER
export const getActivityForUserId = (userId) => axios.get(`${API_URL}/activity-logs/user/${userId}`)

//LOG ACTIVITY FOR CARD
export const getActivityCard = (cardId) => axios.get(`${API_URL}/activity-card/card/${cardId}`)

//'/api/activity-logs/user/:userId'


//CHAT ROOM
export const getAllCardChat = (cardId) => axios.get(`${API_URL}/cards/${cardId}/chats`);
export const createMessage =  (cardId, data) => axios.post(`${API_URL}/cards/${cardId}/chats`,data);
export const deleteMessage = (chatId) => axios.delete(`${API_URL}/chats/${chatId}`);
export const getTotalMessageInCard = (cardId) => axios.get(`${API_URL}/chats-total/cards/${cardId}`); 

//TOTAL NOTIFICATION UNREAD (NOTIFICTION CHAT + NOTIFICATION SYSTEM)
export const getUserTotalNotificationUnread = (userId) => axios.get(`${API_URL}/notifications/unread-count/${userId}`);

//MENAMPILKAN SEMUA NOTIFICATION CHAT DAN SYSTEM
export const getAllNotif = (userId) => axios.get(`${API_URL}/all-notif/${userId}`);

//NOTIFICATION
export const getNotificationForUser = (userId) => axios.get(`${API_URL}/notification-mention/${userId}`);
export const patchReadNotification = (id) => axios.patch(`${API_URL}/notification-read/${id}`);
export const deleteNotificationById = (id) => axios.delete(`${API_URL}/notifications/${id}`);
export const viewChatFromNotification = (chatId, userId) => axios.get(`${API_URL}/chat/${chatId}/user/${userId}`);
export const getPathToCardId = (chatId) => axios.get(`${API_URL}/chat/${chatId}/path`)

//SYSTEM NOTIFICATION
export const getSystemNotificationByUser = (userId) => axios.get(`${API_URL}/system-notification/user/${userId}`);
export const marksNotificationSystem = (id) => axios.patch(`${API_URL}/system-notification/${id}`);
export const deleteSystemNotification = (id) => axios.delete(`${API_URL}/system-notification/${id}`);
export const getPathToCard = (cardId) => axios.get(`${API_URL}/card/${cardId}/card-location`);