import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Users Dashboard</h1>
      <ul>
        {users.map(user => (
          <li key={user.ID}>{user.Name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;