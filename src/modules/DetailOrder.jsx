import React, { useEffect, useState } from 'react'
import { getAllDataMarketingCard } from '../services/ApiServices';
import '../style/modules/DetailOrder.css'
import { SiAffinitydesigner } from "react-icons/si";
import { LuDot } from "react-icons/lu";
import { HiUser } from 'react-icons/hi2';

const DetailOrder=({cardId})=> {
    //STATE
    const [detailOrder,setDetailOrder] = useState([])

    //DEBUG
    console.log('File detail order menerima cardId:', cardId);

    //FUNCTION
    const getOrderDetail = async (cardId) => {
    try {
        const response = await getAllDataMarketingCard(cardId);
        setDetailOrder(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
        console.warn('⚠️ Tidak ada data marketing untuk card ini:', cardId);
        // Jangan update state, biarkan tetap kosong
        } else {
        console.error('❌ Gagal mengambil data marketing:', error);
        }
    }
    };


    useEffect(()=>{
        getOrderDetail(cardId)
    },[cardId]);

  return (
    <div className='detail-order-container'>
        {detailOrder?.map((item,index)=>(
            <div key={index}>
                {item.type === 'design' && (
                    <div className='design-container'>
                        <div className="design-header">
                            <SiAffinitydesigner className='dh-icon' size={30}/>
                            <div className="dh-title">
                                <h4>{item.code_order}</h4>
                                <p>
                                    Order {item.order_number} <LuDot/> Input by <strong style={{marginLeft:'3px'}}>{item.input_by}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="design-body">
                            <div className="detail-client">
                                <h4>CLIENT DETAILS</h4>
                                <div className='box-detail'>
                                    <div className="box-title">
                                        <p><HiUser/>Buyer :</p>
                                    </div>
                                    <div className="box-conten">
                                        <p>{item.buyer_name}</p>
                                    </div>

                                </div>
                            </div>
                            <div className="project-info">

                            </div>
                            <div className="pricing">

                            </div>
                        </div>
                    </div>
                )}
            </div>
        ))}
    </div>
  )
}

export default DetailOrder