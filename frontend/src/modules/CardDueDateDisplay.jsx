// components/DueDateDisplay.js
import React, { useEffect, useState } from 'react';
import { getAllDueDateByCardId } from '../services/ApiServices'
import { BsCalendar2CheckFill } from 'react-icons/bs';
import '../style/modules/CardDueDateDisplay.css'
import { HiOutlineCalendar } from 'react-icons/hi2';

const CardDueDateDisplay = ({ cardId }) => {
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (cardId) {
      getAllDueDateByCardId(cardId)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setDueDate(new Date(res.data[0].due_date)); // jika datanya array
          }
        })
        .catch((err) => {
          console.error('Failed to fetch due date:', err);
        });
    }
  }, [cardId]);

const getDueDateClass = (date) => {
  if (!date) return "";

  const now = new Date();
  const timeDiff = date.getTime() - now.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeDiff <= oneDay) {
    return "due-red"; // < 24 jam
  } else if (timeDiff <= 2 * oneDay) {
    return "due-orange"; // < 2 hari
  } else if (timeDiff <= 3 * oneDay) {
    return "due-blue"; // < 3 hari
  } else {
    return "due-normal"; // > 3 hari
  }
};

const getDueDateColor = (date) => {
  if (!date) return "#000"; // default

  const now = new Date();
  const timeDiff = date.getTime() - now.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeDiff <= oneDay) {
    return "#e63946"; // red
  } else if (timeDiff <= 2 * oneDay) {
    return "#ff9f1c"; // orange
  } else if (timeDiff <= 3 * oneDay) {
    return "#3a86ff"; // blue
  } else {
    return "#2a9d8f"; // green / normal
  }
};

if (!dueDate) return <p></p>;

return (
  <div className={`due-date-badge ${getDueDateClass(dueDate)}`}>
    <HiOutlineCalendar
      size={10}
      style={{
        color: getDueDateColor(dueDate),
        marginRight: '5px',
      }}
    />
    {dueDate.toLocaleDateString('en-GB')} |{' '}
    {dueDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}
  </div>
);

};

export default CardDueDateDisplay;
