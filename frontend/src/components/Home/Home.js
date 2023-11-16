import React, { useState,useEffect } from 'react';
import './Home.css'
import axios from 'axios';
import uploadIcon from './process-icon.png'; // Path to your upload icon png
import processIcon from './uplaod-icon.png'; // Path to your process icon png
import chooseFile from './choose-file.png';
import moment from 'moment';

const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const [totalCost, setTotalCost] = useState('');
    const [totalUsage, setTotalUsage] = useState('');
    const [earliestDate, setEarliestDate] = useState(new Date());
    const [latestDate, setLatestDate] = useState(new Date());

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('email', localStorage.getItem('loggedEmail'));
    
        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND_URI+'/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            alert('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    }

    const fetchAvailableDates = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/available-dates?email=${localStorage.getItem('loggedEmail')}`);
            const dates = response.data.map(dateStr => new Date(dateStr));
            if (dates.length > 0) {
                // Find the earliest and latest dates
                const earliest = new Date(Math.min(...dates));
                const latest = new Date(Math.max(...dates));
                setEarliestDate(earliest.toISOString().split('T')[0]);
                setLatestDate(latest.toISOString().split('T')[0]);
            }
        } catch (error) {
            console.error('Error fetching available dates:', error);
        }
    };

    const fetchTotalCostAndUsage = async () => {
        try {
            // Only proceed if both dates are available
            if (earliestDate && latestDate) {
                const formattedStart = moment(earliestDate).format('YYYY-MM-DD');
                const formattedEnd = moment(latestDate).format('YYYY-MM-DD');

                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/getCostUsage`, {
                    params: {
                        start: formattedStart,
                        end: formattedEnd,
                        email: localStorage.getItem('loggedEmail')
                    }
                });
                const data = response.data[0] || {}; // Fallback to an empty object if data[0] is null/undefined
                setTotalCost(data.s_cost ? Number(data.s_cost).toFixed(2) : '0.00');
                setTotalUsage(data.s_usage ? Number(data.s_usage).toFixed(2) : '0.00');
            }
        } catch (error) {
            console.error('Error fetching total cost and usage:', error);
        }
    };

    useEffect(() => {
        fetchAvailableDates();
    }, []);

    useEffect(() => {
        fetchTotalCostAndUsage();
    }, [earliestDate, latestDate]);

    const handleProcessFiles = async () => {
        try {
            const email = localStorage.getItem('loggedEmail');
            console.log(email)
            const res_name = await axios.get(process.env.REACT_APP_BACKEND_URI + `/api/getFileName?email=${email}`);
            if(res_name.data.length === 0){
                alert("No Files to process")
            }
            else{
                const file_name = res_name.data[0].file_name;
                const response = await axios.post(process.env.REACT_APP_BACKEND_URI + '/api/process-files', { email,file_name });
                console.log(response.data);
                alert('Files processed successfully');
            }
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing files');
        }
    }

return (
    <div className='home-container'>
        <div className='stats-container'>
            <div className='stat-card'>
                <div className='stat-title'>Total Bill</div>
                <div className='stat-value'>{totalCost} USD</div>
                <div className='date-range'>{moment(earliestDate).format('MM/DD/YYYY')} - {moment(latestDate).format('MM/DD/YYYY')}</div>
            </div>
            <div className='stat-card'>
                <div className='stat-title'>Total Energy Usage</div>
                <div className='stat-value'>{totalUsage} units</div>
                <div className='date-range'>{moment(earliestDate).format('MM/DD/YYYY')} - {moment(latestDate).format('MM/DD/YYYY')}</div>
            </div>
        </div>
        <div className='files-section'>
            <div className='upload-section'>
            <label htmlFor="file-upload" className='upload-label'>
                <img src={processIcon} alt="Choose File" className="button-icon" />
                Choose File
            </label>
            <input id="file-upload" type="file" onChange={handleFileSelect} />
            <button onClick={handleUpload} className='upload-button'>
                <img src={chooseFile} alt="Upload" className="button-icon" />
                Upload File
            </button>
            <button onClick={handleProcessFiles} className='process-button'>
                <img src={uploadIcon} alt="Process" className="button-icon" />
                Process Files
            </button>
            </div>
        </div>
    </div>
    );
}
export default Home;
