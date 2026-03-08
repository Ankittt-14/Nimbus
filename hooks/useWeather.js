import axios from "axios";
import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";
import { WeatherContext } from "../app/_layout";

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const BASE = process.env.EXPO_PUBLIC_BASE_URL;

export function useWeather() {
  const { globalCity } = useContext(WeatherContext);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchWeather(); }, [globalCity]);

  async function fetchWeather() {
    try {
      setLoading(true);
      setError(null);

      let urlParams = "";

      if (globalCity) {
        urlParams = `q=${globalCity}`;
      } else {
        // Get user's actual location!
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        urlParams = `lat=${location.coords.latitude}&lon=${location.coords.longitude}`;
      }

      // Fetch current weather + forecast AT THE SAME TIME
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`${BASE}/weather?${urlParams}&appid=${API_KEY}&units=metric`),
        axios.get(`${BASE}/forecast?${urlParams}&appid=${API_KEY}&units=metric`)
      ]);

      setWeather(weatherRes.data);
      setForecast(forecastRes.data.list);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { weather, forecast, loading, error, refetch: fetchWeather };
}