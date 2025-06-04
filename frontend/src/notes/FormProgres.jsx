import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const FormProgres =()=> {
    //STATE
    const navigate = useNavigate();
    const {cardId} = useParams();
    const [formData, setFormData] = useState({
        input_by:"",
        acc_by:"",
        buyer_name:"",
        code_order:"",
        jumlah_design:"",
        order_number:"",
        account:"",
        deadline:"",
        jumlah_revisi:"",
        order_type:"",
        offer_type:"",
        style:"",
        resolution:"",
        price_normal:"",
        price_discount:"",
        discount_percentage:"",
        required_files:"",
        project_type:"",
        reference:"",
        file_and_chat:"",
        detail_project:"",
    })

    //FUNCTION
  return (
    <div>FormProgres</div>
  )
}

export default FormProgres