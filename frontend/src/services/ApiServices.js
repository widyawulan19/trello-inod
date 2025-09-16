import axios from 'axios';

// const API_URL = 'https://trello-inod-production.up.railway.app/api';
const API_URL = process.env.REACT_APP_API_URL;
// LOGIN 
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);

// REGISTER 
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);

//RESET PASSWORD 
export const resetNewPassword = (data) => axios.post(`${API_URL}/auth/reset-password`, data);


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
export const getTotalFile = (cardId) => axios.get(`${API_URL}/uploaded-files/${cardId}/count`);

//SEARCH CARD BY 1 WORKSPACE
export const searchCards = (keyword, workspaceId) => axios.get(`${API_URL}/search`, { params: { keyword, workspaceId } });

//SEARCH CARD BY WORKSPACE USER
export const searchCardsByUser = (keyword, userId) => axios.get(`${API_URL}/search/global`, { params: { keyword, userId } });

// PERSONAL NOTES 
export const getAllPersonalNotes = () => axios.get(`${API_URL}/all-note`);
export const getNotesByUserId = (userId) => axios.get(`${API_URL}/personal-note/user/${userId}`);
export const getNoteByIdansUserId = (noteId, userId) => axios.get(`${API_URL}/personal-note/${noteId}/user/${userId}`)
export const createNote = (data) => axios.post(`${API_URL}/personal-note`, data);
export const updateNote = (noteId, data, userId) => axios.put(`${API_URL}/personal-note/${noteId}/user/${userId}`, data);
export const deleteNote = (noteId, userId) => axios.delete(`${API_URL}/personal-note/${noteId}/user/${userId}`)
export const updateIsiNote = (noteId, userId, data) => axios.put(`${API_URL}/personal-note/${noteId}/desc/${userId}`, data);
export const updateNameNote = (noteId, userId, data) => axios.put(`${API_URL}/personal-note/${noteId}/name/${userId}`, data)
export const updateNoteColor = (noteId, data) => axios.put(`${API_URL}/persona-note/${noteId}/bg-color`, data);

//NOTE COLORS
export const getAllColorNote = () => axios.get(`${API_URL}/note-colors`);
export const addNewColorNote = (data) => axios.post(`${API_URL}/note-colors`, data);

//PERSONAL AGENDA
export const createNewAgenda = (data) => axios.post(`${API_URL}/agenda`, data);
export const getAgendaUser = (userId) => axios.get(`${API_URL}/agenda-user/user/${userId}`);
export const getAgendaUserById = (agendaId, userId) => axios.get(`${API_URL}/agenda-user/${agendaId}/user/${userId}`);
export const updateAgendaUser = (agendaId, userId, data) => axios.put(`${API_URL}/agenda/${agendaId}/user/${userId}`, data);
export const deletAgendaUser = (agendaId, userId) => axios.delete(`${API_URL}/agenda-user/${agendaId}/user/${userId}`);
export const getUnfinishAgenda = (userId) => axios.get(`${API_URL}/unfinished-agendas/${userId}`);
export const getFinishedAgenda = (userId) => axios.get(`${API_URL}/finish-agendas/${userId}`);
export const updateAgenda = (agendaId, data) => axios.put(`${API_URL}/update-agenda-status/${agendaId}`, data);
export const updateAgendaByUser = (agendaId, userId, data) => axios.put(`${API_URL}/update-agenda-status/${agendaId}/user/${userId}`, data);
export const updateAgendaDescription = (agendaId, userId, description) => axios.put(`${API_URL}/agenda/${agendaId}/user/${userId}/description`, { description });
export const updateAgendaTitle = (agendaId, userId, title) => axios.put(`${API_URL}/agenda/${agendaId}/user/${userId}/title`, { title });


