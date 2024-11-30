import React, { useState } from 'react';
import { JigsawPuzzle } from 'react-jigsaw-puzzle';
import 'react-jigsaw-puzzle/lib/jigsaw-puzzle.css';
import 'tailwindcss/tailwind.css';
import './App.css'; // Assuming styles.css contains the .puzzle-piece class

const JigsawGame = () => {
    const [imageSrc, setImageSrc] = useState('images/elephant.jpg');
    
    // New state for rows and columns
    const [rows, setRows] = useState(4);
    const [columns, setColumns] = useState(4);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageSrc(URL.createObjectURL(file));
        }
    };

    // New handlers for row and column selection
    const handleRowChange = (event) => {
        setRows(parseInt(event.target.value));
    };

    const handleColumnChange = (event) => {
        setColumns(parseInt(event.target.value));
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-500 to-teal-500">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute p-2 bg-white rounded-lg shadow-md cursor-pointer top-4 left-4"
            />
            <h1 className="mb-8 text-5xl font-extrabold text-white drop-shadow-lg">Jigsaw Puzzle Game</h1>

            {/* New select elements for rows and columns below the file input */}
            <div className="absolute flex space-x-4 p-2 bg-white rounded-lg shadow-md top-20 left-4">
                <div>
                    <label className="block mb-1 text-gray-700">Rows:</label>
                    <select value={rows} onChange={handleRowChange} className="p-2 bg-gray-100 rounded-lg shadow-md">
                        {[...Array(7).keys()].map((i) => (
                            <option key={i} value={i + 4}>{i + 4}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-1 text-gray-700">Columns:</label>
                    <select value={columns} onChange={handleColumnChange} className="p-2 bg-gray-100 rounded-lg shadow-md">
                        {[...Array(7).keys()].map((i) => (
                            <option key={i} value={i + 4}>{i + 4}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-full max-w-3xl bg-white border-4 border-gray-200 rounded-lg shadow-2xl overflow-hidden">
                <JigsawPuzzle
                    imageSrc={imageSrc}
                    rows={rows} // Updated to use dynamic rows
                    columns={columns} // Updated to use dynamic columns
                    onSolved={() => alert('Puzzle solved!')}
                    pieceClass="puzzle-piece"
                />
            </div>
        </div>
    );
};

export default JigsawGame;
