import React, { useState, useEffect } from 'react';
import './Insights.css';

const Insights = () => {
    const selectedYear = 2024;
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [dailyUsage, setDailyUsage] = useState([]);

    useEffect(() => {
        fetchDailyUsage(selectedYear, selectedMonth);
    }, [selectedMonth]);

    const fetchDailyUsage = async (year, month) => {
        let usageData = [];
        for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
            try {
                const response = await fetch('https://stocksearch.onrender.com/formonthpredict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ year: year, month: month, day: day })
                });
                const data = await response.json();
                usageData.push({
                    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    usage: data.prediction.toFixed(2),
                    cost: (0.2958 * data.prediction).toFixed(2)
                });
            } catch (error) {
                console.error('Error fetching daily usage:', error);
            }
        }
        setDailyUsage(usageData);
    };

    return (
        <div className="insights-container">
            <h2>Forecast for Daily Usage for Selected Month</h2>
            <div className="select-container">
                <label htmlFor="monthSelect">Select a Month:</label>
                <select id="monthSelect" onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
            <table className="daily-usage-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Usage (kWh)</th>
                        <th>Cost ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyUsage.map((entry) => (
                        <tr key={entry.date}>
                            <td>{entry.date}</td>
                            <td>{entry.usage}</td>
                            <td>{entry.cost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Insights;