import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Puzzle from './components/Puzzle';
import DrawingApp from './components/DrawingApp';
import 'tailwindcss/tailwind.css';
import './App.css';
import DrawingCanvas from './components/Sketching';

const App = () => {
    return (
        <Router>

            <Routes>

                <Route path="/" element={<DrawingApp />} />
                <Route path="/sketch" element={<DrawingCanvas />} />
                <Route path="/puzzle" element={<Puzzle />} />
            </Routes>
        </Router>
    );
};

export default App;
