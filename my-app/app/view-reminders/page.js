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
    const router = useRouter();
    
    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getSession();
      console.log(data)
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
        };

        fetchReminders();
        const remindersToEvents = (reminders) => {
            const weekdays = {
                Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
            };
    
            const today = new Date();
            const baseDay = startOfWeek(today, { weekStartsOn: 0 });
            const events = [];
        };

    }, []);
    return(<>
        <Navbar className="navbar" />

    
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Medication Schedule</h2>

            {reminders.length === 0 ? (
                <p>No reminders found.</p>
            ) : (
                <ul className="space-y-4">
                    {reminders.map((r) => (
                        <li key={r.id} className="border p-4 rounded shadow">
                            <h3 className="text-lg font-semibold">{r.medication_name}</h3>
                            <p>Type: {r.medication_type}</p>
                            <p>Days: {r.days?.join(', ')}</p>
                            <p>Times: {r.times?.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div></>
    );
}