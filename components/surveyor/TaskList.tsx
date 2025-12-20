import React, { useState, useEffect } from 'react';
import { SurveyTask } from '../../types';

interface TaskListProps {
    surveyorId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ surveyorId }) => {
    const [tasks, setTasks] = useState<SurveyTask[]>([]);
    const [pendingTasks, setPendingTasks] = useState<SurveyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my-tasks' | 'available'>('my-tasks');

    const loadMyTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveyor/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const loadPendingTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveyor/tasks/pending`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setPendingTasks(data.data);
            }
        } catch (error) {
            console.error('Error loading pending tasks:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadMyTasks(), loadPendingTasks()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleAcceptTask = async (taskId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveyor/tasks/${taskId}/accept`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                alert('Task accepted successfully!');
                await Promise.all([loadMyTasks(), loadPendingTasks()]);
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            alert('Failed to accept task');
        }
    };

    const handleUpdateStatus = async (taskId: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveyor/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            const data = await response.json();
            if (data.success) {
                alert('Status updated successfully!');
                await loadMyTasks();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const getPriorityBadge = (priority: string) => {
        const badges = {
            low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
            high: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
            urgent: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
        };
        return badges[priority as keyof typeof badges] || badges.medium;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600 dark:text-gray-400">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('my-tasks')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my-tasks'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                            }`}
                    >
                        My Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'available'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                            }`}
                    >
                        Available Tasks ({pendingTasks.length})
                    </button>
                </nav>
            </div>

            {/* Task List */}
            {activeTab === 'my-tasks' ? (
                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No assigned tasks yet. Check available tasks to get started!
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {task.property?.title || 'Property Survey'}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                                                {task.status.toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            📍 {task.location.address}
                                        </p>
                                        {task.requirements && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                <span className="font-medium">Requirements:</span> {task.requirements}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Requested: {new Date(task.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {task.status === 'assigned' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                        >
                                            Start Survey
                                        </button>
                                    </div>
                                )}
                                {task.status === 'in-progress' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => alert('Upload report feature coming soon!')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                        >
                                            Upload Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No available tasks at the moment
                        </div>
                    ) : (
                        pendingTasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {task.property?.title || 'Property Survey'}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            📍 {task.location.address}
                                        </p>
                                        {task.requirements && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                <span className="font-medium">Requirements:</span> {task.requirements}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Posted: {new Date(task.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAcceptTask(task.id)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                >
                                    Accept Task
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
