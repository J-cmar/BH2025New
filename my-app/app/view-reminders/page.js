'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import Navbar from '../navbar';

export default function ViewReminders() {
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        const fetchReminders = async () => {
            const { data, error } = await supabase.from('medication_schedule').select('*');

            if (error) {
                console.log(`Error fetching reminders: ${error.message}`);
            }

            setReminders(data || []);
        };

        fetchReminders();

    }, []);

    return (<>
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