//STATUS AGENDA
export const getAllAgendaStatus = () => axios.get(`${API_URL}/agenda-status`)
export const getStatusById = (statusId) => axios.get(`${API_URL}/agenda-status/${statusId}`)
export const createNewStatus = (data) => axios.post(`${API_URL}/agenda-status`, data)
export const updateStatusAgenda = (statusId) => axios.put(`${API_URL}/agenda-status/${statusId}`)
export const deleteStatus = (statusId) => axios.delete(`${API_URL}/agenda-status/${statusId}`)




//WORKSPACE
export const getWorkspaces = () => axios.get(`${API_URL}/workspace`)
export const getWorkspaceById = (id) => axios.get(`${API_URL}/workspace/${id}`)
export const createWorkspace = (data) => axios.post(`${API_URL}/workspace`, data);
export const updateWorkspace = (id, data) => axios.put(`${API_URL}/workspace/${id}`, data)
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
export const updateUser = (userId, username, email, password) => axios.put(`${API_URL}/users/${userId}`, { username, email, password });
export const deleteUser = (userId) => axios.delete(`${API_URL}/users/${userId}`);
export const resetPassword = (userId, newPassword) => axios.post(`${API_URL}/users/${userId}/password-reset`, { newPassword });
export const getUserSettingData = (userId) => axios.get(`${API_URL}/users-setting/${userId}`);
export const updateUserSettingData = (userId, data) => axios.put(`${API_URL}/users-setting/${userId}`, data)

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
export const addPriorityToBoard = (boardId, priorityId) => axios.post(`${API_URL}/board-priority`, { board_id: boardId, priority_id: priorityId })
export const getBoardPriorities = (boardId) => axios.get(`${API_URL}/board-priority/${boardId}`)
export const getALlPriorities = () => axios.get(`${API_URL}/priority`)
export const deletePropertyFromBoard = (boardId, priorityId) => axios.delete(`${API_URL}/board-priority-remove`, { data: { board_id: boardId, priority_id: priorityId } })

//CARD PRIORITY
export const addPriorityToCard = (card_id, priority_id) => axios.post(`${API_URL}/card-priorities`, { card_id, priority_id })
export const getAllCardPriority = () => axios.get(`${API_URL}/card-priorities`)
export const getCardPriority = (cardId) => axios.get(`${API_URL}/card-priorities/${cardId}`)
export const deletePriorityFromCard = (card_id, priority_id) => axios.delete(`${API_URL}/card-priority`, { data: { card_id, priority_id } })

//LISTS
export const getAllLists = () => axios.get(`${API_URL}/lists`)
export const getListById = (listId) => axios.get(`${API_URL}/lists/${listId}`)
export const getListByBoard = (boardId) => axios.get(`${API_URL}/lists/board/${boardId}`)
export const createLists = (boardId, name) => axios.post(`${API_URL}/lists`, { board_id: boardId, name })
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
export const updateDescCard = (id, description) => axios.put(`${API_URL}/cards/${id}/desc`, { description })
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
export const saveCardDescriptions = (cardId, description) => axios.post(`${API_URL}/card-description`, { card_id: cardId, description: description });
export const getCardDescription = (cardId) => axios.get(`${API_URL}/card-description/${cardId}`)
export const updateCardDescription = (cardId, description) => axios.put(`${API_URL}/card-description/${cardId}`, description)
//NOTE
// periksa cover, karena jika satu button cover di buka dan menampilkan select cover pada cardid lainnya juga akan terbuka

//GABUNGAN CHECKLIST, CARD_CHECKLIST, CHECKLIST_ITEM
export const getChecklistsWithItemsByCardId = (cardId) => axios.get(`${API_URL}/checklists-with-items/${cardId}`)
export const createChecklist = (data) => axios.post(`${API_URL}/checklists-fix`, data)
export const updateChecklistName = (id, data) => axios.put(`${API_URL}/checklists-fix/${id}`, data)
export const deleteChecklist = (id) => axios.delete(`${API_URL}/checklists-fix/${id}`)
export const createChecklistItem = (data) => axios.post(`${API_URL}/checklists-fix-items`, data)
export const updateCheckItem = (id, data) => axios.put(`${API_URL}/checklists-fix-items/${id}/check`, data)
export const updateNameItem = (id, data) => axios.put(`${API_URL}/checklists-fix-items/${id}/name`, data)
export const deleteChecklistItem = (id) => axios.delete(`${API_URL}/checklists-fix-items/${id}`)

