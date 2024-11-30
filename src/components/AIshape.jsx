import React, { useRef, useEffect } from 'react';
import paper from 'paper';

const ShapeDrawer = () => {
    const canvasRef = useRef(null);
    let path = null;

    useEffect(() => {
        paper.setup(canvasRef.current);

        const tool = new paper.Tool();

        tool.onMouseDown = (event) => {
            console.log("Mouse down at:", event.point);
            if (path) {
                path.remove();
                console.log("Existing path removed");
            }
            path = new paper.Path({
                segments: [event.point],
                strokeColor: 'black',
                strokeWidth: 2,
            });
            console.log("New path created with initial segment:", event.point);
        };

        tool.onMouseDrag = (event) => {
            console.log("Mouse dragging at:", event.point);
            path.add(event.point);
            console.log("Point added to path:", event.point);
        };

        tool.onMouseUp = () => {
            console.log("Mouse up, path creation finished.");
            if (path) {
                path.simplify();
                console.log("Path simplified:", path);
                completeShape(path);
            }
        };

        return () => {
            paper.view.remove();
            console.log("Paper view removed");
        };
    }, []);

    const completeShape = (roughPath) => {
        console.log("Completing shape for path:", roughPath);
        const points = roughPath.segments.map(seg => seg.point);
        const boundingBox = roughPath.bounds;

        console.log("Collected points:", points);
        console.log("Bounding box of the path:", boundingBox);

        if (points.length >= 3) {
            const hullPoints = convexHull(points);
            console.log("Convex hull points:", hullPoints);

            const shapeType = detectShape(hullPoints, boundingBox, points.length);
            console.log("Detected shape type:", shapeType);

            path.remove();
            if (shapeType === 'circle') {
                drawCircle(boundingBox);
            } else if (shapeType === 'ellipse') {
                drawEllipse(boundingBox);
            } else if (shapeType === 'polygon') {
                drawPolygon(hullPoints);
            } else {
                console.log("Shape not recognized");
            }
        } else {
            console.log("Not enough points to form a shape");
        }
    };

    const convexHull = (points) => {
        console.log("Computing convex hull for points:", points);
        points.sort((a, b) => a.x - b.x || a.y - b.y);

        const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

        const lower = [];
        for (const point of points) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
                lower.pop();
            }
            lower.push(point);
        }

        const upper = [];
        for (const point of points.reverse()) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
                upper.pop();
            }
            upper.push(point);
        }

        upper.pop();
        lower.pop();

        const hull = lower.concat(upper);
        console.log("Convex hull computed:", hull);
        return hull;
    };

    const detectShape = (points, boundingBox, originalPointCount) => {
        console.log("Detecting shape with points:", points, "and bounding box:", boundingBox);

        const width = boundingBox.width;
        const height = boundingBox.height;
        const aspectRatio = width / height;

        console.log("Bounding box width:", width, "height:", height, "aspect ratio:", aspectRatio);

        const perimeter = points.reduce((acc, point, index) => {
            const nextPoint = points[(index + 1) % points.length];
            return acc + point.getDistance(nextPoint);
        }, 0);
        const area = boundingBox.area;

        console.log("Computed perimeter:", perimeter, "area:", area);

        const roundness = (4 * Math.PI * area) / (perimeter * perimeter);
        console.log("Computed roundness:", roundness);
        const circularityThreshold = 0.7;
        console.log(Math.abs(aspectRatio - 1));
        console.log(originalPointCount, points.length);

        if ((originalPointCount - 4) > points.length) {
            console.log("Shape detected as: polygon");
            return 'polygon';
        }
        if (roundness > circularityThreshold && Math.abs(aspectRatio - 1) < 0.2) {
            console.log("Shape detected as: circle");
            return 'circle';
        } else if (roundness > circularityThreshold) {
            console.log("Shape detected as: ellipse");
            return 'ellipse';
        } else {
            console.log("Shape detected as: polygon");
            return 'polygon';
        }
    };

    const drawCircle = (boundingBox) => {
        const radius = Math.min(boundingBox.width, boundingBox.height) / 2;
        const center = boundingBox.center;

        new paper.Path.Circle({
            center,
            radius,
            strokeColor: 'black',
            strokeWidth: 2,
        });
        console.log("Circle drawn with center:", center, "and radius:", radius);
    };

    const drawEllipse = (boundingBox) => {
        const { left, top, width, height } = boundingBox;
        const center = new paper.Point(left + width / 2, top + height / 2);
        const radiusX = width / 2;
        const radiusY = height / 2;

        new paper.Path.Ellipse({
            center: center,
            radius: [radiusX, radiusY],
            strokeColor: 'black',
            strokeWidth: 2,
        });
        console.log("Ellipse drawn with center:", center, "radiusX:", radiusX, "radiusY:", radiusY);
    };

    const drawPolygon = (points) => {
        new paper.Path({
            segments: points,
            closed: true,
            strokeColor: 'black',
            strokeWidth: 2,
        });
        console.log("Polygon drawn with points:", points);
    };

    return <canvas ref={canvasRef} resize="true" style={{ width: '100%', height: '100%', backgroundColor: '#c8d6e5' }} />;
};

export default ShapeDrawer;
