import React, { useState, useRef, useEffect } from "react";
import { Download, Trash2, Move, Square, Circle, Upload } from "lucide-react";

type ObjectType = "goal" | "obstacle" | "wall";

interface SceneObject {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    type: ObjectType;
}

const SceneEditor: React.FC = () => {
    const [objects, setObjects] = useState<SceneObject[]>([
        { id: 1, x: 5, y: 5, width: 1, height: 1, radius: 2, type: "obstacle" },
    ]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [tool, setTool] = useState<"select" | ObjectType>("select");
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nextId, setNextId] = useState(2);

    // Editable grid size, default 20x20
    const [gridSize, setGridSize] = useState(20);
    const CANVAS_SIZE = 1000;
    const scale = CANVAS_SIZE / gridSize;

    const toCanvas = (val: number): number => val * scale;
    const toGrid = (val: number): number => val / scale;

    // Drawing the grid and objects
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(toCanvas(i), 0);
            ctx.lineTo(toCanvas(i), CANVAS_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, toCanvas(i));
            ctx.lineTo(CANVAS_SIZE, toCanvas(i));
            ctx.stroke();
        }

        ctx.fillStyle = "#666";
        ctx.font = "10px monospace";
        for (let i = 0; i <= gridSize; i++) {
            ctx.fillText(i.toString(), toCanvas(i) - 5, CANVAS_SIZE - 5);
            ctx.fillText(i.toString(), 5, toCanvas(gridSize - i) + 5);
        }
    };

    const drawObject = (
        ctx: CanvasRenderingContext2D,
        obj: SceneObject,
        isSelected: boolean
    ) => {
        const cx = toCanvas(obj.x);
        const cy = toCanvas(gridSize - obj.y);

        let color: string;
        switch (obj.type) {
            case "goal":
                color = isSelected ? "#00cc00" : "#00ff00";
                break;
            case "obstacle":
                color = isSelected ? "#cc0000" : "#ff0000";
                break;
            case "wall":
                color = isSelected ? "#666666" : "#888888";
                break;
            default:
                color = "#999999";
        }

        ctx.fillStyle = color + "88";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        const w = toCanvas(obj.width);
        const h = toCanvas(obj.height);
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        if (obj.radius > 0 && obj.type !== "wall") {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = color + "44";
            ctx.beginPath();
            ctx.arc(cx, cy, toCanvas(obj.radius), 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.fillStyle = isSelected ? "#0000ff" : "#000000";
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "12px monospace";
        ctx.fillText(`${obj.type} ${obj.id}`, cx + 10, cy - 10);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawGrid(ctx);
        objects.forEach((obj) => drawObject(ctx, obj, obj.id === selectedId));
    }, [objects, selectedId, gridSize]);

    // Object detection
    const getClickedObject = (x: number, y: number): number | null => {
        const gridX = toGrid(x);
        const gridY = gridSize - toGrid(y);
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const dx = Math.abs(gridX - obj.x);
            const dy = Math.abs(gridY - obj.y);
            if (dx <= obj.width / 2 + 0.2 && dy <= obj.height / 2 + 0.2) {
                return obj.id;
            }
        }
        return null;
    };

    // Mouse Handlers
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === "select") {
            const clickedId = getClickedObject(x, y);
            setSelectedId(clickedId);
        } else {
            const gridX = Math.round(toGrid(x) * 2) / 2;
            const gridY = Math.round((gridSize - toGrid(y)) * 2) / 2;

            const newObj: SceneObject = {
                id: nextId,
                x: gridX,
                y: gridY,
                width: 1,
                height: 1,
                radius: 1,
                type: tool,
            };

            if (tool === "wall") {
                newObj.width = 0.5;
                newObj.height = 5.0;
                newObj.radius = 1.0;
            } else if (tool === "obstacle") {
                newObj.width = 1.0;
                newObj.height = 1.0;
                newObj.radius = 2.0;
            } else if (tool === "goal") {
                newObj.width = 0.5;
                newObj.height = 2.0;
                newObj.radius = 1.0;
            }

            setObjects([...objects, newObj]);
            setNextId(nextId + 1);
            setSelectedId(newObj.id);
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool !== "select") return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const clickedId = getClickedObject(x, y);

        if (clickedId !== null) {
            setSelectedId(clickedId);
            setIsDragging(true);
            const obj = objects.find((o) => o.id === clickedId);
            if (obj) {
                setDragStart({
                    x: toGrid(x) - obj.x,
                    y: gridSize - toGrid(y) - obj.y,
                });
            }
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || selectedId === null) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridX = toGrid(x);
        const gridY = gridSize - toGrid(y);

        setObjects((objects) =>
            objects.map((o) =>
                o.id === selectedId
                    ? {
                        ...o,
                        x: Math.round((gridX - dragStart.x) * 2) / 2,
                        y: Math.round((gridY - dragStart.y) * 2) / 2,
                    }
                    : o
            )
        );
    };

    const handleCanvasMouseUp = () => {
        if (isDragging) setIsDragging(false);
    };

    const handleCanvasMouseLeave = () => {
        if (isDragging) setIsDragging(false);
    };

    // Object editing
    const updateSelectedObject = (field: keyof SceneObject, value: string) => {
        setObjects((objects) =>
            objects.map((obj) =>
                obj.id === selectedId
                    ? { ...obj, [field]: parseFloat(value) || 0 }
                    : obj
            )
        );
    };

    const deleteSelected = () => {
        setObjects(objects.filter((obj) => obj.id !== selectedId));
        setSelectedId(null);
    };

    const exportToFile = () => {
        let output = "";
        objects.forEach((obj) => {
            output += `${obj.x} ${obj.y} ${obj.width} ${obj.height} ${obj.radius} ${obj.type}\n`;
        });
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "objects.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.trim().split('\n');
            const newObjects: SceneObject[] = [];
            let maxId = 0;

            lines.forEach((line, index) => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 6) {
                    const [x, y, width, height, radius, type] = parts;
                    const id = index + 1;
                    maxId = Math.max(maxId, id);

                    newObjects.push({
                        id,
                        x: parseFloat(x) || 0,
                        y: parseFloat(y) || 0,
                        width: parseFloat(width) || 1,
                        height: parseFloat(height) || 1,
                        radius: parseFloat(radius) || 1,
                        type: type as ObjectType,
                    });
                }
            });

            if (newObjects.length > 0) {
                setObjects(newObjects);
                setNextId(maxId + 1);
                setSelectedId(null);
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be loaded again
        event.target.value = '';
    };

    const selectedObj = objects.find((o) => o.id === selectedId);

    return (
        <div className="w-screen h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="p-4 bg-white shadow flex items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-black">
                    Room Creation Editor
                </h1>
            </header>


            {/* Main Area */}
            <main className="flex flex-1 overflow-hidden">
                {/* Canvas */}
                <div className="flex-1 flex items-center justify-center bg-white">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className={`border border-gray-300 max-w-full max-h-full ${
                            isDragging ? "cursor-grabbing" : "cursor-crosshair"
                        }`}
                        onClick={handleCanvasClick}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseLeave}
                    />
                </div>

                {/* Sidebar */}
                <aside className="w-80 h-full overflow-y-auto bg-gray-100 border-l p-4 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={exportToFile}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            <Upload size={16} /> Import
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt"
                        onChange={importFromFile}
                        className="hidden"
                    />

                    {/* Grid Editor */}
                    <div className="bg-white p-4 rounded-lg shadow text-black">
                        <h3 className="font-semibold mb-2 text-black">Grid Size (n x n)</h3>
                        <input
                            type="number"
                            min={5}
                            max={100}
                            step={1}
                            value={gridSize}
                            onChange={(e) =>
                                setGridSize(parseInt(e.target.value) || 1)
                            }
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    {/* Tools */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">Tools</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setTool("select")}
                                className={`flex items-center gap-2 px-4 py-2 rounded ${
                                    tool === "select"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                <Move size={16} /> Select/Move
                            </button>
                            <button
                                onClick={() => setTool("goal")}
                                className={`flex items-center gap-2 px-4 py-2 rounded ${
                                    tool === "goal"
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                <Circle size={16} /> Add Goal
                            </button>
                            <button
                                onClick={() => setTool("obstacle")}
                                className={`flex items-center gap-2 px-4 py-2 rounded ${
                                    tool === "obstacle"
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                <Square size={16} /> Add Obstacle
                            </button>
                            <button
                                onClick={() => setTool("wall")}
                                className={`flex items-center gap-2 px-4 py-2 rounded ${
                                    tool === "wall"
                                        ? "bg-gray-600 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                <Square size={16} /> Add Wall
                            </button>
                        </div>
                    </div>

                    {/* Object List */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-2 text-black">Objects</h3>
                        <ul className="space-y-1 max-h-64 overflow-y-auto">
                            {objects.map((obj) => (
                                <li key={obj.id}>
                                    <button
                                        onClick={() => setSelectedId(obj.id)}
                                        className={`w-full text-left px-2 py-1 rounded ${
                                            obj.id === selectedId
                                                ? "bg-blue-500 text-white"
                                                : "hover:bg-gray-200"
                                        }`}
                                    >
                                        {obj.type} {obj.id} (x:{obj.x}, y:{obj.y})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Properties */}
                    {selectedObj && (
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-black">Properties</h3>
                                <button
                                    onClick={deleteSelected}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-black">
                                {(["x", "y", "width", "height", "radius"] as const).map(
                                    (field) => (
                                        <div key={field}>
                                            <label className="block text-gray-600 capitalize">
                                                {field}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={selectedObj[field]}
                                                onChange={(e) =>
                                                    updateSelectedObject(
                                                        field,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full border rounded px-2 py-1"
                                                disabled={
                                                    field === "radius" &&
                                                    selectedObj.type === "wall"
                                                }
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                        <h4 className="font-semibold mb-2 text-black">Instructions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>Select a tool and click to place</li>
                            <li>Use Select/Move to drag objects</li>
                            <li>Click object to edit properties</li>
                            <li>Dashed circle = repulsion radius</li>
                            <li>Import .txt files to load layouts</li>
                            <li>Export when done</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default SceneEditor;