import {IService} from './IService';
import {TodoModel} from "../types/TodoModel.ts";


class TodoService extends IService {

    public async createTodo(todo: TodoModel): Promise<void> {
        const data = todo;
        const requestOptions = {
            body: data,
            bodyType: 'json' as const,
        }

        return await this.post<void>('/todo/create', requestOptions);
    }

    async deleteTodo(id: number): Promise<void> {
        const requestOptions = {}

        return await this.delete(`/todo/delete/${id}`);
    }

    async getTodos(): Promise<TodoModel[]> {
        const requestOptions = {
            responseType: "JSON" as const,
        }

        return await this.get<TodoModel[]>('/todo', requestOptions);
    }

    async updateTodo(todo: TodoModel) {

        const requestOptions = {
            body: todo,
            bodyType: 'json' as const,
        }
        return await this.post<void>('/todo/update', requestOptions);
    }
}

export const todoService = new TodoService();
