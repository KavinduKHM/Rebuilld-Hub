const weatherService = require("../../services/weatherService/weatherService");

const getWeather = async (req, res) => {
    try {
        const city = req.query.city;

        const data = await weatherService.getWeatherByCity(city);

        res.json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getForecast = async (req, res) => {
    try {
        const city = req.query.city;

        const data = await weatherService.getFiveDayForecast(city);

        res.json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWeather,
    getForecast
};