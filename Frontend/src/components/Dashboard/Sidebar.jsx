import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  BookOpen,
  MessageSquare,
  Hash,
  Trophy,
  TrendingUp,
  User,
  Sparkles,
} from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const sidebarRef = useRef(null)

  const menuItems = [
    { name: 'Home', href: 'home', icon: Home },
    { name: 'Lessons', href: 'lessons', icon: BookOpen },
    { name: 'Scenes', href: 'scenes', icon: MessageSquare },
    { name: 'Slang', href: 'slang', icon: Hash },
    { name: 'Quiz', href: 'quiz', icon: Trophy },
    { name: 'Progress', href: 'progress', icon: TrendingUp },
    { name: 'Recommendations', href:'recommendation',icon: Sparkles},
    { name: 'Profile', href: 'profile', icon: User },
    
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsSidebarOpen])

  return (
    <aside
      ref={sidebarRef}
      className={`w-60 bg-white border-r border-gray-200 flex flex-col
        transition-transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0`}
    >
      {/* Menu */}
      <nav className="px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-lg font-medium transition
              ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Daily Goal */}
      <div className="mt-auto px-4 pb-6">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-m font-semibold text-indigo-800">
            Daily Goal
          </p>

          <p className="text-s text-gray-600 mt-1">
            0 lessons completed
          </p>

          <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden">
            <div className="h-full w-0 bg-indigo-500 rounded-full" />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            0 / 10 lessons
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
