// file: frontend/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, FormEvent } from "react";
import { User } from "../types.ts";
import { userService } from "../services";
import { useTheme } from "../hooks/useTheme";

type UserContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
};

const STORAGE_KEY = "app_user";

const UserContext = createContext<UserContextType | undefined>(undefined);

const LoginForm: React.FC<{ onLogin: (e: string, p: string) => Promise<User> }> = ({ onLogin }) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState("milewski@mail");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputClass = "mt-1 w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent";

    const signInButtonClass = (() => {
        switch (theme) {
            case "dark":
                return "flex-1 py-2 px-4 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60";
            case "colorful":
                return "flex-1 py-2 px-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-60";
            case "ocean":
                return "flex-1 py-2 px-4 rounded bg-teal-600 text-white hover:opacity-90 disabled:opacity-60";
            default:
                return "flex-1 py-2 px-4 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60";
        }
    })();

    const signUpButtonClass = "py-2 px-4 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-60";

    const handleSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await onLogin(email.trim(), password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sign in</h2>
                {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
                <label className="block mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>Email</div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputClass}
                        disabled={loading}
                        autoComplete="username"
                    />
                </label>
                <label className="block mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>Password</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </label>

                <div className="flex items-center gap-3">
                    <button type="submit" className={signInButtonClass} disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </div>

                <div className="mt-3 text-sm text-right">
                    <a
                        href="UserContext.tsx#/signup"
                        onClick={()=>window.location.hash = '#/signup'}
                        className="text-primary dark:text-primary underline"
                        title="Create a new account"
                    >
                        Click to create account
                    </a>
                </div>
            </form>
        </div>
    );
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const {changeTheme} = useTheme();

    const [user, setUserState] = useState<User | null>(() => {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if(!raw) return null;
            return raw ? (JSON.parse(raw) as User) : null;
        } catch {
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

    useEffect(() => {
        try {
            if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            else sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore storage errors
        }
    }, [user]);

    const setUser = (u: User | null) => {
        setUserState(u);
        setIsAuthenticated(!!u);
    };

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const u = await userService.fetchUser(email, password);
            if (!u) throw new Error("Invalid login response");
            setUser(u);
            changeTheme(u?.theme || "light");
            return u;
        } catch (err) {
            throw err instanceof Error ? err : new Error("Login failed");
        }
    };

    const logout = async (): Promise<void> => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, login, logout }}>
            {isAuthenticated ? children : <LoginForm onLogin={login} />}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
};