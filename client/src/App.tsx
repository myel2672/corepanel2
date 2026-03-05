import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.text())
      .then(data => setMessage(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>CorePanel Client</h1>
      <p>API Response:</p>
      <pre>{message}</pre>
    </div>
  );
}

export default App;