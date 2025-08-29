import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/fitur/FormCreateCardMarketing.css'
import { createCardFromMarketing, getCardIdMarketingByMarketingId, getWorkspaceIdAndBoardId, getBoards } from '../services/ApiServices';
import { HiOutlineChevronDown, HiOutlineArrowRight, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip'; // Jika menggunakan Tooltip yang sama
import { useNavigate } from 'react-router-dom';
import { getListByBoard } from '../services/ApiServices'; // Import endpoint baru
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';
import { IoIosCreate } from "react-icons/io";

const FormCreateCardMarketing = ({ marketingId, onClose }) => {
  const [boards, setBoards] = useState([]); // Menyimpan daftar board
  const [selectedBoardId, setSelectedBoardId] = useState(null); // Menyimpan ID board yang dipilih
  const [selectedListId, setSelectedListId] = useState(null); // Menyimpan ID list yang dipilih
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLists, setFilteredLists] = useState([]); // Menyimpan list yang difilter berdasarkan board yang dipilih
  const [showBoardDropdown, setShowBoardDropdown] = useState(false); // Untuk toggle dropdown board
  const [showListDropdown, setShowListDropdown] = useState(false); // Untuk toggle dropdown list
  const navigate = useNavigate();
  const [cardId, setCardId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBoards, setFilteredBoards] = useState([]);
  const {showSnackbar} = useSnackbar();

  const handleShowBoardDropdown = (e) =>{
    e.stopPropagation();
    setShowBoardDropdown(!showBoardDropdown)
  }

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setBoards(response.data); // Menyimpan semua board yang diterima dari API
        setFilteredBoards(response.data);
      } catch (error) {
        console.error('Terjadi kesalahan saat memuat boards:', error);
        showSnackbar('Gagal memuat boards!', 'error');
        // alert('Gagal memuat boards!');
      }
    };

    fetchBoards(); // Panggil fungsi untuk mengambil data boards saat komponen dimuat
  }, []);

  useEffect(() => {
    const checkCard = async () => {
      try {
        const response = await getCardIdMarketingByMarketingId(marketingId);
        if (response.data && response.data.cardId) {
          setCardId(response.data.cardId);
        }
      } catch (error) {
        console.error('Error fetching cardID:', error);
      }
    };
    if (marketingId) {
      checkCard();
    }
  }, [marketingId]);

  // Fungsi untuk menangani perubahan board yang dipilih
  const handleBoardChange = async (boardId) => {
    setSelectedBoardId(boardId);
    setSelectedListId(null); // Reset selected list setelah board dipilih
    // setShowBoardDropdown(!showBoardDropdown);

    try {
      // Ambil list berdasarkan board yang dipilih menggunakan endpoint getListByBoard
      const response = await getListByBoard(boardId);
      setFilteredLists(response.data); // Simpan list yang diterima dari API ke filteredLists
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat lists:', error);
      alert('Gagal memuat lists untuk board yang dipilih!');
    }
  };

  const handleCreateCard = async () => {
    if (!selectedListId) {
      alert('Silakan pilih list terlebih dahulu!');
      return;
    }

    try {
      setIsLoading(true); // Indicate loading state
      const response = await createCardFromMarketing(selectedListId, marketingId);

      if (response.status === 201) {
        // alert('Card berhasil dibuat!');
        showSnackbar('Card berhasil dibuat!','success');
        const { cardId: newCardId } = response.data;

        // Dapatkan workspaceId dan boardId setelah pembuatan card
        const { data } = await getWorkspaceIdAndBoardId({ listId: selectedListId, cardId: newCardId });

        if (data) {
          const { workspaceId, boardId } = data;
          navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`);
        } else {
          // alert('Workspace atau Board tidak ditemukan');
          showSnackbar('Workspace atau board tidak ditemukan','error')
        }
      } else {
        showSnackbar('Gagal membuat card!', 'error')
      }
    } catch (error) {
      console.error('Error creating card:', error);
      showSnackbar('Terjadi kesalahan saat membuat card!','error')
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  //fungsi filter boards
  const handleSearchBoard = (e) =>{
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = boards.filter((board)=>
      board.name.toLowerCase().includes(value)
    );
    setFilteredBoards(filtered)
    e.stopPropagation();
  }

  const handleViewCard = async () => {
    if (cardId) {
      try {
        setIsLoading(true);

        const { data } = await getWorkspaceIdAndBoardId({ listId: selectedListId, cardId });
        if (data) {
          const { workspaceId, boardId } = data;
          navigate(`/workspaces/${workspaceId}/boards/${boardId}/lists/${selectedListId}/cards/${cardId}`);
        } else {
          alert('Workspace atau Board tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching workspace and board:', error);
        alert('Terjadi kesalahan saat mengambil data workspace dan board');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="create-card-container">
      <div className="cc-header">
        <div className="cch-title">
          <div className="cch-icon">
            <IoIosCreate className='mini-icon'/>
          </div>
            <p>CREATE CARD</p>
        </div>
        <BootstrapTooltip title="Close" placement="top">
          <FaXmark className="cc-icon" onClick={onClose} />
        </BootstrapTooltip>
      </div>

      <div className="cc-content">
        {/* Box Select Board */}
        <div className="cc-left">
           <div className="cc-select-box">
            <label>Choose Board</label>
            <div
              className="cc-dropdown"
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
            >
              <button className="ccd-btn">
                {selectedBoardId ? boards.find(board => board.id === selectedBoardId)?.name : "Select a Board"}
                <HiOutlineChevronDown className="dropdown-icon" />
              </button>
              {showBoardDropdown && (
                <div className="form-create-card">
                  <input 
                    type="text"
                    placeholder='Search Boards...'
                    value={searchTerm}
                    onChange={handleSearchBoard}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ul className="ccd-menu">
                    {filteredBoards.map((board) => (
                      <li
                        key={board.id}
                        onClick={() => handleBoardChange(board.id)}
                        className="ccd-item"
                      >
                        {board.name}
                      </li>
                    ))}
                  </ul>
                </div>
                
              )}
            </div>
          </div>

          {/* Box Select List */}
          {selectedBoardId && (
            <div className="cc-select-list">
              <label>Choose List</label>
              <div
                className="cc-lists-dropdown"
                onClick={() => setShowListDropdown(!showListDropdown)}
              >
                <button className="cc-lists-btn">
                  {selectedListId ? filteredLists.find(list => list.id === selectedListId)?.name : "Select a List"}
                  <HiOutlineChevronDown className="dropdown-icon" />
                </button>
                {showListDropdown && (
                  <ul className="ccl-menu">
                    {filteredLists.map((list) => (
                      <li
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className="ccl-item"
                      >
                        {list.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
       

        {/* Button to Create Card */}
        <div className="btn-form-create">
          <button
            className="cc-sub-btn"
            onClick={handleCreateCard}
            disabled={isLoading || !selectedListId}
          >
            Create Card
            <HiOutlineArrowRight className='cc-sub-icon' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCreateCardMarketing;
