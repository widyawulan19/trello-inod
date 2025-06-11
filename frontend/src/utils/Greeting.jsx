import React from 'react';
import '../style/pages/Home.css'

const Greeting = () => {
  const currentHour = new Date().getHours();

  let greetingText = '';
  let greetingIcon = '';
  if (currentHour >= 5 && currentHour < 12) {
    greetingText = 'Good Morning!';
    greetingIcon = '🌞';
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingText = 'Good Afternoon!';
    greetingIcon = '🌤️';
  } else {
    greetingText = 'Good Evening!';
    greetingIcon = '🌃';
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
    <div style={{ textAlign: 'left',padding:'0px 10px',marginTop:'0px' , fontSize: '20px' }}>
      <h4 style={{margin:'0px', padding:'0px'}}>
        <span className="gradient-text">{greetingText}</span>{' '}
        <span>{greetingIcon}</span>
      </h4>
      <p style={{marginTop:'0',marginBottom:'0', fontSize:'10px', padding:'0px'}}>
        Today is {dayName}, {date} {monthName} {year} | Hope you have a great day!
      </p>
    </div>
  );
};

export default Greeting;