//CHECKLIST ITEM (TOTAL)
export const getTotalChecklistItemByCardId = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-total`)
export const getChecklistItemChecked = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-checked`)
export const getChecklistItemUnchecked = (cardId) => axios.get(`${API_URL}/${cardId}/checklist-unchecked`)

//LABELS
export const getLabelByCard = (cardId) => axios.get(`${API_URL}/cards/${cardId}/labels`)
export const getAllLabels = () => axios.get(`${API_URL}/labels`)
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
export const updateDataEmployee = (id, data) => axios.put(`${API_URL}/employees/${id}`, data)
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
export const updateEmployee = (id, data) => axios.put(`${API_URL}/employee/${id}`, data)
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
export const updateSchedule = (data) => axios.put(`${API_URL}/schedule`, data)

//NEW SCHEDULE EMPLOYEE 1
export const getAllEmployeeSchedule1 = () => axios.get(`${API_URL}/employee-schedule/view`);
export const getEmployeeScheduleByEmployeeId = (employeeId) => axios.get(`${API_URL}/employee-schedule/view/${employeeId}`);
export const createEmployeeSchedule = (data) => axios.post(`${API_URL}/employee-schedule`, data);
export const updateEmployeeSchedule = (employeeId, data) => axios.put(`${API_URL}/employee-schedule/${employeeId}`, data);
export const updateEmployeeShift1 = (employeeId, data) => axios.put(`${API_URL}/employee-schedule/${employeeId}/schedules`, data);
export const deleteEmployeeData1 = (employeeId) => axios.delete(`${API_URL}/employee-schedule/${employeeId}`);
export const updateShiftByEmployeeAndDay = (employeeId, dayId, data) => axios.put(`${API_URL}/employee-schedule/${employeeId}/day/${dayId}`, data)


//NEW EMPLOYEE SCHEDULE
export const getAllEmployeeSchedule = () => axios.get(`${API_URL}/schedules`);
export const getEmployeeByEmployeeId = (id) => axios.get(`${API_URL}/schedule-employee/${id}`)
export const getWeeklyEmployeeSchedule = () => axios.get(`${API_URL}/schedule-weekly`)

//DAYS
export const getDays = () => axios.get(`${API_URL}/all-days`)
export const getDaysEmployee = (employeeId) => axios.get(`${API_URL}/day-schedule-employee/${employeeId}`);

//SHIFT
export const getAllShift = () => axios.get(`${API_URL}/all-shift`)
export const updateEmployeeShift = (data) => axios.put(`${API_URL}/schedule-weekly`, data)

//USER SCHEDULE
export const createNewSchedule = (data) => axios.post(`${API_URL}/schedule`, data);
export const updateScheduleUser = (scheduleId, data) => axios.put(`${API_URL}/update-schedule/${scheduleId}`, data)
export const deleteSchedule = (scheduleId) => axios.delete(`${API_URL}/delete-schedule/${scheduleId}`);
export const getScheduleUser = (userId) => axios.get(`${API_URL}/user-schedule/${userId}`)

