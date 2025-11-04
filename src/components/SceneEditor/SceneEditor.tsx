import React from "react";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { useSceneEditor } from "./useSceneEditor";

const SceneEditor: React.FC = () => {
    const {
        // State values
        // Array of all scene objects
        objects,
        // ID of currently selected object (or null)
        selectedId,
        // Current tool selected, either select or object
        tool,
        // Current grid size (n x n)
        gridSize,
        // Selected object
        selectedObject,

        // State setters
        // Change selection
        setSelectedId,
        // Change tool
        setTool,
        // Change grid size
        setGridSize,

        // Action functions
        // Add a new object
        addObject,
        // Update an object's properties
        updateObject,
        // Delete an object
        deleteObject,
        // Import objects from text file
        importObjects,
    } = useSceneEditor();

    return (
        <div className="w-screen h-screen flex flex-col bg-gray-50">

            <header className="p-4 bg-white shadow flex items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-black">
                    Room Creation Editor
                </h1>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex items-center justify-center bg-white">
                    <Canvas
                        objects={objects}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        tool={tool}
                        gridSize={gridSize}
                        onAddObject={addObject}
                        onUpdateObject={updateObject}
                    />
                </div>
                <Sidebar
                    objects={objects}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    selectedObject={selectedObject}
                    tool={tool}
                    setTool={setTool}
                    gridSize={gridSize}
                    setGridSize={setGridSize}
                    onUpdateObject={updateObject}
                    onDeleteObject={deleteObject}
                    onImportObjects={importObjects}
                />
            </main>
        </div>
    );
};

export default SceneEditor;