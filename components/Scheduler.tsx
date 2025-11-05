

import React, { useState, useMemo } from 'react';
import type { ApiResponse, GeneratedPost } from '../types';
import { PLATFORMS } from '../constants';
import { CalendarIcon } from './icons/CalendarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SchedulerProps {
    campaign: ApiResponse;
    onSchedulePost: (postId: string, date: number) => void;
    onUnschedulePost: (postId: string) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Scheduler: React.FC<SchedulerProps> = ({ campaign, onSchedulePost, onUnschedulePost }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const calendarDays = useMemo(() => {
        const days = [];
        const startingDay = firstDayOfMonth.getDay();
        
        // Add padding days from previous month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the current month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate]);

    const scheduledPostsByDate = useMemo(() => {
        const map = new Map<string, GeneratedPost[]>();
        campaign.posts.filter(p => p.isScheduled && p.scheduledDate).forEach(post => {
            const dateKey = new Date(post.scheduledDate!).toISOString().split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(post);
        });
        return map;
    }, [campaign.posts]);

    const unscheduledPosts = campaign.posts.filter(p => !p.isScheduled);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, postId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', postId);
        setDraggedPostId(postId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date | null) => {
        e.preventDefault();
        if (!day) return;
        const postId = e.dataTransfer.getData('text/plain');
        if (postId) {
            // Default to 9 AM on the selected day
            const scheduledTime = new Date(day);
            scheduledTime.setHours(9, 0, 0, 0);
            onSchedulePost(postId, scheduledTime.getTime());
        }
        setDraggedPostId(null);
    };

    const handleDragEnd = () => {
        setDraggedPostId(null);
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8 shadow-lg transition-all duration-300 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-6">
                <CalendarIcon className="w-7 h-7 text-purple-500 dark:text-purple-300" />
                Content Scheduler
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar View */}
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&lt;</button>
                        <h3 className="text-lg font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const dateKey = day ? day.toISOString().split('T')[0] : '';
                            const postsForDay = scheduledPostsByDate.get(dateKey) || [];
                            
                            return (
                                <div
                                    key={index}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                    className={`h-28 sm:h-32 p-1.5 border rounded-md transition-colors ${day ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700' : 'bg-slate-100/50 dark:bg-slate-800/30 border-transparent'}`}
                                >
                                    {day && <span className="text-sm font-semibold">{day.getDate()}</span>}
                                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[80%]">
                                        {postsForDay.map(post => {
                                            const PlatformIcon = PLATFORMS.find(p => p.name === post.platform)?.icon;
                                            return (
                                                <div key={post.id} className="text-left text-xs bg-white dark:bg-slate-800 p-1.5 rounded-md shadow flex items-center gap-2 relative group">
                                                    {PlatformIcon && <PlatformIcon className="w-4 h-4 flex-shrink-0" />}
                                                    <span className="truncate flex-grow">{post.variations[0].post_title}</span>
                                                     <button onClick={() => onUnschedulePost(post.id)} className="absolute top-0 right-0 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TrashIcon className="w-3 h-3"/>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <h3 className="font-bold mb-3">Unscheduled Posts</h3>
                    <div className="space-y-2 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg h-[40vh] lg:h-full overflow-y-auto">
                        {unscheduledPosts.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 p-4">All posts have been scheduled!</p>
                        ) : (
                            unscheduledPosts.map(post => {
                                const PlatformIcon = PLATFORMS.find(p => p.name === post.platform)?.icon;
                                const isDragging = draggedPostId === post.id;
                                return (
                                    <div
                                        key={post.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, post.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-move flex items-center gap-3 transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
                                    >
                                        {PlatformIcon && <PlatformIcon className="w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-300" />}
                                        <p className="font-semibold text-sm truncate">{post.variations[0].post_title}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {campaign.schedulingSuggestions && campaign.schedulingSuggestions.length > 0 && (
                        <div className="mt-4">
                             <h3 className="font-bold mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-500" /> AI Suggestions</h3>
                             <div className="space-y-2 text-xs">
                                {campaign.schedulingSuggestions.map((s, i) => (
                                    <div key={i} className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800/50">
                                        <p className="font-bold text-green-800 dark:text-green-300">{s.platform}: {s.dayOfWeek} @ {s.timeOfDay}</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{s.reasoning}"</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scheduler;