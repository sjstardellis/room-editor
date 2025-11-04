export type ObjectType = "goal" | "obstacle" | "wall";

export interface SceneObject {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    type: ObjectType;
}

export type Tool = "select" | ObjectType;