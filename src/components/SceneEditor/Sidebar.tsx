import React, { useRef } from "react";
import {
    Download,
    Trash2,
    Move,
    Square,
    Circle,
    Upload,
} from "lucide-react";
import type {SceneObject, Tool} from "./types";
import { exportObjectsToText } from "./utils";

interface SidebarProps {
    objects: SceneObject[];
    selectedId: number | null;
    setSelectedId: (id: number | null) => void;
    selectedObject: SceneObject | undefined;
    tool: Tool;
    setTool: (tool: Tool) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    onUpdateObject: (id: number, updates: Partial<SceneObject>) => void;
    onDeleteObject: (id: number) => void;
    onImportObjects: (content: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                                    objects,
                                                    selectedId,
                                                    setSelectedId,
                                                    selectedObject,
                                                    tool,
                                                    setTool,
                                                    gridSize,
                                                    setGridSize,
                                                    onUpdateObject,
                                                    onDeleteObject,
                                                    onImportObjects,
                                                }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Exports all objects to a txt file
    const handleExport = () => {
        // Convert objects to text from array of objects
        const output = exportObjectsToText(objects);
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        // Download as "objects.txt"
        a.download = "objects.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // Imports all objects from a txt file
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onImportObjects(content);
        };
        reader.readAsText(file);

        // Reset the input so the same file can be imported again if needed
        event.target.value = "";
    };

    // Updating a single field of the current object selected
    const updateField = (field: keyof SceneObject, value: string) => {
        if (selectedObject) {
            onUpdateObject(selectedObject.id, { [field]: parseFloat(value) || 0 });
        }
    };

    return (
        <aside className="w-80 h-full overflow-y-auto bg-gray-100 border-l p-4 flex flex-col gap-4">
            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <Upload size={16} /> Import
                </button>

                <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    <Download size={16} /> Export
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleImport}
                className="hidden"
            />

            {/* Grid size block */}
            <div className="bg-white p-4 rounded-lg shadow text-black">
                <h3 className="font-semibold mb-2 text-black">Grid Size (n x n)</h3>
                <input
                    type="number"
                    min={5}
                    max={100}
                    step={1}
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value) || 1)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            {/* Select/Move or Add object */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Tools</h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setTool("select")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            tool === "select" ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                    >
                        <Move size={16} /> Select/Move
                    </button>
                    <button
                        onClick={() => setTool("goal")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            tool === "goal" ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}
                    >
                        <Circle size={16} /> Add Goal
                    </button>
                    <button
                        onClick={() => setTool("obstacle")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            tool === "obstacle" ? "bg-red-500 text-white" : "bg-gray-200"
                        }`}
                    >
                        <Square size={16} /> Add Obstacle
                    </button>
                    <button
                        onClick={() => setTool("wall")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            tool === "wall" ? "bg-gray-600 text-white" : "bg-gray-200"
                        }`}
                    >
                        <Square size={16} /> Add Wall
                    </button>
                </div>
            </div>

            {/* Object list */}
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

            {/* Properties of current object */}
            {selectedObject && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-black">Properties</h3>
                        <button
                            onClick={() => onDeleteObject(selectedObject.id)}
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
                                        value={selectedObject[field]}
                                        onChange={(e) => updateField(field, e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                        disabled={
                                            field === "radius" && selectedObject.type === "wall"
                                        }
                                    />
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </aside>
    );
};