import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';


const DrawingApp = () => {
    const canvasRef = useRef(null);
    const [commands, setCommands] = useState([]);
    const [shape, setShape] = useState('');
    const strokeWidth = 4;
    const [loopCount, setLoopCount] = useState(1);
    // const [jumpX, inputValues.jumpX] = useState(0);
    // const [jumpY, inputValues.jumpY] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [inputValues, setInputValues] = useState({
        jumpX: 0,
        jumpY: 0
    });
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            clearCanvas(ctx); // Clear the canvas
            executeCommands();
        }
    }, [commands, shape, loopCount]);
    // const handleLoopCountChange = (e) => {
    //     setLoopCount(parseInt(e.target.value, 10));
    // };
    const handleCategoryClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null); // Close the paragraphs if clicked again
        } else {
            setSelectedCategory(category);
        }
    };

    const handleDragStart = (event, type, label) => {
        event.dataTransfer.setData('text/plain', label);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const label = event.dataTransfer.getData('text/plain');

        if (['Circle', 'Square', 'Star', 'Triangle'].includes(label)) {
            setShape(label);
            handleCommand('shape', label);
        } else if (label === 'loop') {
            // Create a new element for the loop command
            const workspace = document.getElementById('workspace');
            const newNode = document.createElement('div');
            newNode.classList.add('dropped-command');

            // Set up the loop command HTML including a select dropdown for loop counts

            newNode.innerHTML = `
            <div class='mb-4'>
            <label>Loop:</label>
            <select class="loop-count-dropdown ml-2 p-1 border border-gray-300 rounded bg-white">
                ${Array.from({ length: 10 }, (_, i) => i + 1).map((count) => `<option value="${count}">${count}</option>`).join('')}
            </select>
            </div>

        `;

            // Append the loop command to the workspace
            workspace.appendChild(newNode);

            // Add event listener to the dropdown to handle changes
            newNode.querySelector('.loop-count-dropdown').addEventListener('change', handleInputChange);

            // Clear the selected category to close the paragraph
            setSelectedCategory(null);
        } else {
            // Handle other commands like movement
            const workspace = document.getElementById('workspace');
            const newNode = document.createElement('div');
            newNode.innerHTML = document.getElementById(label).outerHTML;
            newNode.classList.add('dropped-command');
            workspace.appendChild(newNode);
            newNode.querySelectorAll('input').forEach((input) => {
                input.addEventListener('input', handleInputChange);
            });

            // Clear the selected category to close the paragraph
            setSelectedCategory(null);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        console.log(name)
        if (name === 'jumpX') {
            const newX = parseInt(value, 10);
            inputValues.jumpX = newX;
            console.log(newX, inputValues.jumpY)
            console.log("x");
            handleCommand('jump', [newX, inputValues.jumpY]);
        } else if (name === 'jumpY') {
            const newY = parseInt(value, 10);
            inputValues.jumpY = (newY);
            console.log(inputValues.jumpX, newY)

            handleCommand('jump', [inputValues.jumpX, newY]);
            console.log('y');
        }
        else if (name === 'loopCount') {
            console.log("loop");
            setLoopCount(parseInt(value));
        } else {
            handleCommand(name, parseInt(value, 10));
        }
    };
    const handleCommand = (command, value) => {
        const canvas = canvasRef.current;
        const commandValue = command === 'jump' ? value : parseInt(value, 10);

        if (command === 'jump') {
            value[0] = Math.max(0, Math.min(canvas.width, value[0]));
            value[1] = Math.max(0, Math.min(canvas.height, value[1]));
        }

        setCommands((prevCommands) => [...prevCommands, { command, value: commandValue }]);
    };
    const executeShapeCommand = (ctx, shape, x, y) => {
        // clearCanvas(ctx); // Clear the canvas before drawing a new shape
        drawShape(ctx, shape, x, y); // Draw the new shape
        setShape(''); // Reset the shape after drawing
    };
    const executeCommands = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = 'red';

        for (let loop = 0; loop < loopCount; loop++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let x = canvas.width / 2;
            let y = canvas.height / 2;
            let angle = 0;

            for (const { command, value } of commands) {
                if (command !== 'jump' && command !== 'shape') {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                }

                switch (command) {
                    case 'moveForward':
                        for (let i = 0; i < value; i++) {
                            x += Math.cos((angle * Math.PI) / 180);
                            y += Math.sin((angle * Math.PI) / 180);
                            ctx.lineTo(x, y);
                            ctx.stroke();
                            await new Promise((r) => setTimeout(r, 1)); // Reduced delay
                        }
                        break;
                    case 'moveBackward':
                        for (let i = 0; i < value; i++) {
                            x -= Math.cos((angle * Math.PI) / 180);
                            y -= Math.sin((angle * Math.PI) / 180);
                            ctx.lineTo(x, y);
                            ctx.stroke();
                            await new Promise((r) => setTimeout(r, 1)); // Reduced delay
                        }
                        break;
                    case 'turnLeft':
                        angle = (angle - value) % 360;
                        if (angle < 0) angle += 360;
                        break;
                    case 'turnRight':
                        angle = (angle + value) % 360;
                        if (angle < 0) angle += 360;
                        break;
                    case 'jump':
                        x = value[0];
                        y = value[1];
                        break;
                    case 'shape':
                        await drawShape(ctx, shape, x, y);
                        break;
                    default:
                        break;
                }

                x = Math.max(0, Math.min(canvas.width, x));
                y = Math.max(0, Math.min(canvas.height, y));

                if (command !== 'jump' && command !== 'shape') {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
            await new Promise((r) => setTimeout(r, 1000));
        }
    };

    const clearCanvas = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const drawShape = async (ctx, shape, x, y) => {
        switch (shape) {
            case 'Circle':
                await drawCircle(ctx, x, y, 50);
                break;
            case 'Square':
                await drawSquare(ctx, x, y, 50);
                break;
            case 'Star':
                await drawStar(ctx, x, y, 5, 30, 15);
                break;
            case 'Triangle':
                await drawTriangle(ctx, x, y, 50);
                break;
            default:
                break;
        }
    };


    const drawCircle = async (ctx, cx, cy, radius) => {
        ctx.beginPath(); // Start a new path
        for (let angle = 0; angle <= 360; angle += 5) {
            const x = cx + radius * Math.cos((angle * Math.PI) / 180);
            const y = cy + radius * Math.sin((angle * Math.PI) / 180);
            if (angle === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            await new Promise((r) => setTimeout(r, 1)); // Reduced delay
        }
        ctx.closePath(); // Close the path
    };

    const drawSquare = async (ctx, cx, cy, size) => {
        ctx.beginPath(); // Start a new path
        const corners = [
            [cx - size / 2, cy - size / 2],
            [cx + size / 2, cy - size / 2],
            [cx + size / 2, cy + size / 2],
            [cx - size / 2, cy + size / 2],
        ];
        for (let i = 0; i < corners.length; i++) {
            const [x, y] = corners[i];
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            await new Promise((r) => setTimeout(r, 100)); // Reduced delay
        }
        ctx.lineTo(corners[0][0], corners[0][1]);
        ctx.closePath(); // Close the path
        ctx.stroke();
    };

    const drawStar = async (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
        ctx.beginPath(); // Start a new path
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath(); // Close the path
        ctx.stroke();
    };

    const drawTriangle = async (ctx, cx, cy, size) => {
        const height = (Math.sqrt(3) / 2) * size;
        ctx.beginPath(); // Start a new path
        ctx.moveTo(cx, cy - height / 2);
        ctx.lineTo(cx - size / 2, cy + height / 2);
        ctx.lineTo(cx + size / 2, cy + height / 2);
        ctx.closePath(); // Close the path
        ctx.stroke();
    };

    const handleJumpInputChange = (axis) => (e) => {
        const value = parseInt(e.target.value, 10);
        if (axis === 'x') {
            inputValues.jumpX(value);
            handleCommand('jump', [value, jumpY]);
        } else if (axis === 'y') {
            inputValues.jumpY(value);
            handleCommand('jump', [jumpX, value]);
        }
    };




    const renderCategoryContent = () => {
        switch (selectedCategory) {
            case 'actions':
                return (
                    <div className="w-full rounded-lg md:px-4 sm:max-w-md md:max-w-lg lg:max-w-xl">
                        <div
                            id="moveForward"
                            className="flex flex-wrap items-center p-2 mb-4 text-sm text-gray-700 bg-blue-100 border rounded shadow-inner cursor-move hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'Move Forward', 'moveForward')}
                        >
                            Move Forward by
                            <input
                                type="text"
                                onChange={handleInputChange}
                                name="moveForward"
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                                placeholder="??"
                            />
                            units
                        </div>
                        <div
                            id="moveBackward"
                            className="flex flex-wrap items-center p-2 mb-4 text-sm text-gray-700 bg-blue-100 border rounded shadow-inner cursor-move hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'Move Backward', 'moveBackward')}
                        >
                            Move Backward by
                            <input
                                type="text"
                                name="moveBackward"
                                onChange={handleInputChange}
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                                placeholder="??"
                            /> units
                        </div>
                        <div
                            id="turnLeft"
                            className="flex flex-wrap items-center p-2 mb-4 text-sm text-gray-700 bg-blue-100 border rounded shadow-inner cursor-move hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'Turn Left', 'turnLeft')}
                        >
                            Turn Left by
                            <input
                                type="text"
                                name="turnLeft"
                                onChange={handleInputChange}
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                                placeholder="??"
                            /> degrees
                        </div>
                        <div
                            id="turnRight"
                            className="flex flex-wrap items-center p-2 mb-4 text-sm text-gray-700 bg-blue-100 border rounded shadow-inner cursor-move hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'Turn Right', 'turnRight')}
                        >
                            Turn Right by
                            <input
                                type="text"
                                name="turnRight"
                                onChange={handleInputChange}
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                                placeholder="??"
                            /> degrees
                        </div>
                        <div
                            id="jumpPosition"
                            className="flex flex-wrap items-center p-2 text-sm text-gray-700 bg-blue-100 border rounded shadow-inner cursor-move hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'Jump to Position', 'jumpPosition')}
                        >
                            Jump to Position X:
                            <input
                                type="text"
                                onChange={handleInputChange}
                                name="jumpX"
                                placeholder="x"
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                            />
                            Y:
                            <input
                                type="text"
                                onChange={handleInputChange}
                                name="jumpY"
                                placeholder="y"
                                className="p-1 mt-2 ml-2 text-sm border rounded-md focus:outline-none sm:mt-0"
                            />
                        </div>
                    </div>

                );
            case 'loops':
                return (
                    <div
                        id="loop"
                        className="flex items-center p-2 bg-white border border-gray-300 rounded-lg shadow-md cursor-move command sm:flex-row sm:items-center sm:justify-between"
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'loops', 'loop')}
                    >
                        <span className="mb-2 mr-2 sm:mb-0">Loop</span>
                        <select
                            value={loopCount}
                            name="loopCount"
                            onChange={handleInputChange}
                            className="px-2 py-1 border border-gray-300 rounded-md"
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => (
                                <option key={count} value={count}>
                                    {count}
                                </option>
                            ))}
                        </select>
                    </div>

                );
            case 'functions':
                return (
                    <div className="max-w-sm px-4 mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl">

                        <p
                            id="Circle"
                            className="p-2 mb-2 text-center bg-white border rounded-lg cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'Circle')}
                        >
                            Circle
                        </p>
                        <p
                            id="Square"
                            className="p-2 mb-2 text-center bg-white border rounded-lg cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'Square')}
                        >
                            Square
                        </p>
                        <p
                            id="Star"
                            className="p-2 mb-2 text-center bg-white border rounded-lg cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'Star')}
                        >
                            Star
                        </p>
                        <p
                            id="Triangle"
                            className="p-2 text-center bg-white border rounded-lg cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'Triangle')}
                        >
                            Triangle
                        </p>
                    </div>

                );
            default:
                return null;
        }
    };

    const handleShapeSelection = (shape) => {
        setShape(shape);
        handleCommand('shape', shape);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="flex flex-col p-4 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 md:flex-row md:items-center md:justify-between">
                <div className="text-xl font-bold md:text-2xl ">Instructions</div>
                <div className="mt-2 text-base md:mt-0 md:text-base lg:text-base">
                Produce a visually captivating and intricate piece of artwork!
                </div>
            </header>


            <main className="flex flex-col flex-grow md:flex-row">
                <div className="flex flex-col justify-start w-full p-4 bg-white border-b border-gray-200 shadow-md md:w-4/12 md:border-r md:border-b-0">
                    <canvas ref={canvasRef} width={600} height={600} className="w-full h-auto border rounded-lg shadow"></canvas>
                    <Link to="/sketch" className='px-6 py-3 mt-4 text-center text-white transition duration-300 bg-blue-500 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50'>
                        Go to Sketch
                    </Link>
                </div>
                <aside className="flex flex-col w-full md:flex-row md:w-8/12">
                    <div className="w-full p-4 bg-white border-b border-gray-200 shadow-md md:w-auto md:border-r md:border-b-0">
                        <div className="w-full p-2 mb-4 text-sm font-semibold text-center text-white rounded-lg shadow-md bg-gradient-to-r from-gray-700 to-gray-900">
                            Blocks
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start">
                            <div className="flex flex-col w-full mb-4 space-y-3 md:mb-0">
                                <button
                                    onClick={() => handleCategoryClick('actions')}
                                    className="p-2 text-left transition duration-200 bg-blue-200 rounded-lg shadow-md hover:bg-blue-300"
                                >
                                    Actions
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('functions')}
                                    className="p-2 text-left transition duration-200 bg-blue-200 rounded-lg shadow-md hover:bg-blue-300"
                                >
                                    Functions
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('loops')}
                                    className="p-2 text-left transition duration-200 bg-blue-200 rounded-lg shadow-md hover:bg-blue-300"
                                >
                                    Loops
                                </button>
                            </div>
                            <div className="w-full ml-0 md:ml-4 md:w-auto">
                                {renderCategoryContent()}
                            </div>
                        </div>
                    </div>


                    <div className="flex-grow w-full p-4 bg-white shadow-md">
                        <div className="flex justify-between mb-4 text-sm font-semibold text-gray-700">
                            <span>Workspace</span>
                            <button className="text-blue-700 hover:underline" onClick={() => document.getElementById('workspace').innerHTML = ''}>Start Over</button>
                        </div>
                        <div id="workspace" onDrop={handleDrop} onDragOver={handleDragOver} className="p-2 overflow-auto bg-gray-100 rounded-lg shadow-inner md:h-full">
                            {/* Dropped content will appear here */}
                        </div>
                    </div>
                </aside>
            </main>
            <footer className="flex items-center justify-between p-4 text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 ">
                <div className="mb-2 md:mb-0">GazeAI</div>
                <div>© 2024</div>
            </footer>

        </div>
    );
};

export default DrawingApp;