// DATA MARKETING 
export const getAllDataMarketing = () => axios.get(`${API_URL}/marketing`)
export const getCardIdMarketingByMarketingId = (id) => axios.get(`${API_URL}/get-card-id/${id}`)
export const getDataMarketingById = (id) => axios.get(`${API_URL}/marketing/${id}`)
export const updateDataMarketing = (id, data) => axios.put(`${API_URL}/marketing/${id}`, data)
export const deleteDataMarketing = (id) => axios.delete(`${API_URL}/marketing/${id}`)
export const addDataMarketing = (data) => axios.post(`${API_URL}/marketing`, data)
export const createCardFromMarketing = (listId, marketingId) => axios.put(`${API_URL}/create-card-marketing/${listId}/${marketingId}`)
export const checkCardIdNullOrNot = (id) => axios.get(`${API_URL}/check-card-id/${id}`)
export const getDataMarketingWithCardId = () => axios.get(`${API_URL}/data-marketing-cardId`)
export const getDataMarketingWithCardIdNull = () => axios.get(`${API_URL}/data-marketing-cardId-null`)
export const getDataMarketingAccepted = () => axios.get(`${API_URL}/data-marketing/accepted`)
export const getDataMarketingRejected = () => axios.get(`${API_URL}/data-marketing/rejected`)
// export const getDataMarketingAccepted = () => API.get("/data-marketing/accepted");
// export const getDataMarketingRejected = () => API.get("/data-marketing/rejected");

export const archiveDataMarketing = (id) => axios.post(`${API_URL}/archive-data-marketing/${id}`);
export const getTodayReportMarketing = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing/reports/today`);
    return response.data;
  } catch (error) {
    console.error('gagal mengambil data report hari ini', error);
    return [];
  }
};

export const getTenDaysMarketing = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing/reports`);
    return response.data;
  } catch (error) {
    console.error('gagal mengambil data report', error);
    return [];
  }
}

// excel 
// export const exportDataMarketingToSheets = async () => axios.post(`${API_URL}/export-to-sheet`)
export const exportDataMarketingToSheets = async (marketingData) => {
  try {
    const response = await axios.post(`${API_URL}/export-to-sheet`, { marketingData });
    return response.data;
  } catch (error) {
    console.error("❌ Gagal kirim ke Sheets:", error);
    throw error; // supaya bisa ditangani di UI
  }
};


export const getAllDataMarketingJoined = () => axios.get(`${API_URL}/data-marketing/joined`)
export const getAllDataMarketingJoinedById = (id) => axios.get(`${API_URL}/data-marketing/joined/${id}`)
export const updateDataMarketingJoined = (id, data) => axios.put(`${API_URL}/data-marketing/joined/${id}`, data)

//DATA MARKETING DESIGN
export const getAllDataMarketingDesign = () => axios.get(`${API_URL}/marketing-design`)
export const getCardIdMarketingDesignByMarketingId = (id) => axios.get(`${API_URL}/card-id-design/${id}`)
export const getDataMarketingDesignById = (id) => axios.get(`${API_URL}/marketing-design/${id}`)
export const createDataMarketingDesign = (data) => axios.post(`${API_URL}/marketing-design`, data)
export const updateDataMarketingDesign = (id, data) => axios.put(`${API_URL}/marketing-design/${id}`, data)
export const deleteDataMarketingDesign = (id) => axios.delete(`${API_URL}/marketing-design/${id}`)
export const checkCardIdNullOrNotForDesign = (id) => axios.get(`${API_URL}/check-card-id-design/${id}`)
export const createCardFromMarketingDesign = (listId, marketingDesignId) => axios.put(`${API_URL}/create-card-marketing-design/${listId}/${marketingDesignId}`)
export const getDataWhereCardIdNotNull = () => axios.get(`${API_URL}/marketing-designs/not-null`);
export const getDataWhereCardIdIsNull = () => axios.get(`${API_URL}/marketing-designs/null`);
export const getDataMarketingDesignNotAccept = () => axios.get(`${API_URL}/marketing-design-not-accepted`)
export const getDataMarketingDesignAccept = () => axios.get(`${API_URL}/marketing-design-accepted`);
export const archiveDataMarektingDesign = (id) => axios.post(`${API_URL}/archive-data-marketing-design/${id}`);

// export const addMarketingDesignJoined = () => axios.post(`${API_URL}/marketing-design/joined`)
export const addMarketingDesignJoined = (data) =>
  axios.post(`${API_URL}/marketing-design/joined`, data);


// ✅ Get all marketing_design (joined)
export const getAllMarketingDesignJoined = () =>
  axios.get(`${API_URL}/marketing-design/joined`);

