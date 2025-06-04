import React from 'react'

function NotificationIcon() {
  return (
   <div>
    <div style={{
        maxWidth: '60%',
        backgroundColor: '#f0f0f0',
        color: '#000',
        padding: '10px 15px',
        borderRadius: '15px',
        margin: '8px 0',
        alignSelf: 'flex-start',
        borderTopLeftRadius:'0px'
        // borderBottomLeftRadius: '0px'
    }}>
        Ini adalah pesan dari lawan bicara.
    </div>
    <div style={{
        maxWidth: '60%',
        backgroundColor: '#007aff',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '15px',
        margin: '8px 0',
        alignSelf: 'flex-end',
        borderBottomRightRadius: '0px'
    }}>
        Ini adalah pesan dari kamu.
    </div>

   </div>
  )
}

export default NotificationIcon