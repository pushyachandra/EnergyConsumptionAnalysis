import React, { useState } from 'react';
import './Home.css'
import axios from 'axios';
import uploadIcon from './process-icon.png'; // Path to your upload icon png
import processIcon from './uplaod-icon.png'; // Path to your process icon png
import chooseFile from './choose-file.png';

const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null);

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

    const handleProcessFiles = async () => {
        try {
            const email = localStorage.getItem('loggedEmail'); // Retrieve email from local storage
            const file_name = 'newone.csv';
            const response = await axios.post(process.env.REACT_APP_BACKEND_URI + '/api/process-files', { email,file_name });
            console.log(response.data);
            alert('Files processed successfully');
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing files');
        }
    }

//     return (
//         <div className='container-analysis'>
//             <div className='tp'>Total Bill</div>
//             <div className='tp'>Total Energy Usage</div>
//             <div className='tp'>Insights</div>
//             <div className='bp'>
//                 Files Section
//                 <div>
//                     Upload File
//                     <input type="file" onChange={handleFileSelect} />
//                     <button onClick={handleUpload}>Upload File</button>
//                 </div>
//                 <div>
//                     <h6>Process</h6>
//                     <button onClick={handleProcessFiles}>Process Files</button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Home;

return (
    <div className='home-container'>
            <div className='stats-container'>
                <div className='stat-card'>Total Bill</div>
                <div className='stat-card'>Total Energy Usage</div>
                <div className='stat-card'>Insights</div>
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
                </div>
                <div className='process-section'>
                    <button onClick={handleProcessFiles} className='process-button'>
                        <img src={uploadIcon} alt="Process" className="button-icon" />
                        Process Files
                    </button>
                </div>
            </div>
        </div> );
}
export default Home;
