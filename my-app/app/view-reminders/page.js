'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import Navbar from '../navbar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';

const locales = {
    'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function ViewReminders() {
    const [reminders, setReminders] = useState([]);
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('week');
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getSession();
            console.log(data);
            if (data.session) {
                console.log(data); // already logged in
            } else {
                router.push("/login"); // force login/signup
            }
        };
        checkUser();
    }, [router]);

    useEffect(() => {
        const fetchReminders = async () => {
            const { data, error } = await supabase.from('medication_schedule').select('*');

            if (error) {
                console.log(`Error fetching reminders: ${error.message}`);
            }

            setReminders(data || []);
            setEvents(remindersToEvents(data || []));
        };

        fetchReminders();
    }, []);


    const remindersToEvents = (reminders) => {
        const weekdays = {
            Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
        };

        const today = new Date();
        // Base week start of the current week
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });

        reminders.forEach((item) => {
            const days = Array.isArray(item.days) ? item.days : [];
            const times = Array.isArray(item.times) ? item.times : [];

            // Loop over upcoming weeks
            for (let week = 0; week < weeksToShow; week++) {
                // Calculate the start of the week for this iteration
                const weekStart = new Date(currentWeekStart);
                weekStart.setDate(currentWeekStart.getDate() + week * 7);

                days.forEach((dayStr) => {
                    // Normalize day abbreviation: e.g., "monday" -> "Mon"
                    const dayAbbrev = dayStr.slice(0, 3).toLowerCase().replace(/^./, str => str.toUpperCase());
                    const weekdayNum = weekdays[dayAbbrev];

                    if (weekdayNum === undefined) return;

                    times.forEach((timeStr) => {
                        const [hour, minute] = timeStr.split(':').map(Number);
                        const eventDate = new Date(weekStart);

                        // Adjust the date to the correct weekday of the current week
                        eventDate.setDate(weekStart.getDate() + ((weekdayNum - weekStart.getDay() + 7) % 7));
                        eventDate.setHours(hour);
                        eventDate.setMinutes(minute);
                        eventDate.setSeconds(0);

                        const endDate = new Date(eventDate);
                        endDate.setMinutes(endDate.getMinutes() + 30);

                        events.push({
                            title: `${item.medication_name} (${item.medication_type})`,
                            start: eventDate,
                            end: endDate,
                            allDay: false,
                        });
                    });
                });
            }
        });

        return events;
    };

    const handleDelete = async (reminderId) => {
        const { error } = await supabase
            .from("medication_schedule")
            .delete()
            .eq("id", reminderId);

        if (error) {
            console.error("Failed to delete reminder:", error.message);
            alert("Failed to delete. Try again.");
        } else {
            setReminders((prev) => prev.filter((r) => r.id !== reminderId));
            setEvents((prev) => prev.filter((e) => e.id !== reminderId));
        }
    };



    return (<>
        <Navbar className="navbar" />


        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Medication Schedule</h2>

            {reminders.length === 0 ? (
                <p>No reminders found.</p>
            ) : (
                <ul className="space-y-4">
                    {reminders.map((r) => (
                        <li key={r.id} className="border p-4 rounded shadow flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{r.medication_name}</h3>
                                <p>Type: {r.medication_type}</p>
                                <p>Days: {r.days?.join(', ')}</p>
                                <p>Times: {r.times?.join(', ')}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(r.id)}
                                className="text-red-600 font-semibold hover:underline ml-4"
                            >
                                🗑️ Delete
                            </button>
                        </li>
                    ))}

                </ul>
            )}
        </div>
        <div>
            <h2 className="text-xl font-semibold mt-8 mb-4">Calendar View</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                defaultView="week"
            />
        </div>
    </>
    );
}