import React, { useEffect, useState } from "react";
import { getForecast, getWeather } from "../../services/weatherService";
import { useAlert } from "../../context/AlertContext";
import {
  MdAir,
  MdCompress,
  MdLocationOn,
  MdOutlineCalendarToday,
  MdOutlineMap,
  MdSearch,
  MdSpeed,
  MdThermostat,
  MdWarningAmber,
  MdWbSunny,
  MdWaterDrop,
  MdCloud,
  MdThunderstorm,
  MdAcUnit,
  MdHealthAndSafety,
  MdWhatshot,
  MdVisibility,
} from "react-icons/md";

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

const formatDay = (dateText) => {
  if (!dateText) return "-";
  return new Date(dateText).toLocaleDateString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

const conditionIcon = (condition) => {
  const key = (condition || "").toLowerCase();
  if (key.includes("thunder")) return <MdThunderstorm />;
  if (key.includes("rain") || key.includes("drizzle")) return <MdWaterDrop />;
  if (key.includes("snow")) return <MdAcUnit />;
  if (key.includes("cloud")) return <MdCloud />;
  return <MdWbSunny />;
};

const summarizeForecast = (list) => {
  if (!Array.isArray(list)) return [];

  const grouped = list.reduce((acc, item) => {
    const dayKey = item.dt_txt?.slice(0, 10);
    if (!dayKey) return acc;
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(item);
    return acc;
  }, {});

  return Object.values(grouped)
    .slice(0, 5)
    .map((entries) => {
      const preferred = entries.find((e) => e.dt_txt?.includes("12:00:00")) || entries[0];
      return {
        dt: preferred.dt,
        dt_txt: preferred.dt_txt,
        temp: preferred.main?.temp,
        min: preferred.main?.temp_min,
        max: preferred.main?.temp_max,
        humidity: preferred.main?.humidity,
        pop: Math.round((preferred.pop || 0) * 100),
        condition: preferred.weather?.[0]?.main || "Clear",
        description: preferred.weather?.[0]?.description || "-",
      };
    });
};

const WeatherPage = () => {
  const [cityInput, setCityInput] = useState("Colombo");
  const [city, setCity] = useState("Colombo");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showAlert } = useAlert();

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
        setForecast(summarizeForecast(forecastRes.data?.list || []));
      } catch (err) {
        setWeather(null);
        setForecast([]);
        const message = err.response?.data?.message || "Unable to load weather data.";
        setError(message);
        showAlert(message, { variant: "error" });
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

  const todayLabel = weather?.dt ? formatDateTime(new Date(weather.dt * 1000).toISOString()) : "-";
  const weatherMain = weather?.weather?.[0]?.main || "Clear";
  const weatherDescription = weather?.weather?.[0]?.description || "-";
  const mapQuery = weather?.coord
    ? `${weather.coord.lat},${weather.coord.lon}`
    : city;

  return (
    <div className="page-shell">
      <div className="container">
        <section className="page-card" style={{ marginBottom: "1rem", background: "linear-gradient(180deg, rgba(247,250,255,0.92), rgba(236,244,255,0.82))" }}>
          <div className="page-header" style={{ marginBottom: "1.1rem" }}>
            <div style={{ width: "100%", textAlign: "center" }}>
              <span className="section-label" style={{ color: "#2f5fbe" }}>Weather Intelligence</span>
              <h1 className="page-title" style={{ marginBottom: "0.45rem" }}>Global Meteorological Hub</h1>
              <p className="page-subtitle" style={{ margin: "0 auto" }}>
                Real-time weather tracking and predictive analytics to empower disaster
                response and community resilience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ width: "min(760px, 100%)", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.8rem" }}>
              <div style={{ position: "relative" }}>
                <MdSearch style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#8fa3ca" }} />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city name for local weather data..."
                  required
                  style={{ paddingLeft: "2.2rem" }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: "150px" }}>
                {loading ? "Loading..." : "Get Weather"}
              </button>
            </div>
          </form>
        </section>

        {weather && (
          <div className="page-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr", marginBottom: "1rem" }}>
            <div className="page-card" style={{ padding: "1.15rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                <div>
                  <h2 style={{ marginBottom: "0.2rem", fontSize: "2rem" }}>
                    {weather.name}, {weather.sys?.country}
                  </h2>
                  <p style={{ color: "#4f6b9d", marginBottom: "0.25rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <MdOutlineCalendarToday /> {todayLabel}
                  </p>
                </div>
                <div style={{ fontSize: "2.5rem", color: "#1f5fd2" }}>{conditionIcon(weatherMain)}</div>
              </div>

              <div style={{ display: "flex", alignItems: "end", gap: "1rem", marginTop: "0.85rem" }}>
                <h3 style={{ fontSize: "4rem", lineHeight: 0.95, letterSpacing: "-0.03em" }}>{Math.round(weather.main?.temp ?? 0)}°C</h3>
                <div style={{ color: "#5f79ab", fontWeight: 700 }}>
                  <div>↑ {Math.round(weather.main?.temp_max ?? 0)}°</div>
                  <div>↓ {Math.round(weather.main?.temp_min ?? 0)}°</div>
                </div>
              </div>

              <p style={{ color: "#1f5fd2", fontWeight: 700, textTransform: "capitalize", marginTop: "0.4rem" }}>
                {weatherDescription}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.55rem", marginTop: "1rem" }}>
                <div className="card" style={{ padding: "0.7rem" }}>
                  <p style={{ fontSize: "0.62rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feels Like</p>
                  <strong style={{ fontSize: "1.15rem" }}>{Math.round(weather.main?.feels_like ?? 0)}°C</strong>
                </div>
                <div className="card" style={{ padding: "0.7rem" }}>
                  <p style={{ fontSize: "0.62rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.08em" }}><MdWaterDrop /> Humidity</p>
                  <strong style={{ fontSize: "1.15rem" }}>{weather.main?.humidity ?? "-"}%</strong>
                </div>
                <div className="card" style={{ padding: "0.7rem" }}>
                  <p style={{ fontSize: "0.62rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.08em" }}><MdAir /> Wind</p>
                  <strong style={{ fontSize: "1.15rem" }}>{weather.wind?.speed ?? "-"} m/s</strong>
                </div>
                <div className="card" style={{ padding: "0.7rem" }}>
                  <p style={{ fontSize: "0.62rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.08em" }}><MdCompress /> Pressure</p>
                  <strong style={{ fontSize: "1.15rem" }}>{weather.main?.pressure ?? "-"} hPa</strong>
                </div>
                <div className="card" style={{ padding: "0.7rem" }}>
                  <p style={{ fontSize: "0.62rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.08em" }}><MdVisibility /> Visibility</p>
                  <strong style={{ fontSize: "1.15rem" }}>{weather.visibility ? `${Math.round(weather.visibility / 1000)} km` : "-"}</strong>
                </div>
              </div>
            </div>

            <div className="page-card" style={{ padding: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.55rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><MdOutlineMap /> Precipitation Radar</h3>
                <span style={{ fontSize: "0.72rem", color: "#2f5fbe", textTransform: "uppercase", letterSpacing: "0.08em" }}>Expand Map</span>
              </div>
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(191, 219, 254, 0.7)",
                  height: "100%",
                  minHeight: "342px",
                }}
              >
                <iframe
                  title="Precipitation Radar Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=10&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "342px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        <div className="page-card" style={{ marginBottom: "1rem" }}>
          <div className="page-header" style={{ marginBottom: "0.8rem" }}>
            <h2 style={{ fontSize: "1.8rem" }}>5-Day Regional Forecast</h2>
          </div>

          {forecast.length === 0 && !loading ? (
            <p className="empty-state">No forecast data available.</p>
          ) : (
            <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {forecast.map((entry) => (
                <div key={entry.dt} className="card" style={{ padding: "0.9rem", borderRadius: "14px" }}>
                  <p style={{ fontSize: "0.7rem", color: "#6f84b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{formatDay(entry.dt_txt)}</p>
                  <div style={{ fontSize: "2rem", color: "#2563eb", marginBottom: "0.2rem" }}>{conditionIcon(entry.condition)}</div>
                  <p style={{ textTransform: "capitalize", color: "#344f85", marginBottom: "0.2rem" }}>
                    {entry.weather?.[0]?.description || "-"}
                  </p>
                  <p style={{ marginTop: "0.4rem", fontSize: "1.8rem", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {Math.round(entry.temp ?? 0)}°
                    <span style={{ fontSize: "1rem", color: "#6f84b0" }}> / {Math.round(entry.min ?? 0)}°</span>
                  </p>
                  <div style={{ marginTop: "0.65rem", height: "4px", borderRadius: "999px", background: "#dbe6fb", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(Math.max(entry.pop || 0, 5), 100)}%`, height: "100%", background: entry.pop > 70 ? "#ef4444" : "#2563eb" }} />
                  </div>
                  <p style={{ marginTop: "0.35rem", fontSize: "0.72rem", color: "#2f5fbe", fontWeight: 700 }}>{entry.pop}% chance</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "0.8rem" }}>
          <div className="page-card" style={{ borderLeft: "3px solid #cf2f2f" }}>
            <h3 style={{ fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}><MdWarningAmber color="#cf2f2f" /> Flash Flood Warning</h3>
            <p style={{ color: "#5f79ab", lineHeight: 1.5 }}>Active monitoring for low-lying areas. Residents are advised to stay alert.</p>
            <p style={{ marginTop: "0.7rem", color: "#cf2f2f", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Monitoring</p>
          </div>
          <div className="page-card" style={{ borderLeft: "3px solid #2b63c9" }}>
            <h3 style={{ fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}><MdHealthAndSafety color="#2b63c9" /> Air Quality: Moderate</h3>
            <p style={{ color: "#5f79ab", lineHeight: 1.5 }}>AQI index remains manageable for most individuals; sensitive groups should use caution.</p>
            <p style={{ marginTop: "0.7rem", color: "#2b63c9", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Detailed Report</p>
          </div>
          <div className="page-card" style={{ borderLeft: "3px solid #d08a24" }}>
            <h3 style={{ fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}><MdWhatshot color="#d08a24" /> Heat Stress Advisory</h3>
            <p style={{ color: "#5f79ab", lineHeight: 1.5 }}>Humidity can raise perceived temperatures significantly during midday periods.</p>
            <p style={{ marginTop: "0.7rem", color: "#d08a24", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Safety Protocols</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
