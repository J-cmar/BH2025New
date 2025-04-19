import { useState } from 'react';
import { supabase } from 'my-app/app/supabaseClient.js'; 

export default function RemindersInfo()
{
    const [medication, setMedication] = useState('');
    const [medicationType, setMedicationType] = useState('');
    const [days, setDays] = useState([]);
    const [times, setTimes] = useState([]);
}