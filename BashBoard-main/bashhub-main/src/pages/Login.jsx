import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import { Button } from '@/components/ui/button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(''); // Clear any previous errors
      
        try {
          // Make a POST request to the /login API endpoint
          const response = await axios.post('http://localhost:3000/login', {
            username,
            password,
          });
      
          // If login is successful
          if (response.data.message === 'Login successful') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data
            navigate('/', { replace: true }); // Redirect to home page
          } else {
            setError('Invalid credentials');
          }
        } catch (err) {
          // Handle errors (e.g., network error, invalid credentials)
          if (err.response && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError('An error occurred. Please try again.');
          }
        }
      };

    return (
        <div>
            <div className="flex items-center justify-center min-h-screen bg-white text-black p-4">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg p-6 bg-gray-200 rounded-lg shadow-md">
                <div className="h-16 flex items-center border-b border-gray-200 mb-6">
                    <span className="text-xl md:text-2xl font-semibold">Login</span>
                </div>
                {error && <div className="mb-4 text-red-500 text-sm md:text-base">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 md:p-3 mb-4 border rounded bg-gray-100 border-gray-300 text-black text-sm md:text-base"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 md:p-3 mb-4 border rounded bg-gray-100 border-gray-300 text-black text-sm md:text-base"
                />
                <Button 
                    onClick={handleLogin} 
                    className="w-full p-2 md:p-3 text-white bg-black rounded text-sm md:text-base hover:bg-gray-800 transition-colors" 
                    variant="primary"
                >
                    Login
                </Button>
            </div>
        </div>
        </div>
    );
};

export default Login;