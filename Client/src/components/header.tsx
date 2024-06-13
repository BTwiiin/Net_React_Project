import React, { useContext, useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../main';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/workshop.webp';
import './components.css';

const Header: React.FC = observer(() => {
    const store = useContext(Context);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    const handleLogout = async () => {
        await store.logout();
        if (store.state.isLoggedIn === false) {
            navigate('/login');
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header style={{ backgroundColor: '#078eb5' }} className="p-4 flex justify-between items-center">
            <button
                className="flex items-center space-x-2"
                onClick={() => {
                    navigate('/');
                }}
            >
                <img src={Logo} alt="Car Workshop Logo" className="w-8 h-8 rounded-full" />
            </button>
            <nav>
                <ul className="flex space-x-4">
                    {store.state.isLoggedIn ? (
                        <li className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="text-white hover:underline flex items-center space-x-2"
                            >
                                Hello, {store.state.username}!
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 dropdown-menu">
                                    <button
                                        onClick={() => {
                                            navigate('/schedule');
                                            setDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        My Schedule
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    ) : (
                        <>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
});

export default Header;
