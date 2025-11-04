import React, { useRef, useEffect, useState } from "react";
import type {SceneObject, ObjectType, Tool} from "./types";
import { CanvasRenderer } from "./CanvasRenderer";
import { createCoordinateConverters, detectObjectClick } from "./utils";
import { CANVAS_SIZE } from "./constants";

interface CanvasProps {
    // Array of all objects in scene
    objects: SceneObject[];
    // Selected object's ID
    selectedId: number | null;
    // Change selected
    setSelectedId: (id: number | null) => void;
    // Current tool
    tool: Tool;
    // Grid dimensions
    gridSize: number;
    // Add new object
    onAddObject: (x: number, y: number, type: ObjectType) => void;
    // Update object
    onUpdateObject: (id: number, updates: Partial<SceneObject>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
                                                  objects,
                                                  selectedId,
                                                  setSelectedId,
                                                  tool,
                                                  gridSize,
                                                  onAddObject,
                                                  onUpdateObject,
                                              }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!rendererRef.current) {
            rendererRef.current = new CanvasRenderer(ctx, gridSize);
        } else {
            rendererRef.current.updateGridSize(gridSize);
        }

        rendererRef.current.render(objects, selectedId);
    }, [objects, selectedId, gridSize]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { toGrid } = createCoordinateConverters(gridSize);

        if (tool === "select") {
            const gridX = toGrid(x);
            const gridY = gridSize - toGrid(y);
            const clickedId = detectObjectClick(objects, gridX, gridY);
            setSelectedId(clickedId);
        } else {
            const gridX = Math.round(toGrid(x) * 2) / 2;
            const gridY = Math.round((gridSize - toGrid(y)) * 2) / 2;
            onAddObject(gridX, gridY, tool);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool !== "select") return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { toGrid } = createCoordinateConverters(gridSize);
        const gridX = toGrid(x);
        const gridY = gridSize - toGrid(y);
        const clickedId = detectObjectClick(objects, gridX, gridY);

        if (clickedId !== null) {
            setSelectedId(clickedId);
            setIsDragging(true);
            const obj = objects.find((o) => o.id === clickedId);
            if (obj) {
                setDragStart({ x: gridX - obj.x, y: gridY - obj.y });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || selectedId === null) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { toGrid } = createCoordinateConverters(gridSize);
        const gridX = toGrid(x);
        const gridY = gridSize - toGrid(y);

        onUpdateObject(selectedId, {
            x: Math.round((gridX - dragStart.x) * 2) / 2,
            y: Math.round((gridY - dragStart.y) * 2) / 2,
        });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className={`border border-gray-300 max-w-full max-h-full ${
                isDragging ? "cursor-grabbing" : "cursor-crosshair"
            }`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        />
    );
};