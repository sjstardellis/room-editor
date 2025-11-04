import type {SceneObject} from "./types";
import { CANVAS_SIZE, OBJECT_COLORS } from "./constants";

export class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private gridSize: number;
    private scale: number;

    constructor(ctx: CanvasRenderingContext2D, gridSize: number) {
        this.ctx = ctx;
        this.gridSize = gridSize;
        this.scale = CANVAS_SIZE / gridSize;
    }

    private toCanvas(val: number): number {
        return val * this.scale;
    }

    updateGridSize(gridSize: number) {
        this.gridSize = gridSize;
        this.scale = CANVAS_SIZE / gridSize;
    }

    clear() {
        this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(this.toCanvas(i), 0);
            ctx.lineTo(this.toCanvas(i), CANVAS_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, this.toCanvas(i));
            ctx.lineTo(CANVAS_SIZE, this.toCanvas(i));
            ctx.stroke();
        }

        ctx.fillStyle = "#666";
        ctx.font = "10px monospace";
        for (let i = 0; i <= this.gridSize; i++) {
            ctx.fillText(i.toString(), this.toCanvas(i) - 5, CANVAS_SIZE - 5);
            ctx.fillText(i.toString(), 5, this.toCanvas(this.gridSize - i) + 5);
        }
    }

    drawObject(obj: SceneObject, isSelected: boolean) {
        const ctx = this.ctx;
        const cx = this.toCanvas(obj.x);
        const cy = this.toCanvas(this.gridSize - obj.y);

        const colors = OBJECT_COLORS[obj.type] || { normal: "#999999", selected: "#999999" };
        const color = isSelected ? colors.selected : colors.normal;

        ctx.fillStyle = color + "88";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        const w = this.toCanvas(obj.width);
        const h = this.toCanvas(obj.height);
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

        if (obj.radius > 0 && obj.type !== "wall") {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = color + "44";
            ctx.beginPath();
            ctx.arc(cx, cy, this.toCanvas(obj.radius), 0, 2 * Math.PI);
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
    }

    render(objects: SceneObject[], selectedId: number | null) {
        this.clear();
        this.drawGrid();
        objects.forEach((obj) => this.drawObject(obj, obj.id === selectedId));
    }
}