// ✅ Get marketing_design by ID (joined)
export const getMarketingDesignById = (id) =>
  axios.get(`${API_URL}/marketing-design/joined/${id}`);

// ✅ Update marketing_design by ID (joined result dikembalikan)
export const updateMarketingDesign = (id, data) =>
  axios.put(`${API_URL}/marketing-design/joined/${id}`, data);

// ✅ Get laporan hari ini
export const getMarketingDesignReportToday = () =>
  axios.get(`${API_URL}/marketing-design/reports/today`);

// ✅ Get laporan per 10 hari
// export const getMarketingDesignReports = () =>
//   axios.get(`${API_URL}/marketing-design/reports`);

export const getMarketingDesignReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing-design/reports`);
    return response.data;
  } catch (error) {
    console.error('gagal mengambil data report', error);
    return [];
  }
}


// ✅ Ambil laporan marketing hari ini
export const getTodayMarketingDesign = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing-design/reports/today`);
    return response.data;
  } catch (error) {
    console.error("❌ Gagal ambil laporan hari ini:", error);
    return [];
  }
};

// ✅ Ambil laporan marketing per 10 hari (semua bulan)
export const getTenDaysMarketingDesign = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing-design/reports`);
    return response.data;
  } catch (error) {
    console.error("❌ Gagal ambil laporan 10 hari:", error);
    return [];
  }
};

//menampilkan semua detai data (marketing, design) dalm card
export const getAllDataMarketingCard = (cardId) => axios.get(`${API_URL}/cards/${cardId}/marketing-detail`);

//GET WORKSPACE ID & BOARD ID FORM LISTS&CARD ID
export const getWorkspaceIdAndBoardId = (data) => axios.post(`${API_URL}/get-workspaceid-boardid`, data)

//membuat card dari data marketing (design, musik)

export const createCardFromDataMarketing = (listId, marketingDesignId) => axios.put(`${API_URL}/create-card-marketing/${listId}/${marketingDesignId}`)

//ARCHIVE UNIVERSAL
export const archiveData = (entity, id) => axios.post(`${API_URL}/archive/${entity}/${id}`);
export const getAllDataArchive = () => axios.get(`${API_URL}/archive-data`);
export const deleteArchiveDataUniversalById = (id) => axios.delete(`${API_URL}/archive-data/${id}`);
export const restoreDataArchive = (entity, id) => axios.post(`${API_URL}/restore/${entity}/${id}`)

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
export const getWorkspaceSummaryByWorkspaceId = (userId, workspaceId) => axios.get(`${API_URL}/workspaces/${userId}/summary/${workspaceId}`)

//PROFILE
export const getAllProfile = () => axios.get(`${API_URL}/profile`)
export const getProfileById = (id) => axios.get(`${API_URL}/profile/${id}`)

//USER PROFILE
export const getProfileByUserId = (userId) => axios.get(`${API_URL}/profile-user/${userId}`)
export const addProfileToUser = (data) => axios.post(`${API_URL}/profile-user`, data)
export const deleteUserProfile = (userId) => axios.delete(`${API_URL}/profile-user/${userId}`)
export const updateProfileUser = (userId, data) => axios.put(`${API_URL}/profile-user/${userId}`, data)


//LOG ACTIVITY FOR USER
export const getActivityForUserId = (userId) => axios.get(`${API_URL}/user-log/${userId}`)

//LOG ACTIVITY FOR CARD
export const getActivityCard = (cardId) => axios.get(`${API_URL}/activity-card/card/${cardId}`)

//'/api/activity-logs/user/:userId'


//CHAT ROOM
export const getAllCardChat = (cardId) => axios.get(`${API_URL}/cards/${cardId}/chats`);
export const createMessage = (cardId, data) => axios.post(`${API_URL}/cards/${cardId}/chats`, data);
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
export const getSystemNotificationByUser = (userId) => axios.get(`${API_URL}/system-notification/user-notif/${userId}`);
export const marksNotificationSystem = (id) => axios.patch(`${API_URL}/system-notification/${id}`);
export const deleteSystemNotification = (id) => axios.delete(`${API_URL}/system-notification/${id}`);
export const getPathToCard = (cardId) => axios.get(`${API_URL}/card/${cardId}/card-location`);


// =============================
// MARKETING USER
// =============================

// ✅ Ambil semua marketing users
export const getAllMarketingUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketing-users`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil marketing users:", err);
    return [];
  }
};

