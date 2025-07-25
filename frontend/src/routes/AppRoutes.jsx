import React from 'react'
import { Routes, Route} from 'react-router-dom';
import Home from '../pages/Home';
import Recent from '../pages/Recent';
import NewWorkspace from '../pages/NewWorkspace';
import WorkspacePage from '../pages/WorkspacePage';
import BoardList from '../pages/BoardList';
import Card from '../pages/Card';
import CardDetail from '../pages/CardDetail';
import Testing from '../pages/Testing';
import DataEmployee from '../pages/DataEmployee';
import DataMember from '../pages/DataMember';
import DataMarketing from '../pages/DataMarketing';
import ViewDataMarketing from '../pages/ViewDataMarketing';
import EditMarketingForm from '../pages/EditMarketingForm';
import FormDataMarketing from '../pages/FormDataMarketing';
// import MarketingDesign from '../pages/marketing/MarketingDesign';
import CoverCard from '../modules/CoverCard';
import CoverSelect from '../UI/CoverSelect';
import MarketingDesign from '../pages/MarketingDesign';
import Setting from '../pages/Setting';
import Archives from '../pages/Archives';
import Profile from '../pages/Profile';
import ActivityPage from '../pages/ActivityPage';
import ChatUi from '../fitur/ChatUi';
import AcceptDataDesign from '../pages/AcceptDataDesign';
import ExampleDataMarketingDesign from '../pages/ExampleDataMarketingDesign';
import EmployeeData from '../pages/EmployeeData';
import LayoutTest from '../pages/LayoutTest';
import NewCardDetail from '../pages/NewCardDetail';
import TextEditor from '../modules/TextEditor';
import FullNewCalendar from '../fitur/FullNewCalendar';
import ExampleTailwind from '../pages/ExampleTailwind';
import EmployeeSchedule from '../modules/EmployeeSchedule';
import NotificationIcon from '../UI/NotificationIcon';
import ArchiveUniversal from '../pages/ArchiveUniversal';

const AppRoutes=()=> {
  return (
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/recent' element={<Recent/>}/>
        <Route path='/workspaces' element={<NewWorkspace/>}/>
        <Route path='/workspaces/:workspaceId' element={<WorkspacePage/>}/>
        <Route path='/workspaces/:workspaceId/board/:boardId' element={<BoardList/>}/>
        <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId' element={<Card/>}/>
        {/* <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId/cards/:cardId' element={<CardDetail/>}/> */}
        <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId/cards/:cardId' element={<NewCardDetail/>}/>
        <Route path='/testing' element={<Testing/>}/>
        <Route path='/data-employee' element={<DataEmployee/>}/>
        <Route path='/data-member' element={<DataMember/>}/>
        <Route path='/data-marketing' element={<DataMarketing/>}/>
        <Route path='/data-marketing/:marketingId' element={<ViewDataMarketing/>}/>
        <Route path='/edit-data-marketing/:marketingId' element={<EditMarketingForm/>}/>
        <Route path='/form-data-marketing/:marketingId' element={<FormDataMarketing/>}/>
        {/* <Route path='/marketing-design' element={<MarketingDesign/>}/> */}
        <Route path='/marketing-design' element={<MarketingDesign/>}/>
        <Route path='/cover-card' element={<CoverCard/>}/>
        <Route path='/cover-select' element={<CoverSelect/>}/>
        {/* TYR  */}
        <Route path='/text-editor' element={<TextEditor/>}/>
        <Route path='/setting' element={<Setting/>}/>
        <Route path='/archive' element={<Archives/>}/>
        <Route path='/archive-data' element={<ArchiveUniversal/>}/>
        <Route path='/user-profile' element={<Profile/>}/>
        <Route path='/activity' element={<ActivityPage/>}/>
        <Route path='/chat' element={<ChatUi/>}/>
        <Route path='/data-accept' element={<AcceptDataDesign/>}/>
        <Route path='/example-data' element={<ExampleDataMarketingDesign/>}/>
        <Route path='/employee-data' element={<EmployeeData/>}/>
        <Route path='/room-test' element={<LayoutTest/>}/>
        <Route path='/calendar' element={<FullNewCalendar/>}/>
        <Route path='/example-css' element={<ExampleTailwind/>}/>
        <Route path='/employee-schedule' element={<EmployeeSchedule/>}/>
        <Route path='/notif-icon' element={<NotificationIcon/>}/>
    </Routes>
  )
}

export default AppRoutes