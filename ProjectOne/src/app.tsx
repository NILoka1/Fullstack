import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './routes/home';
import Profile from './routes/Profile';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    )
}

export default App