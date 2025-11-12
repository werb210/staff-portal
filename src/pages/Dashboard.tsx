const Dashboard = () => (
  <section className="page">
    <header className="page-header">
      <h2>Dashboard</h2>
      <p>Monitor overall activity across the staff portal.</p>
    </header>
    <div className="grid">
      <div className="card">
        <h3>Pipeline Overview</h3>
        <p>Track the status of all active applications.</p>
      </div>
      <div className="card">
        <h3>Documents</h3>
        <p>Stay on top of pending reviews and approvals.</p>
      </div>
      <div className="card">
        <h3>Communication</h3>
        <p>Respond quickly to borrower questions and alerts.</p>
      </div>
    </div>
  </section>
);

export default Dashboard;
