// Background gradient colors for each weather type
export const weatherThemes = {
  Clear: ["#FFD700", "#FF8C00"],   // warm gold
  ClearNight: ["#0f2027", "#203a43", "#2c5364"], // deep night sky
  Clouds: ["#636FA4", "#E8CBC0"],   // soft purple-gray
  CloudsNight: ["#141E30", "#243B55"],   // dark gray clouds at night
  Rain: ["#1a1a2e", "#16213e"],   // dark navy
  Drizzle: ["#2c3e50", "#3498db"],   // blue-gray
  Thunderstorm: ["#0f0c29", "#302b63"],   // deep purple
  Snow: ["#e0eafc", "#cfdef3"],   // icy white
};

export function getGradient(condition, iconCode) {
  // OpenWeather icon codes end in 'n' for night (e.g. 01n = clear night)
  const isNight = iconCode?.endsWith('n');
  const themeKey = isNight && weatherThemes[`${condition}Night`] ? `${condition}Night` : condition;
  return weatherThemes[themeKey] || ["#2a1a08", "#1a0e04"];
}

// The timezoneOffset from OpenWeather is in Seconds. 
// We must shift from true UTC by the city's seconds, 
// AND subtract the smartphone's local timezone offset so JS Date doesn't double-count it.
export function formatHour(timestamp, timezoneOffset = 0) {
  const localOffsetMins = new Date().getTimezoneOffset(); // e.g. -330 for India (mins)
  const cityOffsetMins = timezoneOffset / 60;            // OpenWeather gives seconds

  // timestamp is UTC. We add the difference between City Timezone and Device Timezone
  const diffMins = cityOffsetMins + localOffsetMins;
  const cityTime = new Date((timestamp + (diffMins * 60)) * 1000);

  return cityTime.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}

export function formatDay(timestamp, timezoneOffset = 0) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const localOffsetMins = new Date().getTimezoneOffset();
  const cityOffsetMins = timezoneOffset / 60;

  const diffMins = cityOffsetMins + localOffsetMins;
  const cityTime = new Date((timestamp + (diffMins * 60)) * 1000);

  return days[cityTime.getDay()];
}