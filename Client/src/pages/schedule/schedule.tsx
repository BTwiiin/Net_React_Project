import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../constants/consts';
import { TimeSlot } from '../../viewmodels/viewmodels';
import { addDays, startOfWeek, format, parseISO, endOfDay, isAfter, startOfDay, isBefore } from 'date-fns';
import { isEqual } from 'date-fns/fp';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProfilePage = observer(() => {
    const navigate = useNavigate();

    const [userInformation, setUserInformation] = useState({
        username: '',
        hourlyRate: 0,
        timeSlots: [] as TimeSlot[],
    });
    const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function getUserInformation() {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/user/specific`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    },
                    credentials: 'include',
                });

                const data = await response.json();
                if (response.ok) {
                    setUserInformation({
                        username: data.username,
                        hourlyRate: data.hourlyRate,
                        timeSlots: data.timeSlots,
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        getUserInformation();
    }, []);

    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
    const previousWeek = () => setCurrentWeek(addDays(currentWeek, -7));

    const timeSlots = isLoading ? [] : userInformation.timeSlots;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center w-3/4 bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold">My Schedule</h3>
                <div className="mt-8 w-full">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="container mx-auto p-4 relative">
                            <div className="flex justify-center items-center mb-4 relative">
                                <button className="absolute left-0 p-2 text-gray-700 bg-gray-100 rounded-full" onClick={previousWeek}>
                                    <FiArrowLeft size={24} />
                                </button>
                                <h2 className="text-2xl text-gray-800">{format(currentWeek, 'MMM do')} - {format(addDays(currentWeek, 6), 'MMM do')}</h2>
                                <button className="absolute right-0 p-2 text-gray-700 bg-gray-100 rounded-full" onClick={nextWeek}>
                                    <FiArrowRight size={24} />
                                </button>
                            </div>
                            {timeSlots.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <h2 className="text-4xl text-gray-600">
                                        You have nothing scheduled
                                    </h2>
                                </div>
                            ) : (
                                <div className="grid grid-cols-8 gap-2">
                                    <div></div>
                                    {daysOfWeek.map(day => (
                                        <div key={day} className="text-center font-bold text-sm text-gray-800">{day}</div>
                                    ))}
                                    {[...Array(10)].map((_, hour) => (
                                        <React.Fragment key={hour}>
                                            <div className="text-right pr-4 text-gray-800">{hour + 9}:00</div>
                                            {daysOfWeek.map((_, dayIndex) => {
                                                const day = addDays(currentWeek, dayIndex);
                                                const slotHour = new Date(day).setHours(hour + 9);
                                                const startOfDayHour = startOfDay(day);
                                                const endOfDayHour = endOfDay(day);
                                                const timeSlot = timeSlots.find(timeSlot => {
                                                    const startTime = parseISO(timeSlot.startTime);
                                                    const endTime = parseISO(timeSlot.endTime);
                                                    return isAfter(startTime, startOfDayHour) && isBefore(endTime, endOfDayHour) && (isAfter(slotHour, startTime) || isEqual(startTime, slotHour)) && isBefore(slotHour, endTime);
                                                });

                                                if (timeSlot) {
                                                    return (
                                                        <div key={dayIndex} className="relative border border-gray-300 h-12">
                                                            <button onClick={() => navigate(`/ticket/${timeSlot.ticketId}`)} className="w-full h-full bg-green-500 text-white text-sm flex items-center justify-center rounded-lg shadow-md transition-transform transform hover:scale-105">
                                                                <span className="font-bold mr-2">Ticket {timeSlot.id}</span>
                                                                <FiArrowRight />
                                                            </button>
                                                        </div>
                                                    );
                                                } else {
                                                    return <div key={dayIndex} className="border border-gray-300 h-12"></div>;
                                                }
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProfilePage;
