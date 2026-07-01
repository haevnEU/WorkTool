import React, {useEffect, useState} from "react";
import {TodoModel} from "../types/TodoModel.ts";
import {todoService} from "../services/TodoService.ts";
import TodoModal from "../components/todo/TodoModal.tsx";
import {ListTodo, PlusCircle} from "lucide-react";

export default function TodoPage(): React.ReactElement {
    const [todo, setTodo] = useState<TodoModel[]>([]);
    const [filteredTodo, setFilteredTodo] = useState<TodoModel[]>([]);
    const [selectedTodo, setSelectedTodo] = useState<TodoModel | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, []);

    const createPriority = (priority: TodoModel['priority']) => {
        const dot = (filled: boolean, colorClass: string = "bg-gray-300") => (
            <span
                className={`inline-block w-3 h-3 rounded-full mr-1 ${filled ? colorClass : "border-2 border-gray-300"}`}
                aria-hidden="true"
            />
        );

        const p = String(priority);
        if (p === "low" || p === "1") {
            return (
                <span className="flex items-center">
                    {dot(true, "bg-green-500")}
                    {dot(false)}
                    {dot(false)}
                </span>
            );
        } else if (p === "medium" || p === "2") {
            return (
                <span className="flex items-center">
                    {dot(true, "bg-yellow-500")}
                    {dot(true, "bg-yellow-500")}
                    {dot(false)}
                </span>
            );
        } else if (p === "high" || p === "3") {
            return (
                <span className="flex items-center">
                    {dot(true, "bg-red-500")}
                    {dot(true, "bg-red-500")}
                    {dot(true, "bg-red-500")}
                </span>
            );
        } else {
            return (
                <span className="flex items-center">
                    {dot(false)}
                    {dot(false)}
                    {dot(false)}
                </span>
            );
        }
    };

    const removeItem = async (id?: number) => {
        if (id === undefined || id === null) return;
        try {
            await todoService.deleteTodo(id);
            await fetchTodos();
        } catch (err) {
            console.error("Failed to delete todo", err);
        }
    };

    const fetchTodos = async () => {
        try {
            const data = await todoService.getTodos();
            if (Array.isArray(data)) {
                data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                setTodo(data);
                setFilteredTodo(data);
            } else if (data && typeof data === "object") {
                if (Array.isArray((data as any).items)) {
                    const items = (data as any).items as TodoModel[];
                    items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    setTodo(items);
                    setFilteredTodo(items);
                } else if ((data as any).id) {
                    setTodo([data as any]);
                    setFilteredTodo(data as any);
                } else {
                    console.warn("Unexpected todos response", data);
                    setTodo([]);
                    setFilteredTodo([]);
                }
            } else {
                setTodo([]);
                setFilteredTodo([]);
            }
        } catch (err) {
            console.error(err);
            setTodo([]);
            setFilteredTodo([]);
        } finally {
        }
    };

    const saveOrUpdate = async (item: Partial<TodoModel>) => {
        if (!item) return;
        try {
            if (item.id) {
                await todoService.updateTodo(item as TodoModel);
            } else {
                await todoService.createTodo(item as TodoModel);
            }
            await fetchTodos();
        } catch (err) {
            console.error("saveOrUpdate failed", err);
        }
    };

    const filter = async (priority: TodoModel['priority'] | undefined) => {
        if (!priority) {
            setFilteredTodo(todo);
            return;
        }

        if (priority !== 'low' && priority !== 'medium' && priority !== 'high') {
            setFilteredTodo(todo);
            return;
        }

        const filtered = todo.filter(item => String(item.priority) === String(priority));
        setFilteredTodo(filtered);

    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ListTodo className="h-8 w-8 text-primary"/>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TODO List</h1>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTodo(null);
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                    >
                        <PlusCircle className="h-5 w-5"/>
                        <span>New Snippet</span>
                    </button>
                </div>

                <div className="flex items-center  space-x-4">
                    <span className="text-lg font-medium text-gray-800 dark:text-gray-200">Priority</span>
                    <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        onChange={async (e) => {
                            filter(e.target.value)
                        }}
                    >
                        <option value={undefined}>All Priorities</option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        {Array.isArray(filteredTodo) ? `${filteredTodo.length} item(s)` : '0 item(s)'}
                    </div>
                </div>

                {Array.isArray(filteredTodo) && filteredTodo.map((item, index) => (
                    <section
                        key={item.id ?? index}
                        className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between gap-4 cursor-pointer"
                        onClick={() => {
                            setSelectedTodo(item);
                            setShowModal(true);
                        }}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                {createPriority(item.priority)}
                            </div>
                            <div className="truncate text-gray-800 dark:text-gray-200">
                                {item.content?.slice(0, 200)}
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    removeItem(item.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </section>
                ))}

            </div>

            <TodoModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedTodo(null);
                }}
                todo={selectedTodo}
                onSave={async (item: Partial<TodoModel>) => {
                    await saveOrUpdate(item);
                    setShowModal(false);
                    setSelectedTodo(null);
                }}
            />

        </>
    );
}