// ✅ Ambil 1 user by ID
export const getMarketingUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/marketing-users/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil marketing user:", err);
    throw err;
  }
};

// ✅ Tambah user baru
export const addMarketingUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/marketing-users`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah marketing user:", err);
    throw err;
  }
};

// ✅ Update user
export const updateMarketingUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/marketing-users/${id}`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update marketing user:", err);
    throw err;
  }
};

// ✅ Hapus user
export const deleteMarketingUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/marketing-users/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus marketing user:", err);
    throw err;
  }
};

// =============================
// ACCOUNT MUSIC
// =============================

export const getAllAccountsMusic = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts-music`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil accounts:", err);
    return [];
  }
};

export const getAccountMusicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/accounts-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil account:", err);
    throw err;
  }
};

export const addAccountMusic = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/accounts-music`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah account:", err);
    throw err;
  }
};

export const updateAccountMusic = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/accounts-music/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update account:", err);
    throw err;
  }
};

export const deleteAccountMusic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/accounts-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus account:", err);
    throw err;
  }
};

// =============================
// PROJECT TYPE MUSIC
// =============================

export const getAllProjectTypesMusic = async () => {
  try {
    const response = await axios.get(`${API_URL}/project-types-music`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil project types:", err);
    return [];
  }
};

export const getProjectTypeMusicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/project-types-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil project type:", err);
    throw err;
  }
};

export const addProjectTypeMusic = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/project-types-music`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah project type:", err);
    throw err;
  }
};

export const updateProjectTypeMusic = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/project-types-music/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update project type:", err);
    throw err;
  }
};

export const deleteProjectTypeMusic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/project-types-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus project type:", err);
    throw err;
  }
};

// =============================
// OFFER TYPE MUSIC
// =============================

export const getAllOfferTypesMusic = async () => {
  try {
    const response = await axios.get(`${API_URL}/offer-types-music`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil offer types:", err);
    return [];
  }
};

export const getOfferTypeMusicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/offer-types-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil offer type:", err);
    throw err;
  }
};

export const addOfferTypeMusic = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/offer-types-music`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah offer type:", err);
    throw err;
  }
};

export const updateOfferTypeMusic = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/offer-types-music/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update offer type:", err);
    throw err;
  }
};

export const deleteOfferTypeMusic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/offer-types-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus offer type:", err);
    throw err;
  }
};

// =============================
// TRACK TYPE MUSIC
// =============================

export const getAllTrackTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/track-types`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil track types:", err);
    return [];
  }
};

export const getTrackTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/track-types/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil track type:", err);
    throw err;
  }
};

export const addTrackType = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/track-types`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah track type:", err);
    throw err;
  }
};

export const updateTrackType = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/track-types/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update track type:", err);
    throw err;
  }
};

export const deleteTrackType = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/track-types/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus track type:", err);
    throw err;
  }
};

// =============================
// GENRE MUSIC
// =============================

export const getAllGenresMusic = async () => {
  try {
    const response = await axios.get(`${API_URL}/genre-music`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil genre:", err);
    return [];
  }
};

export const getGenreMusicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/genre-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil genre:", err);
    throw err;
  }
};

export const addGenreMusic = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/genre-music`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah genre:", err);
    throw err;
  }
};

export const updateGenreMusic = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/genre-music/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update genre:", err);
    throw err;
  }
};

export const deleteGenreMusic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/genre-music/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus genre:", err);
    throw err;
  }
};

// =============================
// ORDER TYPE MUSIC
// =============================

export const getAllOrderTypesMusic = async () => {
  try {
    const response = await axios.get(`${API_URL}/music-order-types`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil order types:", err);
    return [];
  }
};

export const getOrderTypeMusicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/music-order-types/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal ambil order type:", err);
    throw err;
  }
};

export const addOrderTypeMusic = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/music-order-types`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal tambah order type:", err);
    throw err;
  }
};

