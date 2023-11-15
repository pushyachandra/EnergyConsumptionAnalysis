import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import './Analysis.css'
import { redirectIfNotLoggedIn } from '../Auth'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from 'react-chartjs-2';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import HeatMap from 'react-heatmap-grid';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

// import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analysis = () => {
    redirectIfNotLoggedIn();

    const [pieData, setPieData] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [availableDates, setAvailableDates] = useState([]);
    const [dataType, setDataType] = useState('cost'); // 'cost' or 'usage'
    const [barData, setBarData] = useState({});
    const [barDataType, setBarDataType] = useState('cost'); // 'cost' or 'usage'
    // const [barStartDate, setBarStartDate] = useState(new Date());
    // const [barEndDate, setBarEndDate] = useState(new Date());
    const [scatterData, setScatterData] = useState({});

    const [heatMapData, setHeatMapData] = useState([]);
    const [heatMapType, setHeatMapType] = useState('usage')
    const [xLabels, setXLabels] = useState([]); // Dates
    const [yLabels, setYLabels] = useState([]); // Time slots

    useEffect(() => {
        fetchHeatMapData();
    }, [heatMapType, startDate, endDate]);

    const fetchHeatMapData = async () => {
        try {
            //const response = await axios.get(`http://localhost:8080/api/heatmap-data?type=${heatMapType}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/heatmap-data?type=${heatMapType}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            const transformedData = transformHeatMapData(response.data);
            setHeatMapData(transformedData.data);
            setXLabels(transformedData.xLabels);
            setYLabels(transformedData.yLabels);
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
        }
    };

    const transformHeatMapData = (data) => {
        // Assuming each data point is an object with date, hour, and value
        const xLabels = new Set(); // Unique dates
        const yLabels = []; // Hours of the day
        const heatmapData = [];
    
        // Generate yLabels for 24 hours
        for (let i = 0; i < 24; i++) {
            yLabels.push(`${i}-${i + 1}`);
        }
    
        // Initialize heatmapData with zeros
        for (let i = 0; i < yLabels.length; i++) {
            heatmapData.push(Array(24).fill(0)); // Assuming 24 hours in a day
        }
    
        data.forEach(item => {
            if (item && item.date && item.hour !== undefined) {
                const dateStr = item.date.split('T')[0]; // Adjust according to your date format
                xLabels.add(dateStr);
                const xIndex = Array.from(xLabels).indexOf(dateStr);
                const hour = parseInt(item.hour);
                heatmapData[hour][xIndex] = item.value;
            }
        });
    
        return {
            data: heatmapData,
            xLabels: Array.from(xLabels),
            yLabels: yLabels
        };
    };

    const fetchScatterData = async () => {
        try {
            //const response = await axios.get(`http://localhost:8080/api/scatter-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/scatter-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            // console.log ("Scatter Data from backend:", response.data); // Log backend data
            setScatterData(transformScatterData(response.data));
        } catch (error) {
            console.error('Error fetching scatter plot data:', error);
        }
    };
    
    const transformScatterData = (data) => {
        const timePeriods = {
            Morning: [],
            Afternoon: [],
            Evening: [],
            Night: []
        };
    
        data.forEach(item => {
            if (timePeriods[item.timeOfDay]) {
                timePeriods[item.timeOfDay].push({ x: item.units, y: item.cost, date: item.date });
            }
        });
    
        return {
            datasets: [
                {
                    label: 'Morning ',
                    data: timePeriods.Morning,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)' // Color for Morning
                },
                {
                    label: 'Afternoon',
                    data: timePeriods.Afternoon,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)' // Color for Afternoon
                },
                {
                    label: 'Evening',
                    data: timePeriods.Evening,
                    backgroundColor: 'rgba(255, 206, 86, 0.5)' // Color for Evening
                },
                {
                    label: 'Night',
                    data: timePeriods.Night,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)' // Color for Night
                }
            ]
        };
    };
    
    useEffect(() => {
        fetchScatterData();
    }, [startDate, endDate]);

    useEffect(() => {
        fetchBarData();
    }, [startDate,endDate,barDataType]);

    const fetchBarData = async () => {
        try {
            //const response = await axios.get(`http://localhost:8080/api/bar-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${dataType}`);
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/bar-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${dataType}`);
            setBarData(response.data);
        } catch (error) {
            console.error('Error fetching bar chart data:', error);
        }
    };

    const generateBarChartData = () => {
        // Assuming barData is an object where each key is a date and each value is an object with Morning, Afternoon, Evening, Night values
        const chartLabels = Object.keys(barData);
        const morningData = chartLabels.map(label => barData[label].Morning || 0);
        const afternoonData = chartLabels.map(label => barData[label].Afternoon || 0);
        const eveningData = chartLabels.map(label => barData[label].Evening || 0);
        const nightData = chartLabels.map(label => barData[label].Night || 0);
        // console.log(barData)
        return {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Morning',
                    data: morningData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'Afternoon',
                    data: afternoonData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                },
                {
                    label: 'Evening',
                    data: eveningData,
                    backgroundColor: 'rgba(255, 206, 86, 0.5)',
                },
                {
                    label: 'Night',
                    data: nightData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }
            ]
        };
    };

    useEffect(() => {
        fetchAvailableDates();
    }, []);

    const fetchAvailableDates = async () => {
        try {
            //const response = await axios.get('http://localhost:8080/api/available-dates');
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+'/api/available-dates');
            const dates = response.data.map(dateStr => new Date(dateStr));
            setAvailableDates(dates);
    
            if (dates.length > 0) {
                // Find the earliest and latest dates
                const earliestDate = new Date(Math.min(...dates));
                const latestDate = new Date(Math.max(...dates));
                setStartDate(earliestDate);
                setEndDate(latestDate);
                fetchData(earliestDate, latestDate); // Fetch data for the full range
            }
        } catch (error) {
            console.error('Error fetching available dates:', error);
        }
    };

    const fetchData = async () => {
        try {
            //const response = await axios.get(`http://localhost:8080/api/data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${dataType}`);
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${dataType}`);
                const data = response.data;
                // console.log(data);
                setPieData({
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: [
                            '#87CEEB', // Gold for Morning
                            '#FFA500', // Orange for Noon
                            '#FF4500', // Orange Red for Evening
                            '#000080', // Navy for Night
                        ],
                        borderColor: [
                            '#FFFFFF', // White borders for all
                            '#FFFFFF',
                            '#FFFFFF',
                            '#FFFFFF',
                        ],
                        borderWidth: 1,
                    }],
                });
            } catch (error) {
                console.error(`Error fetching ${dataType} data:`, error);
            }
        };
    
    useEffect(() => {
        fetchData();
    }, [startDate, endDate, dataType]);

    return (
        <div className='container-analysis'>
            <div className='filter'>
                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    includeDates={availableDates}
                />
                <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    includeDates={availableDates}
                />
            </div>
            <div className="charts-container">
            <div className='tp chart-container'>
                <div>
                    <button className='analysis-button' onClick={() => setDataType('cost')}>Show Cost</button>
                    <button className='analysis-button' onClick={() => setDataType('usage')}>Show Usage</button>
                </div>
                <h2>Pie Chart</h2>
                {pieData && <Pie data={pieData} />}
            </div>
            <div className='chart-container scatter'>
                {/* Scatter Plot */}
                {scatterData && scatterData.datasets && scatterData.datasets.length > 0 ? (
                    <Scatter data={scatterData} options={{
                        scales: {
                            x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Energy Consumption' } },
                            y: { title: { display: true, text: 'Cost' } }
                        }
                    }} />
                ) : (
                    <p>Loading scatter plot data...</p>
                )}
            </div>
            </div>
            <div className='tp'>
                <div>
                    <button className='analysis-button' onClick={() => setHeatMapType('usage')}>Show Usage</button>
                    <button className='analysis-button' onClick={() => setHeatMapType('cost')}>Show Cost</button>
                </div>
                <HeatMap
                    xLabels={xLabels}
                    yLabels={yLabels}
                    data={heatMapData}
                    // ... other heatmap properties as needed ...
                />
            </div>
            <div className='bp-1'>
                <div>
                    <button className='analysis-button' onClick={() => setBarDataType('cost')}>Show Cost</button>
                    <button className='analysis-button' onClick={() => setBarDataType('usage')}>Show Usage</button>
                </div>
                Stacked Bar Chart
                <Bar data={generateBarChartData()} options={{ 
                    scales: { x: { stacked: true }, y: { stacked: true } }
                }} />
            </div>
            <div className='bp-2'>
                Table with individual colum search feature
            </div>
        </div>
    )
}

export default Analysis