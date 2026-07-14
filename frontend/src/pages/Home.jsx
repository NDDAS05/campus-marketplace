import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Campus Marketplace</h1>
      {user ? <p>Welcome back, {user.name}!</p> : <p>You're not logged in.</p>}
    </div>
  );
}