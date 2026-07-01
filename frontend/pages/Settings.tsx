import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Copy, ExternalLink, Loader, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { User } from '../types';
import { userService } from '../services';
import { shareService } from "../services/ShareService.ts";
import { useUser } from "../contexts/UserContext.tsx";



const Settings: React.FC = () => {
    const { user, login, logout } = useUser();
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        motto: '',
        pictureUrl: '',
        username: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                setFormData(user);
            } catch (err) {
                setError('Failed to load user data.');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await userService.updateUser(formData, formData.email);
            logout();
            login(formData.email, ''); // Password is not needed here
            setSuccess('Profile updated successfully!');

        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const emitEvent = (eventName: string) => {
        const event = new Event(eventName);
        window.dispatchEvent(event);
    }

    return (
        <div>
            <div className="flex items-center space-x-3 mb-6">
                <SettingsIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img
                            src={`/api/user/${user?.email}/picture`}
                            alt="Profile"
                            className="h-24 w-24 rounded-full object-cover border-4 border-primary-200 dark:border-primary-700"
                            onError={(e) => {
                                e.currentTarget.src = 'https://picsum.photos/seed/placeholder/200';
                            }}
                        />
                        <div className="flex-1">
                            <label htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={formData.username || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full input-style"
                                placeholder="Username"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">First
                                Name</label>
                            <input type="text" name="firstName" id="firstName" value={formData.firstName}
                                onChange={handleInputChange} className="mt-1 block w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="lastName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last
                                Name</label>
                            <input type="text" name="lastName" id="lastName" value={formData.lastName}
                                onChange={handleInputChange} className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email
                            Address</label>
                        <input type="email" name="email" id="email" value={formData.email} readOnly={true}
                            className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="role"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <input type="text" name="role" id="role" value={formData.role} onChange={handleInputChange}
                            className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="motto"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300">Motto</label>
                        <input type="text" name="motto" id="motto" value={formData.motto} onChange={handleInputChange}
                            className="mt-1 block w-full input-style" placeholder="Your personal motto..." />
                    </div>

                    {error &&
                        <div className="flex items-center gap-2 text-red-500"><AlertCircle className="h-5 w-5" />{error}
                        </div>}
                    {success && <div className="flex items-center gap-2 text-green-500"><CheckCircle
                        className="h-5 w-5" />{success}</div>}

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving && <Loader className="animate-spin h-5 w-5 mr-3" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

            </div>
            <style>{`.input-style { border-radius: 0.375rem; padding: 0.5rem 0.75rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); border: 1px solid #D1D5DB; background-color: white; } .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #E5E7EB; } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; ring: 2px; ring-offset-2px; border-color: hsl(210, 40%, 50%); ring-color: hsl(210, 40%, 50%); }`}</style>
        </div>
    );
};

export default Settings;