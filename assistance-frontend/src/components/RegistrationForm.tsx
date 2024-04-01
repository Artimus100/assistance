// import React, { useState } from 'react';
// import axios from 'axios';

// interface HostRegistrationData {
//   username: string;
//   firstname: string;
//   lastname: string;
//   password: string;
// }

// const RegistrationForm: React.FC = () => {
//   const [formData, setFormData] = useState<HostRegistrationData>({
//     username: '',
//     firstname: '',
//     lastname: '',
//     password: '',
//   });
//   const [message, setMessage] = useState<string>('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:3000/hosts/register', formData);
//       if (response.status === 201) {
//         // Registration successful, generate JWT token
//         const tokenResponse = await axios.post('http://localhost:3000/hosts/register', {
//           username: formData.username,
//         });
//         const token = tokenResponse.data.token;
//         // Store token in local storage
//         localStorage.setItem('jwtToken', token);
//         setMessage('Registration successful');
//       }
//     } catch (error) {
//       console.error('Registration failed:', error as Error);
//       setMessage('Registration failed');
//     }
//   };

//   return (
//     <div>
//       <h2>Host Registration</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Username:</label>
//           <input type="text" name="username" value={formData.username} onChange={handleChange} required />
//         </div>
//         <div>
//           <label>First Name:</label>
//           <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
//         </div>
//         <div>
//           <label>Last Name:</label>
//           <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input type="password" name="password" value={formData.password} onChange={handleChange} required />
//         </div>
//         <button type="submit">Register</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default RegistrationForm;
import { Button, TextField, Card, Typography } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/hosts/register', {
                username: email,
                password: password
            });
            const data = response.data;
            localStorage.setItem('token', data.token);
            window.location.href = 'http://localhost:5173/hostWorkspace'; // Redirect to workspace
        } catch (error) {
            console.error('Signup failed:', error);
            // Handle signup error
        }
    };

    return (
        <div>
            <div style={{
                paddingTop: 150,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Typography variant="h6">
                    Welcome to Coursera. Sign up below
                </Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Card variant="outlined" style={{ width: 400, padding: 20 }}>
                    <TextField
                        onChange={handleEmailChange}
                        fullWidth
                        label="Email"
                        variant="outlined"
                    />
                    <br /><br />
                    <TextField
                        onChange={handlePasswordChange}
                        fullWidth
                        label="Password"
                        variant="outlined"
                        type="password"
                    />
                    <br /><br />
                    <Button
                        size="large"
                        variant="contained"
                        onClick={handleSignup}
                    >
                        Signup
                    </Button>
                </Card>
            </div>
        </div>
    );
}

export default Signup;
