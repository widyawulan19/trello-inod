import {
    HiOutlineSquaresPlus,
    HiOutlineUsers,
    HiOutlineCircleStack,
    HiOutlineChartBar,
    HiOutlineArchiveBoxArrowDown,
    HiOutlineCog8Tooth,
    HiAdjustmentsHorizontal,
    HiOutlineTrash,
    HiOutlineCalendarDateRange
} from "react-icons/hi2";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdDeveloperMode } from "react-icons/md";

export const pageTitles = [
    {
        path: "/layout/marketing-design",
        title: "Marketing Design",
        icon: <HiOutlineChartBar />,
    },
    {
        path: "/layout/data-marketing",
        title: "Data Marketing",
        icon: <HiOutlineCircleStack />,
    },
    {
        path: "/layout/data-member",
        title: "Inod Member",
        icon: <HiOutlineUsers />,
    },
    {
        path: "/layout/new-employee-schedules",
        title: "Member Schedule",
        icon: <HiOutlineCalendarDateRange />,
    },
    {
        path: "/layout/workspaces",
        title: "Workspace Pages",
        icon: <HiOutlineSquaresPlus />,
    },
    {
        path: "/layout/archive-data",
        title: "Archive Data",
        icon: <HiOutlineArchiveBoxArrowDown />,
    },
    {
        path: "/layout/activity",
        title: "User Activity",
        icon: <HiOutlineCog8Tooth />,
    },
    {
        path: "/layout/faq",
        title: "FAQ",
        icon: <HiAdjustmentsHorizontal />,
    },
    {
        path: "/layout/data-delete",
        title: "Trash",
        icon: <HiOutlineTrash />,
    },
    {
        path: "/layout/testing",
        title: "Testing Fitur",
        icon: <MdDeveloperMode />,
    },
    {
        path: "/layout",
        title: "Dashboard",
        icon: <LuLayoutDashboard />,
    },
];
