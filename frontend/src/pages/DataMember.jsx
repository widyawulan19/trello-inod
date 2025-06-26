import React, { useEffect, useState } from 'react'
import { deleteEmployeeData,getEmployee } from '../services/ApiServices'
import { HiOutlineFilter, HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiPlus, HiOutlineSwitchHorizontal, HiOutlineSwitchVertical, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi';
import { HiOutlineCalendarDateRange, HiOutlinePencil,HiMiniEllipsisHorizontal,HiOutlineCubeTransparent, HiMiniPhone, HiMiniCalendar, HiCalendarDateRange, HiMiniPencilSquare, HiMiniTableCells, HiOutlineCreditCard, HiEllipsisHorizontal, HiEnvelope, HiOutlineEnvelope } from "react-icons/hi2";
import '../style/pages/DataMember.css';
import { IoMail } from "react-icons/io5";
import AddDataEmployee from '../modules/AddDataEmployee';
import BootstrapTooltip from '../components/Tooltip';
import OutsideClick from '../hook/OutsideClick';
import FormDataEmployee from '../modules/FormDataEmployee';
import FormEditDataEmployee from '../modules/FormEditDataEmployee';

const DataMember=()=> {
    //STATE
    const [employees, setEmployees] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [filterDivisi, setFilterDivisi] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    //STATE SHOW
    const [showCardSetting, setShowCardSetting] = useState(null)
    const cardSettingRef = OutsideClick(()=> setShowCardSetting(false))
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const isDropdownOpenRef = OutsideClick(()=> setIsDropdownOpen(false))
    const [showSettingTabel,setShowSettingTabel] = useState(false)
    const settingTabelRef = OutsideClick(()=> setShowSettingTabel(false))
    const [showSchedule, setShowSchedule] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'card' atau 'table'
    const [showEditData, setShowEditData] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);


    //FUNCTION
    //1. get data employee
    const fetchMember = async()=>{
        try{
            const response = await getEmployee();
            if(Array.isArray(response.data)){
                setEmployees(response.data)
                setFilteredData(response.data)
            }else{
                throw new Error('Data is not an array');
            }
        }catch(error){
            console.error('Failed load employees data:', error)
        }
    }
    useEffect(()=>{
        fetchMember()
    },[])

    //2. fungsi filter (berdasarkan Divisi)
    const handleFilterData = (selectedDivisi) =>{
        setFilterDivisi(selectedDivisi);
        // setIsDropdownOpen(false);
        setIsDropdownOpen((prev) => !prev)

        if(selectedDivisi === ''){
            setFilteredData(employees)
        }else{
            const filtered = employees.filter((employee)=>
                employee.divisi.toLowerCase().includes(selectedDivisi.toLowerCase())
            )
            setFilteredData(filtered)
        }
    }

    //3. Menangani input pencarian
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

     // Melakukan filter berdasarkan divisi dan pencarian nama
      useEffect(() => {
        let filtered = employees;
    
        if (filterDivisi) {
          filtered = filtered.filter((employee) =>
            employee.divisi.toLowerCase().includes(filterDivisi.toLowerCase())
          );
        }
    
        if (searchTerm) {
          filtered = filtered.filter((employee) =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
    
        setFilteredData(filtered);
      }, [employees, filterDivisi, searchTerm]);
    
      const handleShowSettingTable = (e, id) =>{
        e.stopPropagation();
        setShowSettingTabel((prev)=> (prev === id ? null : id));
      }
    
    //4. fungsi delete data employee
    const handleDeleteEmployee = async (e, id) => {
      e.preventDefault();
      e.stopPropagation();

  
      const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus karyawan ini?");
      
      if (isConfirmed) {
          try {
              await deleteEmployeeData(id);
              alert("Karyawan berhasil dihapus!");
  
              // Memperbarui state setelah data terhapus
              setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
              setFilteredData((prevFiltered) => prevFiltered.filter((emp) => emp.id !== id));
  
              // Opsional: Ambil data terbaru dari server
              await fetchMember();
          } catch (error) {
              console.error("Gagal menghapus karyawan:", error);
              alert("Terjadi kesalahan saat menghapus karyawan!");
          }
      } else {
          alert("Penghapusan dibatalkan.");
      }
  };

  const handleShowSchedule = () =>{
    setShowSchedule(!showSchedule)
  }

  const handleShowForm = () =>{
    setShowForm(!showForm)
  }

  const handleCloseShoForm = () =>{
    setShowForm(false)
  }

  const handleShowFormEdit = (employee) =>{
    setSelectedEmployee(employee);
    setShowEditData(!showEditData);
    console.log('Fungsi edit berhasil di klik');
  }


  const handleCloseShowEdit = () =>{
    setShowEditData(false);
  }

  //show card setting
  const handleShowCardSetting = (cardId) => {
    setShowCardSetting(prevId => (prevId === cardId ? null : cardId));
  };


  


      return (
        <div className='de-panel-container'>
          <div className="de-panel">
            <div className="dep-right">
              <h3>👋 Meet the Team</h3>
              <div className="dep-desc">
                <strong style={{fontSize:'12px'}}>Satu Tim. Banyak Cerita. Satu Visi.</strong>
                <p>
                  Halaman ini adalah tempat kamu bisa mengenal lebih dekat siapa saja orang-orang hebat yang membangun dan menggerakkan Inod Studio, mulai dari latar belakang mereka, peran di tim, hingga kontribusinya di setiap proyek.
                </p>
              </div>
            </div>

            <div className="dep-left">
                <div className="dep-btn">
                  <div className="dep-search-box">
                      <HiOutlineSearch />
                      <input
                          type="text"
                          placeholder="Search by name..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                      />
                  </div>
                  <button onClick={handleShowForm} >
                    <HiPlus className='mr-1'/>
                    ADD DATA
                  </button>
                  <button onClick={()=> setIsDropdownOpen(!isDropdownOpen)}>
                      <HiOutlineFilter style={{marginRight:'3px'}}/>
                      FILTER
                  </button>
                  
                </div>
                {/* SHOW FILTER DROPDOWN */}
                {isDropdownOpen && (
                  <ul className="dropdown-menu" ref={isDropdownOpenRef}>
                    <div className="dm-title">
                      Filter by:
                    </div>
                    <li onClick={() => handleFilterData('')}>All DATA</li>
                    <li onClick={() => handleFilterData('produksi')}>PRODUKSI</li>
                    <li onClick={() => handleFilterData('marketing')}>MARKETING</li>
                    <li onClick={() => handleFilterData('desain')}>DESAIN</li>
                    <li onClick={() => handleFilterData('operational')}>OPERATIONAL</li>
                  </ul>
                )}  

                {/* TOGGLE VIEW DATA  */}
                 <div className="view-toggle">
                    <button
                      className={viewMode === 'table' ? 'active' : ''}
                      onClick={() => setViewMode('table')}
                    >
                      <HiMiniTableCells size={15}/>
                      Table View
                    </button>
                    <button
                      className={viewMode === 'card' ? 'active' : ''}
                      onClick={() => setViewMode('card')}
                    >
                      <HiOutlineCreditCard size={15}/>
                      Card View
                    </button>
                </div>

                {/* TABEL DATA EMPLOYEE */}  
                {/* SHOW FORM  */}
                {showForm && (
                  <div className="form-modal">
                    <div className="form-modal-box">
                        <FormDataEmployee onClose={handleCloseShoForm} fetchMember={fetchMember}/>
                    </div>
                  </div>
                )}
            </div>
          </div>

         
          {/* SHOW SCHEDULE  */}
          {showSchedule && (
            <div className="schedule-modal">
              
            </div>
          )}


          {viewMode === 'table' ? (
            <div className="employee-table-wrapper">
              <table cellPadding="10" cellSpacing='0'>
                <thead>
                  <tr>
                    <th className="sticky-th"  style={{borderTopLeftRadius:'8px'}}>No</th>
                    <th className="sticky-th" >Nama</th>
                    <th className="sticky-th" >Username</th>
                    <th className="sticky-th" >Divisi</th>
                    <th className="sticky-th" >Jabatan</th>
                    <th className="sticky-th" >Email</th>
                    <th className="sticky-th" > 
                      <div className='th'>
                        <HiMiniPhone/> Nomor WA
                      </div>
                    </th>
                    <th className="sticky-th"  style={{borderTopRightRadius:'8px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((employee, index) => (
                      <tr key={employee.employee_id || index}>
                        <td>{index + 1}</td>
                        <td>{employee.name}</td>
                        <td>{employee.username}</td>
                        <td>{employee.divisi}</td>
                        <td>{employee.jabatan}</td>
                        <td>
                          <div className='email-cont'>
                            {employee.email_employee}
                          </div>
                        </td>
                        <td>{employee.nomor_wa}</td>
                        <td className='action-tabel'>
                          <BootstrapTooltip title='Edit' placement='top'>
                             <button onClick={()=> handleShowFormEdit(employee)}>
                              <HiMiniPencilSquare/>
                            </button>
                          </BootstrapTooltip>
                         <BootstrapTooltip title='View Profil' placement='top'>
                            <button>
                              <HiOutlineUser/>
                            </button>
                         </BootstrapTooltip>
                          <BootstrapTooltip title='Hapus' placement='top'>
                            <button onClick={(e) => handleDeleteEmployee(e, employee.employee_id)} className="delete-btn">
                              <HiOutlineTrash />
                            </button>
                          </BootstrapTooltip>
                        </td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
                
              </table>
            </div>
            
          ) : (
            <div className="employee-container">
              {filteredData.length > 0 ? (
                filteredData.map((employee, index) => (
                  <div className="employee-card" key={employee.employee_id || index}>
                    <div className="card-header">
                      <div className="ch-left">
                        <img src={employee.photo_url} />
                        <h4>{employee.name}</h4>
                        <p className="employee-division">{employee.jabatan}</p>
                      </div>
                      <div className="ch-right" >
                        <BootstrapTooltip title='Card Setting' placement='top'>
                            <HiEllipsisHorizontal 
                              className='chr-icon' 
                              onClick={() => handleShowCardSetting(employee.employee_id)}
                            />
                        </BootstrapTooltip>
                        {/* SHOW CARD SETTING */}
                        {showCardSetting === employee.employee_id && (
                          <div className="card-setting-menu" ref={cardSettingRef}>
                            <button>
                              <HiOutlineUser/>
                              View Profile
                            </button>
                            <button onClick={()=> handleShowFormEdit(employee)}>
                              <HiMiniPencilSquare/>
                              Edit Data
                            </button>
                            <button 
                              className='csm-delete'
                              onClick={(e)=> handleDeleteEmployee(e, employee.employee_id)}
                            >
                              <HiOutlineTrash/>
                              Delete
                            </button>
                          </div>
                        )}
                        {/* END SHOW CARD SETTING */}

                      </div>        
                    </div>
                    <div className="employee-card-body">
                      <div className="ecb-box">
                        <h5>Departmen</h5>
                        <p className='font-bold'>{employee.divisi}</p>
                      </div>
                      <div className="more-info">
                        <div className="ecb-box-email">
                          <HiOutlineEnvelope/>
                          <p className='font-bold'>{employee.email_employee}</p>
                        </div>
                        <div className="ecb-box-email">
                          <HiOutlinePhone/>
                          <p className='font-bold'>{employee.nomor_wa}</p>
                        </div>
                      </div>
                      
                      {/* <p><strong>Position</strong> {employee.jabatan}</p>
                      <p><strong>Email:</strong> {employee.email}</p>
                      <p><strong>WhatsApp:</strong> {employee.nomor_wa}</p> */}
                      {/* <div className="card-actions">
                        <button onClick={(e) => handleDeleteEmployee(e, employee.id)} className="delete-btn">
                          <HiOutlineTrash /> Hapus
                        </button>
                        <button>Schedule</button>
                      </div> */}
                    </div>
                    
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center' }}>Tidak ada data karyawan</p>
              )}
            </div>
          )}

          {showEditData && selectedEmployee && (
            <div className='edit-form-modal'>
              <div className="edit-cont-modal">
                  <FormEditDataEmployee 
                    employee={selectedEmployee} 
                    fetchMember={fetchMember} 
                    onClose={handleCloseShowEdit}
                  />
              </div>
            </div>
          )}
      
        </div>
      );
}

export default DataMember