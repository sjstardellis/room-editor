import type {SceneObject, ObjectType} from "./types";
import { CANVAS_SIZE, DEFAULT_OBJECT_CONFIGS } from "./constants";

export const createCoordinateConverters = (gridSize: number) => {
    const scale = CANVAS_SIZE / gridSize;
    return {
        toCanvas: (val: number): number => val * scale,
        toGrid: (val: number): number => val / scale,
    };
};

export const createDefaultObject = (
    id: number,
    x: number,
    y: number,
    type: ObjectType
): SceneObject => {
    const config = DEFAULT_OBJECT_CONFIGS[type];
    return {
        id,
        x,
        y,
        width: config.width,
        height: config.height,
        radius: config.radius,
        type,
    };
};

export const detectObjectClick = (
    objects: SceneObject[],
    gridX: number,
    gridY: number
): number | null => {
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

// Formats all objects in scene to simulation format
export const exportObjectsToText = (objects: SceneObject[]): string => {
    return objects
        .map(
            (obj) =>
                `${obj.x} ${obj.y} ${obj.width} ${obj.height} ${obj.radius} ${obj.type}`
        )
        .join("\n");
};

// Parsing logic from imported text
export const parseObjectsFromText = (content: string): SceneObject[] => {
    const lines = content.trim().split("\n");
    const newObjects: SceneObject[] = [];

    lines.forEach((line, index) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 6) {
            const [x, y, width, height, radius, type] = parts;
            newObjects.push({
                id: index + 1,
                x: parseFloat(x) || 0,
                y: parseFloat(y) || 0,
                width: parseFloat(width) || 1,
                height: parseFloat(height) || 1,
                radius: parseFloat(radius) || 1,
                type: type as ObjectType,
            });
        }
    });

    return newObjects;
};