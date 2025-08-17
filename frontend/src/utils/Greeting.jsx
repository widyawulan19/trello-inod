import React from 'react';
import '../style/pages/Home.css'
import { FaMoon, FaSun } from "react-icons/fa6";
import { FaCloudSun } from "react-icons/fa";

const Greeting = () => {
  const currentHour = new Date().getHours();

  let greetingText = '';
  let greetingIcon = '';
  if (currentHour >= 5 && currentHour < 12) {
    greetingText = 'Good Morning!';
    greetingIcon = <FaSun/>;
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingText = 'Good Afternoon!';
    greetingIcon = <FaCloudSun/>;
  } else {
    greetingText = 'Good Evening!';
    // greetingIcon = '🌃';
    greetingIcon = <FaMoon/>;
  }

  const currentDate = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayName = daysOfWeek[currentDate.getDay()];
  const monthName = monthsOfYear[currentDate.getMonth()];
  const date = currentDate.getDate();
  const year = currentDate.getFullYear();

  return (
    <div className='greeting-container'>
      <h4>
        <span className="gradient-text">{greetingText}</span>{' '}
        <span className='greet-icon'>{greetingIcon}</span>
      </h4>
      {/* <p>🏠 Home</p> */}
      <p style={{marginTop:'0',marginBottom:'0', fontSize:'10px', padding:'0px', color:'white'}}>
        Today is {dayName}, {date} {monthName} {year} | Hope you have a great day!
      </p>
    </div>
  );
};

export default Greeting;
