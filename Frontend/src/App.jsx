import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Dashboard/Home'
import Main from './pages/Main'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import DashboardHome from './components/Dashboard/Home';
import Lessons from './components/Dashboard/Lessons';
import Scenes from './components/Dashboard/Scenes';
import Quiz from './components/Dashboard/Quiz';
import Progress from './components/Dashboard/Progress';
import Profile from './components/Dashboard/Profile';
import Slang from './components/Dashboard/Slang';
import PEstructure from './components/Slangs/PopularExpression/PEstructure'
import CGstructure from './components/Slangs/CasualGreeting/CGStructure'
import YSstructure from './components/Slangs/YouthSlang/YSstructure'
import SSstructure from './components/Slangs/SocialSlang/SSstructure'
import GenericScenePage from "./components/Scenes/GenericScenePage";
import PopStructure from './components/Slangs/PopSlang/PopStructure'
import ReactStructure from './components/Slangs/Reactions/ReactStructure'
import Results from './Quiz/Results'
import CaptureAndLearn from './components/Dashboard/ObjectScanner'
import Alphabets from './components/Dashboard/Alphabets'

// ── Lesson index pages ────────────────────────────────────────────────────
import BasicGreetingpage from './components/Lessons/Begineer/BasicGreetingpage'
import NumbersandCount from './components/Lessons/Begineer/NumbersandCount'
import FamilyRel from './components/Lessons/Begineer/FamilyRel'

// ── Speaking Practice + Data ──────────────────────────────────────────────
import SpeakingPractice from './components/Lessons/SpeakingPractice'
import vocabularyData from './components/Lessons/Begineer/vocabularyData'
import numbersData from './components/Lessons/Begineer/numbersData'
import familyData from './components/Lessons/Begineer/familyData'
import colorsData from './components/Lessons/Begineer/colorsData'
import bodyPartsData from './components/Lessons/Begineer/bodyPartsData'
import foodData from './components/Lessons/Begineer/foodData'
import daysData from './components/Lessons/Begineer/daysData'
import directionsData from './components/Lessons/Begineer/directionsData'
import emotionsData from './components/Lessons/Begineer/emotionsData'
import weatherData from './components/Lessons/Begineer/weatherData'

// Intermediate
import businessData from './components/Lessons/Intermediate/businessData'
import travelData from './components/Lessons/Intermediate/travelData'
import socialData from './components/Lessons/Intermediate/socialData'
import healthData from './components/Lessons/Intermediate/healthData'
import techData from './components/Lessons/Intermediate/techData'

// Advanced
import literatureData from './components/Lessons/Advanced/literatureData'
import politicsData from './components/Lessons/Advanced/politicsData'
import scienceData from './components/Lessons/Advanced/scienceData'
import philosophyData from './components/Lessons/Advanced/philosophyData'
import economyData from './components/Lessons/Advanced/economyData'

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const user = localStorage.getItem("lingofy_user");
        const publicPaths = ["/login"];
        if (user && publicPaths.includes(location.pathname)) {
            navigate("/dashboard");
        }
    }, [navigate, location]);

    return (
    <Routes>

      {/* Landing */}
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />}>

        <Route index element={<DashboardHome />} />
        <Route path="home" element={<Home />} />

        {/* Lessons */}
        <Route path="lessons">
          <Route index element={<Lessons />} />

          <Route path="basic-greetings">
            <Route index element={<BasicGreetingpage />} />
            <Route path="speaking-practice" element={<SpeakingPractice data={vocabularyData} title="Basic Greetings" />} />
          </Route>

          <Route path="numbers-counting">
            <Route index element={<NumbersandCount />} />
            <Route path="speaking-practice" element={<SpeakingPractice data={numbersData} title="Numbers & Counting" />} />
          </Route>

          <Route path="family-members">
            <Route index element={<FamilyRel />} />
            <Route path="speaking-practice" element={<SpeakingPractice data={familyData} title="Family Members" />} />
          </Route>

          {/* New beginner lessons */}
          <Route path="colors" element={<SpeakingPractice data={colorsData} title="Colors" />} />
          <Route path="body-parts" element={<SpeakingPractice data={bodyPartsData} title="Body Parts" />} />
          <Route path="food-drinks" element={<SpeakingPractice data={foodData} title="Food & Drinks" />} />
          <Route path="days-time" element={<SpeakingPractice data={daysData} title="Days & Time" />} />
          <Route path="directions" element={<SpeakingPractice data={directionsData} title="Directions & Places" />} />
          <Route path="emotions" element={<SpeakingPractice data={emotionsData} title="Emotions" />} />
          <Route path="weather" element={<SpeakingPractice data={weatherData} title="Weather & Seasons" />} />

          {/* Intermediate lessons */}
          <Route path="intermediate">
            <Route path="business" element={<SpeakingPractice data={businessData} title="Business & Work" />} />
            <Route path="travel" element={<SpeakingPractice data={travelData} title="Travel & Shopping" />} />
            <Route path="social" element={<SpeakingPractice data={socialData} title="Social Events" />} />
            <Route path="health" element={<SpeakingPractice data={healthData} title="Health & Wellness" />} />
            <Route path="tech" element={<SpeakingPractice data={techData} title="Technology" />} />
          </Route>

          {/* Advanced lessons */}
          <Route path="advanced">
            <Route path="literature" element={<SpeakingPractice data={literatureData} title="Literature & Poetry" />} />
            <Route path="politics" element={<SpeakingPractice data={politicsData} title="Politics & Governance" />} />
            <Route path="science" element={<SpeakingPractice data={scienceData} title="Science & Environment" />} />
            <Route path="philosophy" element={<SpeakingPractice data={philosophyData} title="Philosophy & Ethics" />} />
            <Route path="economy" element={<SpeakingPractice data={economyData} title="Economy & Business" />} />
          </Route>
        </Route>

        <Route path="alphabets" element={<Alphabets />} />
        <Route path="scenes" element={<Scenes />} />
        <Route path="scenes/:sceneId" element={<GenericScenePage />} />

        {/* Quiz */}
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/results" element={<Results />} />

        {/* Capture & Learn */}
        <Route path="scanner" element={<CaptureAndLearn />} />

        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />

        {/* Slang */}
        <Route path="slang" element={<Slang />} />
        <Route path="slang/casual-greetings" element={<CGstructure />} />
        <Route path="slang/popular-expressions" element={<PEstructure />} />
        <Route path="slang/youth-slang" element={<YSstructure />} />
        <Route path="slang/social-slang" element={<SSstructure />} />
        <Route path="slang/pop-slang" element={<PopStructure />} />
        <Route path="slang/reactions" element={<ReactStructure />} />

      </Route>

    </Routes>
  )
}

export default App