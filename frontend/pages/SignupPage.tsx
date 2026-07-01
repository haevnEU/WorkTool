// file: frontend/contexts/UserContext.tsx
import React, { FormEvent, useState } from "react";
import { userService } from "../services";
import { useTheme } from "../hooks/useTheme";
import {Theme, User} from "../types.ts"

const SignupForm: React.FC = () => {
    const { theme } = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputClass = "mt-1 w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent";

    const submitButtonClass = (() => {
        switch (theme) {
            case "dark":
                return "py-2 px-4 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60 w-full";
            case "colorful":
                return "py-2 px-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-60 w-full";
            case "ocean":
                return "py-2 px-4 rounded bg-teal-600 text-white hover:opacity-90 disabled:opacity-60 w-full";
            default:
                return "py-2 px-4 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60 w-full";
        }
    })();

    const handleSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            const user = {
                firstName: name.trim(),
                username: "",
                lastName: "",
                email: email.trim(),
                password: password,
                imgId: "default",
                theme: "light" // default theme
            }

            console.log("Send to backend:", user);
            const result = await userService.create(user);

            if(result.status === 200){
                window.location.hash = '#/'
            }else if(result.status === 208){
                setError("User with this email already exists");
                return;
            }
            console.log(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setLoading(false);
        }
        setLoading(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Create account</h2>
                {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

                <label className="block mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>Name</div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                        disabled={loading}
                        autoComplete="name"
                    />
                </label>

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

                <label className="block mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>Password</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                        disabled={loading}
                        autoComplete="new-password"
                    />
                </label>

                <label className="block mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>Confirm password</div>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        className={inputClass}
                        disabled={loading}
                        autoComplete="new-password"
                    />
                </label>

                <div className="mt-2">
                    <button type="submit" className={submitButtonClass} disabled={loading}>
                        {loading ? "Signing up..." : "Sign up"}
                    </button>
                </div>

                <div className="mt-3 text-sm text-center">
                    <a href="SignupPage.tsx#/" className="text-primary dark:text-primary underline">Back to home / login</a>
                </div>
            </form>
        </div>
    );
};

export default SignupForm;