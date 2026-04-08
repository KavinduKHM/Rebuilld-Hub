import React, { useEffect, useState } from "react";
import { getForecast, getWeather } from "../../services/weatherService";

const formatTime = (unixSeconds) => {
  if (!unixSeconds) return "-";
  return new Date(unixSeconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (dateText) => {
  if (!dateText) return "-";
  return new Date(dateText).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const WeatherPage = () => {
  const [cityInput, setCityInput] = useState("Colombo");
  const [city, setCity] = useState("Colombo");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError("");

      try {
        const [weatherRes, forecastRes] = await Promise.all([
          getWeather(city),
          getForecast(city),
        ]);

        setWeather(weatherRes.data);
        setForecast((forecastRes.data?.list || []).slice(0, 8));
      } catch (err) {
        setWeather(null);
        setForecast([]);
        setError(err.response?.data?.message || "Unable to load weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!cityInput.trim()) return;
    setCity(cityInput.trim());
  };

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="section-label">Weather Monitoring</span>
            <h1 className="page-title">Live Weather Center</h1>
            <p className="page-subtitle">
              View current weather and 5-day forecast using the backend weather routes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="page-card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.8rem" }}>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city (e.g., Colombo)"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Loading..." : "Get Weather"}
            </button>
          </div>
        </form>

        {error && (
          <div className="empty-state" style={{ color: "#b4232c", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {weather && (
          <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "1rem" }}>
            <div className="page-card">
              <span className="section-label">Current</span>
              <h2 style={{ marginBottom: "0.35rem" }}>
                {weather.name}, {weather.sys?.country}
              </h2>
              <p style={{ color: "#4f6b9d", textTransform: "capitalize" }}>
                {weather.weather?.[0]?.description || "-"}
              </p>
              <h3 style={{ fontSize: "2rem", marginTop: "0.6rem" }}>
                {Math.round(weather.main?.temp ?? 0)}°C
              </h3>
            </div>

            <div className="page-card">
              <span className="section-label">Details</span>
              <p>Feels Like: {Math.round(weather.main?.feels_like ?? 0)}°C</p>
              <p>Humidity: {weather.main?.humidity ?? "-"}%</p>
              <p>Wind: {weather.wind?.speed ?? "-"} m/s</p>
              <p>Pressure: {weather.main?.pressure ?? "-"} hPa</p>
            </div>

            <div className="page-card">
              <span className="section-label">Sun</span>
              <p>Sunrise: {formatTime(weather.sys?.sunrise)}</p>
              <p>Sunset: {formatTime(weather.sys?.sunset)}</p>
              <p>Updated: {formatTime(weather.dt)}</p>
            </div>
          </div>
        )}

        <div className="page-card">
          <div className="page-header" style={{ marginBottom: "0.8rem" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Forecast</h2>
          </div>

          {forecast.length === 0 && !loading ? (
            <p className="empty-state">No forecast data available.</p>
          ) : (
            <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {forecast.map((entry) => (
                <div key={entry.dt} className="card">
                  <p style={{ fontWeight: 700 }}>{formatDateTime(entry.dt_txt)}</p>
                  <p style={{ textTransform: "capitalize", color: "#4f6b9d" }}>
                    {entry.weather?.[0]?.description || "-"}
                  </p>
                  <p style={{ marginTop: "0.4rem" }}>
                    Temp: {Math.round(entry.main?.temp ?? 0)}°C
                  </p>
                  <p>Humidity: {entry.main?.humidity ?? "-"}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
