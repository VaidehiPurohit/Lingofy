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
import RestaurantPage from './components/Scenes/Restaurant/RestaurantPage'
import ShoppingPage from './components/Scenes/Shopping/ShoppingPage'
import AirPortPage from './components/Scenes/Airport/AirPortPage'
import UniversityPage from './components/Scenes/University/UniversityPage'
import InterviewPage from './components/Scenes/Interview/InterviewPage'
import DoctorPage from './components/Scenes/Doctor/DoctorPage'
import PopStructure from './components/Slangs/PopSlang/PopStructure'
import ReactStructure from './components/Slangs/Reactions/ReactStructure'
import Results from './Quiz/Results'
import Recommendation from './components/Dashboard/Recommendation'
import Alphabets from './components/Dashboard/Alphabets'
import BasicGreetingpage from './components/Lessons/Begineer/BasicGreetingpage'
import SpeakingPractice from './components/Lessons/SpeakingPractice'
import NumbersandCount from './components/Lessons/Begineer/NumbersandCount'
import vocabularyData from './components/Lessons/Begineer/vocabularyData'
import numbersData from './components/Lessons/Begineer/numbersData'
import familyData from "./components/Lessons/Begineer/familyData";
import FamilyRel from './components/Lessons/Begineer/FamilyRel'

const App = () => {
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
            <Route
              path="speaking-practice"
              element={<SpeakingPractice data={vocabularyData} />}
            />
          </Route>

          <Route path="numbers-counting">
            <Route index element={<NumbersandCount />} />
            <Route
              path="speaking-practice"
              element={<SpeakingPractice data={numbersData} />}
            />
          </Route>

          <Route path="family-members">
            <Route index element={<FamilyRel />} />
            <Route
              path="speaking-practice"
              element={<SpeakingPractice data={familyData} />}
            />
          </Route>
        </Route>

        <Route path="alphabets" element={<Alphabets />} />
        <Route path="scenes" element={<Scenes />} />

        {/* Scenes */}
        <Route path="scenes/restaurant" element={<RestaurantPage />} />
        <Route path="scenes/shopping" element={<ShoppingPage />} />
        <Route path="scenes/airport" element={<AirPortPage />} />
        <Route path="scenes/university" element={<UniversityPage />} />
        <Route path="scenes/interview" element={<InterviewPage />} />
        <Route path="scenes/doctor-appointment" element={<DoctorPage />} />

        {/* Quiz */}
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/results" element={<Results />} />

        <Route path="recommendation" element={<Recommendation />} />
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