export const updateOrderTypeMusic = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/music-order-types/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("❌ Gagal update order type:", err);
    throw err;
  }
};

export const deleteOrderTypeMusic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/music-order-types/${id}`);
    return response.data;
  } catch (err) {
    console.error("❌ Gagal hapus order type:", err);
    throw err;
  }
};


// KEPALA DIVISI 
export const getAllKepalaDivisi = () => axios.get(`${API_URL}/kepala-divisi`);
export const addKepalaDivisi = (data) => axios.post(`${API_URL}/kepala-divisi`, data);
export const getKepalaDivisiById = (id) => axios.get(`${API_URL}/kepala-divisi/${id}`);
export const updateKepalaDivisi = (id, data) => axios.put(`${API_URL}/kepala-divisi/${id}`, data);
export const deleteKepalaDivisi = (id) => axios.delete(`${API_URL}/kepala-divisi/${id}`);


// =======================
// Kupon Diskon
// =======================
export const getAllKuponDiskon = async () => {
  const res = await axios.get(`${API_URL}/kupon-diskon`);
  return res.data;
};

export const getKuponDiskonById = async (id) => {
  const res = await axios.get(`${API_URL}/kupon-diskon/${id}`);
  return res.data;
};

export const addKuponDiskon = async (data) => {
  const res = await axios.post(`${API_URL}/kupon-diskon`, data);
  return res.data;
};

export const updateKuponDiskon = async (id, data) => {
  const res = await axios.put(`${API_URL}/kupon-diskon/${id}`, data);
  return res.data;
};

export const deleteKuponDiskon = async (id) => {
  const res = await axios.delete(`${API_URL}/kupon-diskon/${id}`);
  return res.data;
};


// =======================
// Accept Status
// =======================
export const getAllAcceptStatus = async () => {
  const res = await axios.get(`${API_URL}/accept-status`);
  return res.data;
};

export const getAcceptStatusById = async (id) => {
  const res = await axios.get(`${API_URL}/accept-status/${id}`);
  return res.data;
};

export const addAcceptStatus = async (data) => {
  const res = await axios.post(`${API_URL}/accept-status`, data);
  return res.data;
};

export const updateAcceptStatus = async (id, data) => {
  const res = await axios.put(`${API_URL}/accept-status/${id}`, data);
  return res.data;
};

export const deleteAcceptStatus = async (id) => {
  const res = await axios.delete(`${API_URL}/accept-status/${id}`);
  return res.data;
};

// MARKETING DESIGN USER 
export const getAllMarketingDesainUsers = () =>
  axios.get(`${API_URL}/marketing-desain-users`);

export const getMarketingDesainUserById = (id) =>
  axios.get(`${API_URL}/marketing-desain-users/${id}`);

export const createMarketingDesainUser = (data) =>
  axios.post(`${API_URL}/marketing-desain-users`, data);

export const updateMarketingDesainUser = (id, data) =>
  axios.put(`${API_URL}/marketing-desain-users/${id}`, data);

export const deleteMarketingDesainUser = (id) =>
  axios.delete(`${API_URL}/marketing-desain-users/${id}`);

// ACCOUNT DESIGN 
export const getAllAccountDesign = () =>
  axios.get(`${API_URL}/account-design`);

export const getAccountDesignById = (id) =>
  axios.get(`${API_URL}/account-design/${id}`);

export const createAccountDesign = async (data) => {
  const res = await axios.post(`${API_URL}/account-design`, data);
  return res.data; // ✅ langsung isi account baru
};


export const updateAccountDesign = (id, data) =>
  axios.put(`${API_URL}/account-design/${id}`, data);

export const deleteAccountDesign = (id) =>
  axios.delete(`${API_URL}/account-design/${id}`);


// OFFER TYPE DESIGN
export const getAllOfferTypesDesign = () =>
  axios.get(`${API_URL}/offer-type-design`);

export const getOfferTypeDesignById = (id) =>
  axios.get(`${API_URL}/offer-type-design/${id}`);

export const addOfferTypeDesign = (data) =>
  axios.post(`${API_URL}/offer-type-design`, data);

export const updateOfferTypeDesign = (id, offerType) =>
  axios.put(`${API_URL}/offer-type-design/${id}`, { offer_name: offerType });

export const deleteOfferTypeDesign = (id) =>
  axios.delete(`${API_URL}/offer-type-design/${id}`);


// PROJECT TYPE DESIGN
export const getAllProjectTypesDesign = () =>
  axios.get(`${API_URL}/project-type-design`);

export const getProjectTypeDesignById = (id) =>
  axios.get(`${API_URL}/project-type-design/${id}`);

export const addProjectTypeDesign = (data) =>
  axios.post(`${API_URL}/project-type-design`, data);

export const updateProjectTypeDesign = (id, projectType) =>
  axios.put(`${API_URL}/project-type-design/${id}`, { project_name: projectType });

export const deleteProjectTypeDesign = (id) =>
  axios.delete(`${API_URL}/project-type-design/${id}`);


// STYLE DESIGN
export const getAllStyleDesign = () =>
  axios.get(`${API_URL}/style-design`);

export const getStyleDesignById = (id) =>
  axios.get(`${API_URL}/style-design/${id}`);

export const addStyleDesign = (data) =>
  axios.post(`${API_URL}/style-design`, data);

export const updateStyleDesign = (id, data) =>
  axios.put(`${API_URL}/style-design/${id}`, data);

export const deleteStyleDesign = (id) =>
  axios.delete(`${API_URL}/style-design/${id}`);


// STATUS PROJECT DESIGN
export const getAllStatusProjectDesign = () =>
  axios.get(`${API_URL}/status-project-design`);

export const getStatusProjectDesignById = (id) =>
  axios.get(`${API_URL}/status-project-design/${id}`);

export const addStatusProjectDesign = (data) =>
  axios.post(`${API_URL}/status-project-design`, data);

export const updateStatusProjectDesign = (id, statusName) =>
  axios.put(`${API_URL}/status-project-design/${id}`, { status_name: statusName });

export const deleteStatusProjectDesign = (id) =>
  axios.delete(`${API_URL}/status-project-design/${id}`);


// KEPALA DIVISI DESIGN 

// Get all
export const getAllKepalaDivisiDesign = () =>
  axios.get(`${API_URL}/kepala-divisi-design`);

// Get by ID
export const getKepalaDivisiDesignById = (id) =>
  axios.get(`${API_URL}/kepala-divisi-design/${id}`);

// Add
export const addKepalaDivisiDesign = (data) =>
  axios.post(`${API_URL}/kepala-divisi-design`, data);

// Update
export const updateKepalaDivisiDesign = (id, data) =>
  axios.put(`${API_URL}/kepala-divisi-design/${id}`, data);

// Delete
export const deleteKepalaDivisiDesign = (id) =>
  axios.delete(`${API_URL}/kepala-divisi-design/${id}`);


// ORDER DESIGN 

// ✅ Get all
export const getAllDesignOrderType = () =>
  axios.get(`${API_URL}/design-order-type`);

// ✅ Get by ID
export const getDesignOrderTypeById = (id) =>
  axios.get(`${API_URL}/design-order-type/${id}`);

// ✅ Create new
export const addDesignOrderType = (data) =>
  axios.post(`${API_URL}/design-order-type`, data);

// ✅ Update
export const updateDesignOrderType = (id, data) =>
  axios.put(`${API_URL}/design-order-type/${id}`, data);

// ✅ Delete
export const deleteDesignOrderType = (id) =>
  axios.delete(`${API_URL}/design-order-type/${id}`);