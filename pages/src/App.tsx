import { Routes, Route } from 'react-router-dom';
import { Chip, Link } from '@nextui-org/react';
import Home from './pages/Home';
import Details from './pages/Details';
import Player from './pages/Player';
import RainBackground from './components/RainBackground';

const App = () => {
  return (
    <div className="min-h-screen relative">
      {/* Rain sits at z-0 (defined in css) */}
      <RainBackground />
      
      {/* Content Container: z-10 ensures it floats above rain */}
      <div className="relative z-10 p-4">
        {/* Header / Notification */}
        <div className='flex justify-center mb-8'>
          <Chip
            className="glass-panel text-white font-bold border-white/20"
            variant="bordered"
            size='lg'
          >
            hi subscribe to the creator trust
            <Link 
              className="ml-2 text-cyan-300 font-bold" 
              underline="hover" 
              isExternal 
              showAnchorIcon 
              href='https://youtube.com/@mineogo'
            >
              Click Here
            </Link>
          </Chip>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:session" element={<Details />} />
          <Route path="/anime/:session/:episode/stream" element={<Player />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
