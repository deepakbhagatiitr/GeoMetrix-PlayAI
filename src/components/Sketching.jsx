import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DrawingCanvas = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [paths, setPaths] = useState([]); 
    const [currentPath, setCurrentPath] = useState([]);
    const [loopCount, setLoopCount] = useState(1); 
    const [isLooping, setIsLooping] = useState(false); 
    const [shape, setShape] = useState(''); 
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
    
    const [hoveredShape, setHoveredShape] = useState(null); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const ratio = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth * 0.8 * ratio;
            canvas.height = window.innerHeight * 0.8 * ratio;
            canvas.style.width = `${window.innerWidth * 0.8}px`;
            canvas.style.height = `${window.innerHeight * 0.8}px`;
            context.scale(ratio, ratio);
        };

        resizeCanvas();
        context.lineCap = 'round';
        context.lineWidth = 2;
        contextRef.current = context;

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', showShapeName);

        return () => {
            canvas.removeEventListener('mousemove', showShapeName);
        };
    }, [paths]); 


    const startDrawing = ({ nativeEvent }) => {
        if (isLooping) return; 
        if (shape) {
            drawShape(nativeEvent); 
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setCurrentPath([{ offsetX, offsetY }]);
        setIsDrawing(true);
    };
    
    const createTooltip = (x, y, text) => {
        contextRef.current.font = '24px Arial';
        contextRef.current.fillStyle = 'black';
        contextRef.current.fillText(text, x + 10, y - 10);
    };

    const finishDrawing = () => {
        if (isLooping || shape) return; 
        contextRef.current.closePath();
        setIsDrawing(false);
        setPaths((prevPaths) => [...prevPaths, { path: currentPath, shape: null }]); 
        setCurrentPath([]);
        setTooltips([]); 
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || isLooping || shape) return; 
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.strokeStyle = color;
        contextRef.current.stroke();
        setCurrentPath((prevPath) => [...prevPath, { offsetX, offsetY }]);
        setTooltips([]); 
    };


    const clearCanvas = () => {
        const canvas = canvasRef.current;
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        setPaths([]);
        setCurrentPath([]);
    };
    
    
    const showShapeName = (event) => {
        const { offsetX, offsetY } = event.nativeEvent;
        const hovered = paths.find(path => contextRef.current.isPointInPath(path.shapePath, offsetX, offsetY));

        if (hovered) {
            setTooltip({ visible: true, x: offsetX, y: offsetY, text: hovered.shape });
        } else {
            setTooltip({ visible: false, x: 0, y: 0, text: '' });
        }
    };


    
    const drawShape = ({ offsetX, offsetY }) => {
        const context = contextRef.current;
        context.strokeStyle = color;
        context.beginPath();
        let shapePath;

        switch (shape) {
            case 'circle':
                context.arc(offsetX, offsetY, 50, 0, Math.PI * 2);
                shapePath = new Path2D();
                shapePath.arc(offsetX, offsetY, 50, 0, Math.PI * 2);
                break;
            case 'square':
                context.rect(offsetX - 50, offsetY - 50, 100, 100);
                shapePath = new Path2D();
                shapePath.rect(offsetX - 50, offsetY - 50, 100, 100);
                break;
            case 'triangle':
                context.moveTo(offsetX, offsetY - 50);
                context.lineTo(offsetX - 50, offsetY + 50);
                context.lineTo(offsetX + 50, offsetY + 50);
                context.closePath();
                shapePath = new Path2D();
                shapePath.moveTo(offsetX, offsetY - 50);
                shapePath.lineTo(offsetX - 50, offsetY + 50);
                shapePath.lineTo(offsetX + 50, offsetY + 50);
                shapePath.closePath();
                break;
            case 'star':
                shapePath = new Path2D();
                drawStar(context, offsetX, offsetY, 5, 50, 20, shapePath);
                break;
            case 'arrow':
                shapePath = new Path2D();
                drawArrow(context, offsetX, offsetY, shapePath);
                break;
            default:
                break;
        }

        context.stroke();
        setPaths((prevPaths) => [...prevPaths, { path: [{ offsetX, offsetY }], shape, shapePath }]); 
        setShape(''); 
    };



    
    
    const drawStar = (context, cx, cy, spikes, outerRadius, innerRadius, path) => {
        context.beginPath();
        let rot = Math.PI / 2 * 3; 
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes; 

        context.moveTo(cx, cy - outerRadius); 
        if (path) path.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy - Math.sin(rot) * outerRadius;
            context.lineTo(x, y);
            if (path) path.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy - Math.sin(rot) * innerRadius;
            context.lineTo(x, y);
            if (path) path.lineTo(x, y);
            rot += step;
        }

        context.lineTo(cx, cy - outerRadius); 
        context.closePath();
        if (path) path.closePath();
        context.stroke(); 
    };

    
    const drawArrow = (context, x, y, path) => {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 50, y - 25);
        context.lineTo(x + 50, y - 10);
        context.lineTo(x + 100, y - 10);
        context.lineTo(x + 100, y + 10);
        context.lineTo(x + 50, y + 10);
        context.lineTo(x + 50, y + 25);
        context.closePath();
        if (path) {
            path.moveTo(x, y);
            path.lineTo(x + 50, y - 25);
            path.lineTo(x + 50, y - 10);
            path.lineTo(x + 100, y - 10);
            path.lineTo(x + 100, y + 10);
            path.lineTo(x + 50, y + 10);
            path.lineTo(x + 50, y + 25);
            path.closePath();
        }
    };


    
    const drawPath = (pathData, pathIndex, callback) => {
        if (pathIndex < pathData.path.length) {
            const point = pathData.path[pathIndex];
            if (pathIndex === 0) {
                contextRef.current.beginPath();
                contextRef.current.moveTo(point.offsetX, point.offsetY);
            } else {
                contextRef.current.lineTo(point.offsetX, point.offsetY);
                contextRef.current.strokeStyle = color;
                contextRef.current.stroke();
            }
            requestAnimationFrame(() => drawPath(pathData, pathIndex + 1, callback));
        } else {
            contextRef.current.closePath();
            if (callback) callback();
        }
    };

    
    const animateDrawing = (pathIndex, loopIndex, totalLoops, callback) => {
        if (pathIndex < paths.length) {
            const pathData = paths[pathIndex];
            if (pathData.shape) {
                
                drawShapePath(pathData, () => {
                    setTimeout(() => animateDrawing(pathIndex + 1, loopIndex, totalLoops, callback), 500);
                });
            } else {
                
                drawPath(pathData, 0, () => {
                    setTimeout(() => animateDrawing(pathIndex + 1, loopIndex, totalLoops, callback), paths[pathIndex].path.length * 10);
                });
            }
        } else if (loopIndex < totalLoops - 1) {
            setTimeout(() => {
                contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); 
                animateDrawing(0, loopIndex + 1, totalLoops, callback);
            }, 50);
        } else {
            if (callback) callback();
        }
    };

    
    const drawShapePath = (pathData, callback) => {
        const { offsetX, offsetY } = pathData.path[0];
        
        animateShapeDrawing(pathData.shape, offsetX, offsetY, 0, () => {
            if (callback) callback();
        });
    };

    
    const animateShapeDrawing = (shape, offsetX, offsetY, frameCount, callback) => {
        const context = contextRef.current;
        context.strokeStyle = color;
        const totalFrames = 60; 

        context.clearRect(offsetX - 60, offsetY - 60, 120, 120); 

        context.beginPath();
        switch (shape) {
            case 'circle':
                context.arc(offsetX, offsetY, 50 * (frameCount / totalFrames), 0, Math.PI * 2);
                break;
            case 'square':
                context.rect(offsetX - 50, offsetY - 50, 100 * (frameCount / totalFrames), 100 * (frameCount / totalFrames));
                break;
            case 'triangle':
                context.moveTo(offsetX, offsetY - 50 * (frameCount / totalFrames));
                context.lineTo(offsetX - 50 * (frameCount / totalFrames), offsetY + 50 * (frameCount / totalFrames));
                context.lineTo(offsetX + 50 * (frameCount / totalFrames), offsetY + 50 * (frameCount / totalFrames));
                context.closePath();
                break;
            case 'star':
                drawStar(context, offsetX, offsetY, 5, 50 * (frameCount / totalFrames), 20 * (frameCount / totalFrames));
                break;
            case 'arrow':
                drawArrow(context, offsetX, offsetY); 
                break;
            default:
                break;
        }

        context.stroke();

        if (frameCount < totalFrames) {
            requestAnimationFrame(() => animateShapeDrawing(shape, offsetX, offsetY, frameCount + 1, callback));
        } else {
            if (callback) callback();
        }
    };

    const replayDrawing = () => {
        console.log(loopCount);
        const canvas = canvasRef.current;
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        setIsLooping(true); 
        animateDrawing(0, 0, loopCount, () => {
            console.log(`Completed ${loopCount} loops`);
            setIsLooping(false); 
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
            <h1 className="my-4 text-4xl font-bold text-center">Draw Something</h1>
            <div className="flex flex-wrap justify-center w-full max-w-md mx-auto mb-4 md:flex-row">
                <button
                    onClick={clearCanvas}
                    className="px-4 py-2 mb-2 mr-4 font-bold text-white bg-red-500 rounded md:mb-0 hover:bg-red-700"
                >
                    Clear
                </button>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 p-0 mb-2 mr-4 border-0 cursor-pointer md:mb-0"
                />
                <select
                    value={loopCount}
                    onChange={(e) => setLoopCount(parseInt(e.target.value))}
                    className="px-4 py-2 mb-2 mr-4 font-bold text-white bg-green-500 rounded cursor-pointer md:mb-0 "
                >
                    {[...Array(10).keys()].map((num) => (
                        <option key={num + 1} value={num + 1}>
                            {num + 1}
                        </option>
                    ))}
                </select>
                <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    className="px-4 py-2 mb-2 mr-4 font-bold text-white bg-yellow-500 rounded cursor-pointer md:mb-0 "
                >
                    <option value="">Select Shape</option>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                    <option value="star">Star</option>
                    <option value="arrow">Arrow</option>
                </select>
                <button
                    onClick={replayDrawing}
                    className="px-4 py-2 mb-2 font-bold text-white bg-purple-500 rounded cursor-pointer md:mr-4 m md:mb-0 hover:bg-purple-700"
                >
                    Loop
                </button>
                <Link to="/" className="h-full px-4 py-2 font-bold text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                    Go to board
                </Link>
            </div>
            <div className="flex justify-center w-full max-w-3xl mx-auto" style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    className="w-full bg-white border-2 border-gray-300 h-72 md:h-96"
                />
                {tooltip.visible && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${tooltip.x + 10}px`,
                            top: `${tooltip.y - 10}px`,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            pointerEvents: 'none',
                            fontSize: '14px',
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrawingCanvas;
