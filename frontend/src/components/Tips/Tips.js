import React, { useState, useEffect } from 'react';
import './Tips.css';
import axios from 'axios';

const Tips = () => {
    const [currentTip, setCurrentTip] = useState(null); // Start with null to clearly indicate no data
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchTip(currentPage);
    }, [currentPage]);

    const fetchTip = async (page) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/tips`, { params: { page } });
            // console.log('Response data:', response.data); // Check the data structure
            if (response.data && response.data.tips.length > 0) {
                setCurrentTip(response.data.tips[0]); // Set the current tip
                setTotalPages(response.data.totalPages);
            } else {
                setCurrentTip(null); // No tips available for this page
            }
        } catch (error) {
            console.error('Error fetching tips:', error);
        }
    };

    const goToNextTip = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const goToPrevTip = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    // Debug currentTip state after it's set
    useEffect(() => {
        console.log('Current tip:', currentTip);
    }, [currentTip]);

    return (
        <div className='tips-container'>
            <div className='pagination'>
                <button onClick={goToPrevTip} disabled={currentPage === 1}>
                    Previous
                </button>
                <p>Page {currentPage} of {totalPages}</p>
                <button onClick={goToNextTip} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
            {currentTip ? (
                <div className='tip'>
                    <h2 className='tip-title'>{currentTip.tip_title}</h2>
                    <p className='tip-content'>{currentTip.tip_content}</p>
                </div>
            ) : (
                <p>No tips available.</p>
            )}
        </div>
    );
};

export default Tips;
