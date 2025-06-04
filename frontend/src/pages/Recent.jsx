import React from 'react'
import {    HiOutlineEllipsisHorizontal,
            HiOutlineHome,
            HiOutlineSlash, 
            HiOutlineXMark,
            HiLink,
            HiOutlineArrowTopRightOnSquare,
        } 
from 'react-icons/hi2'
import { RxDragHandleDots2 } from "react-icons/rx";
import BootstrapTooltip from '../components/Tooltip'
import '../style/pages/Recent.css'
import { useNavigate } from 'react-router-dom'

const Recent=()=> {
    //state
    const navigate = useNavigate();

    //FUNCTION
    //1. navigate to home
    const navigateToHome = () => {
        navigate(`/`)
    }

  return (
    <div className='recent-container'>
        <div className="recent-header">
            <div className="nav">
                <button onClick={navigateToHome}>
                    <HiOutlineHome className='nav-icon'/>
                    Home
                </button>
                <HiOutlineSlash/>
                <button>
                    Recents
                </button>
            </div>
            <div className="recent-action">
                <BootstrapTooltip title='More seting' placement='bottom'>
                    <HiOutlineEllipsisHorizontal className='recent-icon'/>
                </BootstrapTooltip>
                <BootstrapTooltip title='Close recent' placement='bottom'>
                    <HiOutlineXMark className='recent-icon' onClick={navigateToHome}/>
                </BootstrapTooltip> 
            </div>
        </div>
        <div className="recent-body">
            <div className="sec-body">
              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className='sec-item'>
                <div className="item-left">
                  <RxDragHandleDots2 size={17}/>
                  <p>Operational workspace</p>
                </div>
                <div className="item-right">
                  <BootstrapTooltip title='Open in new tab' placement='top'>
                    <HiOutlineArrowTopRightOnSquare className='item-icon'/>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Get link' placement='top'>
                    <HiLink className='item-icon'/>
                  </BootstrapTooltip>
                </div>
              </div>
            </div>
        </div>

    </div>
  )
}

export default Recent