import API from "./api";

export const getWeather = (city) =>
  API.get("/api/weather", {
    params: { city },
  });

export const getForecast = (city) =>
  API.get("/api/weather/forecast", {
    params: { city },
  });
