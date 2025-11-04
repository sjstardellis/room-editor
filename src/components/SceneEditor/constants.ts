export const CANVAS_SIZE = 1000; // DO NOT CHANGE
export const DEFAULT_GRID_SIZE = 20; // Default dimensions

// Default settings for each object
export const DEFAULT_OBJECT_CONFIGS = {
    wall: { width: 0.5, height: 5.0, radius: 1.0 },
    obstacle: { width: 1.0, height: 1.0, radius: 2.0 },
    goal: { width: 0.5, height: 2.0, radius: 1.0 },
};


// Object colors
export const OBJECT_COLORS = {
    goal: { normal: "#00ff00", selected: "#00cc00" },
    obstacle: { normal: "#ff0000", selected: "#cc0000" },
    wall: { normal: "#888888", selected: "#666666" },
};