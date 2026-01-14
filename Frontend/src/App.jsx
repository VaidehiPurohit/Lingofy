import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Dashboard/Home'
import Main from './pages/Main'
import Layout from './pages/Layout'
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

const App = () => {
  return (
    <>
    {/* <Routes>
      <Route path ='/' element={<Home/>}/>
      <Route path ='app' element={<Layout/>}/>
      <Route path ='login' element={<Login/>}/>
      <Route path ='dashboard' element={<Dashboard/>}/>

    </Routes> */}

    <Routes>
      {/* Landing */}
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />}>

        <Route index element={<DashboardHome />} />
        <Route path="home" element={<Home />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="scenes" element={<Scenes />} />
        <Route>
          <Route path="/dashboard/scenes/restaurant" element={<RestaurantPage />} />
          <Route path="/dashboard/scenes/shopping" element={<ShoppingPage />} />
          <Route path="/dashboard/scenes/airport" element={<AirPortPage />} />
          <Route path="/dashboard/scenes/university" element={<UniversityPage />} />
          <Route path="/dashboard/scenes/interview" element={<InterviewPage />} />
          <Route path="/dashboard/scenes/doctor-appointment" element={<DoctorPage />} />
        </Route>
         <Route path="quiz" element={<Quiz />} />
  <Route path="quiz/results" element={<Results />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="slang" element={<Slang />} />
         <Route
  path="/dashboard/slang/casual-greetings"
  element={<CGstructure />}
/>
        <Route
  path="/dashboard/slang/popular-expressions"
  element={<PEstructure />}
/>
        <Route
  path="/dashboard/slang/youth-slang"
  element={<YSstructure />}
/>
        <Route
  path="/dashboard/slang/Social-slang"
  element={<SSstructure/>}
/>
        <Route
  path="/dashboard/slang/pop-slang"
  element={<PopStructure/>}
/>
        <Route
  path="/dashboard/slang/reactions"
  element={<ReactStructure/>}
/>
      </Route>
        
       
      
    </Routes>


    </>
  )
}

export default App