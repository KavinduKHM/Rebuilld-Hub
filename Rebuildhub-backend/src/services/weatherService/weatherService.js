const axios = require("axios");

// Current Weather 
exports.getWeatherByCity = async (city) => {
    const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
            params: {
                q: city,
                appid: process.env.WEATHER_API_KEY,
                units: "metric"
            }
        }
    );

    return response.data;
};


// 5-Day Forecast
exports.getFiveDayForecast = async (city) => {
    const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
            params: {
                q: city,
                appid: process.env.WEATHER_API_KEY,
                units: "metric"
            }
        }
    );

    return response.data;
};