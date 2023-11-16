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

    const [selectedDataType, setSelectedDataType] = useState('cost');

    const [heatMapData, setHeatMapData] = useState([]);
    const [heatMapType, setHeatMapType] = useState('cost')
    const [xLabels, setXLabels] = useState([]); // Dates
    const [yLabels, setYLabels] = useState([]); // Time slots

    const [totalCost, setTotalCost] = useState(0);
    const [totalUsage, setTotalUsage] = useState(0);

    const [selectedHeatMapType, setSelectedHeatMapType] = useState('cost');
    const [selectedBarDataType, setSelectedBarDataType] = useState('cost');

    const handleBarDataTypeChange = (type) => {
        setBarDataType(type);
        setSelectedBarDataType(type);
      };

    const handleDataTypeChange = (type) => {
        setDataType(type);
        setSelectedDataType(type);
      };

    const handleHeatMapTypeChange = (type) => {
        setHeatMapType(type);
        setSelectedHeatMapType(type);
    };

    useEffect(() => {
        fetchHeatMapData();
    }, [heatMapType, startDate, endDate]);

    const fetchHeatMapData = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/heatmap-data?type=${heatMapType}&start=${startDate.toISOString()}&end=${endDate.toISOString()}&email=${localStorage.getItem('loggedEmail')}`);
            const transformedData = transformHeatMapData(response.data);
            setHeatMapData(transformedData.data);
            setXLabels(transformedData.xLabels);
            setYLabels(transformedData.yLabels);
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
        }
    };

    const transformHeatMapData = (data) => {
    // Initialize xLabels for 24 hours
        const xLabels = [];
        for (let i = 0; i < 24; i++) {
            if (i === 23) {
                // Handle the transition from 23:00 to 24:00
                xLabels.push(`${i}:00 to ${i + 1}:00`);
            } else {
                xLabels.push(`${i}:00 to ${i + 1}:00`);
            }
        }

        // Collect unique dates for yLabels
        const yLabelsSet = new Set();
        data.forEach(item => {
            if (item && item.date) {
                const dateStr = item.date.split('T')[0];
                yLabelsSet.add(dateStr);
            }
        });

        // Convert yLabels Set to Array
        const yLabels = Array.from(yLabelsSet).sort();

        // Initialize heatmapData
        const heatmapData = Array.from({ length: yLabels.length }, () => Array(xLabels.length).fill(0));

        // Populate heatmapData
        data.forEach(item => {
            if (item && item.date && item.hour !== undefined) {
                const dateStr = item.date.split('T')[0];
                const yIndex = yLabels.indexOf(dateStr);
                const hour = parseInt(item.hour);
                if (yIndex !== -1 && hour >= 0 && hour < xLabels.length) {
                    heatmapData[yIndex][hour] = item.value;
                }
            }
        });
        // console.log(heatmapData)
        return {
            data: heatmapData,
            xLabels: xLabels,
            yLabels: yLabels
            // background: "#329fff"
        };
    };

    const fetchScatterData = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/scatter-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&email=${localStorage.getItem('loggedEmail')}`);
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
                    backgroundColor: 'rgba(135, 206, 235, 0.5)' // Color for Morning
                },
                {
                    label: 'Afternoon',
                    data: timePeriods.Afternoon,
                    backgroundColor: 'rgba(255, 165, 0, 0.5)' // Color for Afternoon
                },
                {
                    label: 'Evening',
                    data: timePeriods.Evening,
                    backgroundColor: 'rgba(255, 69, 0, 0.5)' // Color for Evening
                },
                {
                    label: 'Night',
                    data: timePeriods.Night,
                    backgroundColor: 'rgba(0, 0, 128, 0.5)' // Color for Night
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
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/bar-data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${barDataType}&email=${localStorage.getItem('loggedEmail')}`);
            const reformattedBarData = {};
            Object.keys(response.data).forEach(originalKey => {
                const date = new Date(originalKey);
                const formattedKey = date.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD' format
                reformattedBarData[formattedKey] = response.data[originalKey];
            });
            setBarData(reformattedBarData);
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
                    backgroundColor: 'rgba(135, 206, 235, 0.5)',
                },
                {
                    label: 'Afternoon',
                    data: afternoonData,
                    backgroundColor: 'rgba(255, 165, 0, 0.5)',
                },
                {
                    label: 'Evening',
                    data: eveningData,
                    backgroundColor: 'rgba(255, 69, 0, 0.5)',
                },
                {
                    label: 'Night',
                    data: nightData,
                    backgroundColor: 'rgba(0, 0, 128, 0.5)',
                }
            ]
        };
    };

    const fetchTotalCostAndUsage = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/getCostUsage`, {
                params: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    email: localStorage.getItem('loggedEmail')
                }
            });
            const data = response.data[0];
            setTotalCost(Number(data.s_cost).toFixed(2));
            setTotalUsage(Number(data.s_usage).toFixed(2));
        } catch (error) {
            console.error('Error fetching total cost and usage:', error);
        }
    };

    useEffect(() => {
        fetchTotalCostAndUsage();
    }, [startDate, endDate]);

    useEffect(() => {
        fetchAvailableDates();
    }, []);

    const fetchAvailableDates = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/available-dates?email=${localStorage.getItem('loggedEmail')}`);
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
            const response = await axios.get(process.env.REACT_APP_BACKEND_URI+`/api/data?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${dataType}&email=${localStorage.getItem('loggedEmail')}`);
                const data = response.data; 
                // console.log(data);
                setPieData({
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: [
                            'rgba(135, 206, 235, 0.7)',
                            'rgba(255, 165, 0, 0.7)',
                            'rgba(255, 69, 0, 0.7)',
                            'rgba(0, 0, 128, 0.7)',
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
            <div className='date-picker-container'>
                <div className='date-picker'>
                    <label className='date-picker-label'>From</label>
                    <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        includeDates={availableDates}
                    />
                </div>
                <div className='date-picker'>
                    <label className='date-picker-label'>To</label>
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
                <div className='summary-display'>
                    <div>
                        <label className='date-picker-label'>Total Cost</label> USD {totalCost}
                    </div>
                </div>
                <div className='summary-display'>
                    <div>
                        <label className='date-picker-label'>Total Usage</label> {totalUsage} units
                    </div>
                </div>
                <div className='time-frames-container'>
                    <div className='time-frame-box' style={{ backgroundColor: 'rgba(135, 206, 235, 0.6)' }}>
                        <div className='time-frame-title'>Morning</div>
                        <div className='time-frame-range'>06:00 to 12:00</div>
                    </div>
                    <div className='time-frame-box' style={{ backgroundColor: 'rgba(255, 165, 0, 0.6)' }}>
                        <div className='time-frame-title'>Noon</div>
                        <div className='time-frame-range'>12:00 to 16:00</div>
                    </div>
                    <div className='time-frame-box' style={{ backgroundColor: 'rgba(255, 69, 0, 0.6)' }}>
                        <div className='time-frame-title'>Evening</div>
                        <div className='time-frame-range'>16:00 to 20:00</div>
                    </div>
                    <div className='time-frame-box' style={{ backgroundColor: 'rgba(0, 0, 128, 0.6)' }}>
                        <div className='time-frame-title'>Night</div>
                        <div className='time-frame-range'>20:00 to 06:00</div>
                    </div>
                </div>
            </div>
            <div className="charts-container">
                <div className='tp chart-container'>
                    <h2 className='sub-title-text'>Pie Chart</h2>
                    <div className='button-container'>
                        <button
                        className={`analysis-button ${selectedDataType === 'cost' ? 'active' : ''}`}
                        onClick={() => handleDataTypeChange('cost')}
                        >
                        Show Cost
                        </button>
                        <button
                        className={`analysis-button ${selectedDataType === 'usage' ? 'active' : ''}`}
                        onClick={() => handleDataTypeChange('usage')}
                        >
                        Show Usage
                        </button>
                    </div>
                    {pieData && <Pie data={pieData} />}
                </div>
                <div className='chart-container scatter'>
                    <h2 className='sub-title-text'>Scatter Plot</h2>
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
                <h2 className='sub-title-text'>Heat Map</h2>
                <div className='button-container'>
                    <button
                        className={`analysis-button ${selectedHeatMapType === 'cost' ? 'active' : ''}`}
                        onClick={() => handleHeatMapTypeChange('cost')}
                    >
                        Show Cost
                    </button>
                    <button
                        className={`analysis-button ${selectedHeatMapType === 'usage' ? 'active' : ''}`}
                        onClick={() => handleHeatMapTypeChange('usage')}
                    >
                        Show Usage
                    </button>
                </div>
                <HeatMap className='heat-map-container'
                    xLabels={xLabels}
                    yLabels={yLabels}
                    data={heatMapData}
                    height={30}
                    cellStyle={(background, value, min, max, data, x, y) => ({
                        background: `rgba(50, 50, 150, ${1 - (max - value) / (max - min)})`,
                        fontSize: "11px",
                    })}
                    cellRender={value => value && `${value.toFixed(2)}`}
                />
            </div>
            <div className='bp-1'>
            <h2 className='sub-title-text'>Stacked Bar Graph</h2>
                <div className='button-container'>
                <button
                    className={`analysis-button ${selectedBarDataType === 'cost' ? 'active' : ''}`}
                    onClick={() => handleBarDataTypeChange('cost')}
                >
                    Show Cost
                </button>
                <button
                    className={`analysis-button ${selectedBarDataType === 'usage' ? 'active' : ''}`}
                    onClick={() => handleBarDataTypeChange('usage')}
                >
                    Show Usage
                </button>
                </div>
                <Bar data={generateBarChartData()} options={{ 
                    scales: { x: { stacked: true }, y: { stacked: true } }
                }} />
            </div>
            {/* <div className='bp-2'>
                Table with individual colum search feature
            </div> */}
        </div>
    )
}

export default Analysis