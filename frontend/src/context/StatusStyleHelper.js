import {
    HiArrowUturnLeft,
    HiCheckCircle,
    HiChevronDown,
    HiMiniEye,
    HiMiniXCircle
} from 'react-icons/hi2';

/* ================= ICON MAP ================= */
export const ICON_STATUS = {
    Accepted: <HiCheckCircle />,
    Hold: <HiMiniEye />,
    Cancle: <HiMiniXCircle />,
    'On Progress': <HiChevronDown />,
    Revisi: <HiArrowUturnLeft />,
    'One Hit': <HiCheckCircle />,
    'Pindah Producer': <HiArrowUturnLeft />,
    'Revisi in chat on progress': <HiMiniEye />,
    'Revisi in chat accept': <HiCheckCircle />,
    FINISH: <HiCheckCircle />
};

/* ================= STATUS → CLASS MAP ================= */
export const STATUS_CLASS_MAP = {
    Accepted: 'success',
    'One Hit': 'success',
    FINISH: 'success',

    Hold: 'warning',
    Revisi: 'warning',

    Cancle: 'danger',

    'On Progress': 'info',

    // status netral / operasional
    'Pindah Producer': 'success',
    'Revisi in chat on progress': 'neutral',
    'Revisi in chat accept': 'neutral'
};

/* ================= HELPER ================= */
export const getStatusClass = (statusName) => {
    return STATUS_CLASS_MAP[statusName] || 'neutral';
};

const hexToRgb = (hex) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
};

export const getStatusColorStyle = (accentColor) => {
    if (!accentColor) return {};

    const { r, g, b } = hexToRgb(accentColor);

    return {
        '--status-r': r,
        '--status-g': g,
        '--status-b': b
    };
};



