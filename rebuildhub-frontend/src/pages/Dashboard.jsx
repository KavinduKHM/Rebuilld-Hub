import React from "react";

const Dashboard = () => {
	return (
		<div className="page-shell">
			<div className="container detail-stack">
				<div className="page-header">
					<div>
						<span className="section-label">Operations Center</span>
						<h1 className="page-title">Dashboard</h1>
						<p className="page-subtitle">
							Live coordination view for disaster relief, aid management, and volunteer response.
						</p>
					</div>
				</div>

				<div className="page-grid page-grid--cards">
					<div className="page-card">
						<h3>Active Incidents</h3>
						<p>Centralized tracking of reported disaster zones and escalation state.</p>
					</div>
					<div className="page-card">
						<h3>Aid Pipeline</h3>
						<p>Request intake, approval, and dispatch status across the relief workflow.</p>
					</div>
					<div className="page-card">
						<h3>Volunteer Network</h3>
						<p>Role-based deployment and coordination for the nearest available responders.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
