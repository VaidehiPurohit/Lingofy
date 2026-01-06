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
        <Route path="lessons" element={<Lessons />} />
        <Route path="scenes" element={<Scenes />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="slang" element={<Slang />} />
        <Route path="home" element={<Home />} />
      </Route>
    </Routes>


    </>
  )
}

export default App