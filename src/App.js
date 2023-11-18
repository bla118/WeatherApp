import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [timezone, setTimezone] = useState(0);
  const [forecasts, setForecasts] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [apiKey, setKey] = useState('');
  
  useEffect(() => {
    setKey(process.env.REACT_APP_API_KEY);
    console.log(apiKey)
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${apiKey}&units=metric`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
        setTimezone(data.city.timezone);
        setForecasts(data.list);
        const today = new Date().toISOString().split('T')[0];
        setExpandedDate(today);
        setSearchResults(true);
      } else {
        setSearchResults(false);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const groupForecastsByDate = () => {
    const groupedForecasts = [];
    const forecastGroups = {};

    forecasts.forEach((forecast) => {
      let localTime = getLocalTime(forecast.dt_txt, timezone);

      const date = localTime.split(' ').slice(0, 4).join(' ');

      if (!forecastGroups[date]) {
        forecastGroups[date] = [];
      }
      forecastGroups[date].push(forecast);
    });

    Object.keys(forecastGroups).forEach((date) => {
      groupedForecasts.push({
        date,
        forecasts: forecastGroups[date],
      });
    });

    return groupedForecasts;
  };

  const toggleExpansion = (date) => {
    setExpandedDate((prevExpandedDate) => (prevExpandedDate === date ? null : date));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather();
  };

  const getLocalTime = (utcTime, timezoneOffset) => {
    const utcTimeInSeconds = new Date(utcTime).getTime() / 1000;
    const localTimeInSeconds = utcTimeInSeconds + timezoneOffset;
    const localTimeinMS = localTimeInSeconds * 1000;
    const date = new Date(localTimeinMS);
    return String(date);
  };

  return (
    <div>
      <h1>Weather App</h1>
      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <input
            className="searchBar"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City Name, Country Code"
          />
          <button type="submit">Get Weather</button>
        </form>
      </div>

      <div className="forecast-list">
        {searchResults !== null && (
          <>
            {searchResults ? (
              <>
                <p>Forecast for {weather.city.name}, {weather.city.country}</p>
                <div className="forecast-container">
                  {groupForecastsByDate().map(({ date, forecasts }) => (
                    <div
                      key={date}
                      className={`forecast-card ${expandedDate === date ? 'expanded' : ''}`}
                      onClick={() => toggleExpansion(date)}
                    >
                      <h2 className="forecast-date">{date}</h2>
                      <div className={`forecast-details ${expandedDate === date ? 'expanded' : ''}`}>
                        {forecasts.map((forecast) => (
                          <div key={forecast.dt} className="forecast-detail">
                            <p className="forecast-time">
                              {getLocalTime(forecast.dt_txt, timezone).split(' ').slice(4).join(' ')}
                            </p>
                            <p className="forecast-temp">Temperature: {forecast.main.temp} °C</p>
                            <p className="forecast-description">Weather: {forecast.weather[0].description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>No forecasts found for '{city}'</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
