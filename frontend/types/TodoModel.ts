import {TodoPriority} from "./TodoPriorityModel.ts";

export interface TodoModel {
    id: number | undefined;
    content: string;
    timestamp: number | undefined;
    priority: TodoPriority;
}