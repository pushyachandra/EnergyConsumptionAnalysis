import React, { useState } from 'react'
import './Chatbot.css'
import axios from 'axios';
import { redirectIfNotLoggedIn } from '../Auth'

const Chatbot = () => {
    redirectIfNotLoggedIn();

    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessage = { sender: 'user', text: userInput };
        setMessages(messages => [...messages, newMessage]);

        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND_URI+'/chat', { message: userInput, email : localStorage.getItem('loggedEmail')});
            const botMessage = { sender: 'chatbot', text: response.data.message };
            if(botMessage.text==='DOWNLOAD'){
                botMessage.text="Preparing the file for download....";
                handleDownload(response.data.startDate,response.data.endDate, localStorage.getItem('loggedEmail'))
            }
            if(botMessage.sender==='chatbot' && botMessage.text==='ROUTE'){
                botMessage.text="Initiating the route...."
                if(newMessage.text.toLowerCase().includes('analysis')){
                    setTimeout(() => { window.location.href='/analysis'; }, 2000);
                }
                else if(newMessage.text.toLowerCase().includes('home')){
                    setTimeout(() => { window.location.href='/home'; }, 2000);
                }
                else if(newMessage.text.toLowerCase().includes('insights')){
                    setTimeout(() => { window.location.href='/insights'; }, 2000);
                }
                else{
                    alert('Incorrect Route Provided');
                }
            }
            console.log(response.data.downloadLink)
            setMessages(messages => [...messages, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setUserInput('');
    };

    const handleDownload = async (startDate,endDate,email) => {
        // Assuming `conversationHistory` has the dates you want to download.
        // You will extract the dates from the last message, for example.
        // const lastMessage = conversationHistory[conversationHistory.length - 1];
        // const { startDate, endDate } = extractDates(lastMessage.content); // You need to implement this function

        try {
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/download-data`, {
                params: { startDate, endDate, email },
                responseType: 'blob', // Important for handling the binary data
            });

            // Create a new Blob object using the response data of the file
            const blob = new Blob([response.data], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `data_${startDate}_${endDate}.csv`; // or any other filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error during file download:', error);
        }
    };

    return (
        <div className="chatbot-container">
            <div className='chatbot-title'>
                Energy Analyzer Chatbot
            </div>
            <div className="chat-window">
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="input-area">
                <input
                    type="text"
                    placeholder="Type your message here..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            </div>
        </div>
    );
};

export default Chatbot