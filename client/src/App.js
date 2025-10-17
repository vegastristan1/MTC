import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [sorMaster, setSorMaster] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/SorMaster')
      .then(res => { console.log("API Response:", res.data);;
        setSorMaster(res.data) 
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <td>
        <ul>
            {Array.isArray(sorMaster) && sorMaster.map(item => (
              <li key={item.ID || item.id || Math.random()}>
                {JSON.stringify(item)}
              </li>
            ))}
        </ul>
      </td>
      
    </div>
  );


}

export default App;