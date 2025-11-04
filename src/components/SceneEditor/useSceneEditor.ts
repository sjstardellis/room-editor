import { useState, useCallback } from "react";
import type {SceneObject, ObjectType, Tool} from "./types";
import { createDefaultObject, parseObjectsFromText } from "./utils";
import { DEFAULT_GRID_SIZE } from "./constants";

export const useSceneEditor = () => {
    const [objects, setObjects] = useState<SceneObject[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [tool, setTool] = useState<Tool>("select");
    const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
    const [nextId, setNextId] = useState(2);

    const addObject = useCallback(
        (x: number, y: number, type: ObjectType) => {
            const newObj = createDefaultObject(nextId, x, y, type);
            setObjects((prev) => [...prev, newObj]);
            setNextId((prev) => prev + 1);
            setSelectedId(newObj.id);
        },
        [nextId]
    );

    const updateObject = useCallback(
        (id: number, updates: Partial<SceneObject>) => {
            setObjects((prev) =>
                prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
            );
        },
        []
    );

    const deleteObject = useCallback((id: number) => {
        setObjects((prev) => prev.filter((obj) => obj.id !== id));
        setSelectedId(null);
    }, []);

    const importObjects = useCallback((content: string) => {
        const newObjects = parseObjectsFromText(content);
        if (newObjects.length > 0) {
            setObjects(newObjects);
            const maxId = Math.max(...newObjects.map((obj) => obj.id));
            setNextId(maxId + 1);
            setSelectedId(null);
        }
    }, []);

    const selectedObject = objects.find((o) => o.id === selectedId);

    return {
        objects,
        selectedId,
        setSelectedId,
        tool,
        setTool,
        gridSize,
        setGridSize,
        addObject,
        updateObject,
        deleteObject,
        importObjects,
        selectedObject,
    };
};