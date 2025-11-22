import React, { useState } from 'react'
import '../style/pages/MasterDataMusik.css'
import { HiOutlineSearch } from 'react-icons/hi'

function MasterDataMusik() {
  const [activeData, setActiveData] = useState('input');

  const renderDataMaster = () =>{
    switch (activeData){
      case 'input':
        return <div className="fade">Marketing User</div>;
      case 'kadiv':
        return <div className="fade">Kepala Divisi</div>;
      case 'status':
        return <div className="fade">Status Project</div>;
      case 'account':
        return <div className="fade">Account Name</div>;
      case 'ot':
        return <div className="fade">Order Type</div>;
      case 'of':
        return <div className="fade">Offer Type</div>;
      case 'jt':
        return <div className="fade">Jenis Track</div>;
      case 'genre':
        return <div className="fade">Genre Music</div>;
      case 'pt':
        return <div className="fade">Project Type</div>;
      case 'kupon':
        return <div className="fade">Jenis Kupon</div>;
    }
  };



  return (
    <div className='master-page'>
        <div className="mp-sidebar">
          <div className="mp-title">
            <h4>Data Master</h4>
            <div className="mp-search">
              <HiOutlineSearch className='mps-icon'/>
              <input 
                type="search" 
                placeholder='Search '
              />
            </div>
            <div className="main-sidebar">
              <button 
                className={activeData === 'input' ? 'active':''}
                onClick={()=> setActiveData('input')}
              >
                Marketing User
              </button>

              <button 
                className={activeData === 'kadiv' ? 'active':''}
                onClick={()=> setActiveData('kadiv')}
              >
                Kepala Divisi
              </button>

              <button 
                className={activeData === 'status' ? 'active':''}
                onClick={()=> setActiveData('status')}
              >
                Status Project
              </button>

              <button 
                className={activeData === 'account' ? 'active':''}
                onClick={()=> setActiveData('account')}
              >
                Account Name
              </button>

              <button 
                className={activeData === 'ot' ? 'active':''}
                onClick={()=> setActiveData('ot')}
              >
                Order Type
              </button>

              <button 
                className={activeData === 'of' ? 'active':''}
                onClick={()=> setActiveData('of')}
              >
                Offer Type
              </button>

              <button 
                className={activeData === 'jt' ? 'active':''}
                onClick={()=> setActiveData('jt')}
              >
                Jenis Track
              </button>

              <button 
                className={activeData === 'genre' ? 'active':''}
                onClick={()=> setActiveData('genre')}
              >
                Genre Music
              </button>

              <button 
                className={activeData === 'pt' ? 'active':''}
                onClick={()=> setActiveData('pt')}
              >
                Project Type
              </button>

              <button 
                className={activeData === 'kupon' ? 'active':''}
                onClick={()=> setActiveData('kupon')}
              >
                Jenis Kupon
              </button>
            </div>

          </div>

        </div>
        <div className="mp-body">
            <div className="master-name">
              {renderDataMaster()}
            </div>
            <div className="master-data">
                
            </div>
        </div>
    </div>
  )
}

export default MasterDataMusik