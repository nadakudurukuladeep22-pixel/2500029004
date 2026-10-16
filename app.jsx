
import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather(event) {
    event.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Find the city's latitude and longitude
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to find city information.");
      }

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error("City not found. Please try another name.");
      }

      // Step 2: Fetch the current weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        name: place.name,
        country: place.country || "",
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        condition: getCondition(weatherData.current.weather_code),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function getCondition(code) {
    if (code === 0) return "Clear sky";
    if ([1, 2].includes(code)) return "Mainly clear / partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code))
      return "Snow";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Variable conditions";
  }

  return (
    <main className="dashboard">
      <section className="weather-card">
        <p className="eyebrow">WEATHER INFORMATION</p>
        <h1>Weather Dashboard</h1>
        <p className="subtitle">
          Discover the current weather in your city.
        </p>

        <form onSubmit={getWeather} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city name..."
            aria-label="City name"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-results">
            <div className="location">
              <span className="weather-icon">🌤️</span>
              <h2>{weather.name}</h2>
              <p>{weather.country}</p>
              <p className="condition">{weather.condition}</p>
            </div>

            <div className="temperature">
              {weather.temperature}°C
            </div>

            <div className="details">
              <div className="detail">
                <span>Feels like</span>
                <strong>{weather.feelsLike}°C</strong>
              </div>
              <div className="detail">
                <span>Humidity</span>
                <strong>{weather.humidity}%</strong>
              </div>
              <div className="detail">
                <span>Wind speed</span>
                <strong>{weather.wind} km/h</strong>
              </div>
            </div>
          </div>
        )}

        <footer>Weather data powered by Open-Meteo</footer>
      </section>
    </main>
  );
}

export default App;
