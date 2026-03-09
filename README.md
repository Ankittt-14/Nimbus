<p align="center">
  <img src="./assets/images/icon.png" width="120" alt="Nimbus App Logo" />
</p>

<h1 align="center">Nimbus Weather</h1>

<p align="center">
  <b>A breathtaking, luxury-focused weather application built with React Native & Expo.</b><br/>
  Featuring cinematic animations, deep contrast interfaces, and precise real-time data powered by OpenWeatherMap.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android"/>
</p>

---

## ✨ Premium Features

- **🎬 Cinematic Launch Screen**
  A beautifully animated startup sequence featuring a rising sun, atmospheric horizon glow, twinkling stars, and floating particles.
- **🎨 Dynamic Weather Themes**
  Background gradients completely adapt to the current weather using `expo-linear-gradient` to perfectly encapsulate the sky outside.
- **📡 Live Radar Display**
  A gorgeous, bespoke static tracking display mocking a lively regional radar for immediate geolocation insights.
- **📍 Smart Location Engine**
  Instantly pull weather data based on your exact GPS coordinates, or manually search via an intuitive interface.
- **🤌 Haptic Excellence**
  Integrated `expo-haptics` across the entire application to provide subtle, tactile feedback confirming user actions.
- **🚀 Ultra-Lightweight UI**
  Crisp, scalable Vector `Feather` icons combined with a custom 3D glowing sphere component for lightning-fast loading speeds on any architecture.

---

## 📸 Interface Sneak Peek

*The interface embraces a dark, cinematic `#0d0800` luxury palette with striking `#E8891A` ambient contrasts.*

| 🌄 Cinematic Launch | ☀️ Dynamic Forecast | 🔍 Smart Search |
| :---: | :---: | :---: |
| *Immersive, glowing particle animations.* | *Real-time hourly conditions at a glance.* | *Lightning-fast, precise global search.* |

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (v0.81)** | Core mobile framework |
| **Expo (SDK 54)** | Development platform |
| **Expo Router** | File-based navigation (`app/` directory) |
| **Axios** | API requests to OpenWeatherMap |
| **AsyncStorage** | Local persistence for recent searches |
| **Expo Linear Gradient** | Dynamic background theming |
| **Expo Haptics** | Tactile physical feedback |
| **Feather Icons** | Lightweight vector iconography |

---

## 🚀 Getting Started

Want to run this premium UI on your own device?

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Ankittt-14/Nimbus.git
cd Nimbus
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Add your API key

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_WEATHER_API_KEY=your_openweather_api_key_here
```
*(You can get a free API key from OpenWeatherMap)*

### 4️⃣ Run the app

```bash
npx expo start
```
Scan the QR code using the **Expo Go** app on your phone.

---

## 📦 Building for Production

This project is fully structured for `eas-cli` deployments. To create an optimized, shareable Android `.apk` file:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

<p align="center">
  <i>Built with ❤️ by Ankit using React Native & Expo</i>
</p>
