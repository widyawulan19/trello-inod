import React, { useEffect, useState } from 'react'
import { getEmployee } from '../services/ApiServices';

const EmployeeData=()=> {
    //STATE
    const [dataEmployee, setDataEmployee] = useState([]);
    const [filterDataEmployee, setFilterDataEmployee] = useState([]);

    //FUNCTION
    //1. fetch all data employee
    const fetchDataEmployee = async() =>{
        try{
            const response = await getEmployee();
            setDataEmployee(response.data)
            console.log('data employee berhasil di fetching')
        }catch(error){
            console.error('Error fetching data employee', error)
        }
    }
    useEffect(()=>{
        fetchDataEmployee()
    },[])

    //2. filtered data employee
    const handleFilterDataAmployee = (selectedTerm) =>{
        if(selectedTerm === ""){
            setFilterDataEmployee(dataEmployee);
        }else{
            const filterDataEmployee = dataEmployee.filter(
            (empy) =>
                empy.name.toLowerCase().includes(selectedTerm.toLowerCase()) ||
                empy.divisi.toLowerCase().includes(selectedTerm.toLowerCase()) 
            );
            setFilterDataEmployee(filterDataEmployee)
        }
    };


  return (
    <div className='ed-container'>
        <div className="edc-header">
            <div className="edc-letf">
                
            </div>
            <div className="edc-right">

            </div>
        </div>
        <div className="edc-body">

        </div>
    </div>
  )
}

export default EmployeeData

{/* <div>
        {dataEmployee.map((empy)=>(
            <div key={empy.id}>
                {empy.name}
            </div>
        ))}
    </div> */}