import React from "react";
import { RebuildHubLogo } from "./RebuildHubLogo.jsx";

const Footer = () => {
	return (
		<footer className="site-footer" id="contact">
			<div className="container footer-grid">
				<div>
					<div className="footer-brand">
						<RebuildHubLogo className="brand-mark brand-mark--footer" />
						<strong>RebuildHub</strong>
					</div>
					<p>
						Smart disaster relief and aid management platform. Bridging the gap between
						chaos and coordination for affected communities worldwide.
					</p>
				</div>

				<div>
					<h4>Platform</h4>
					<p>Crisis Analytics</p>
					<p>Logistics Engine</p>
					<p>Volunteer Portal</p>
				</div>

				<div>
					<h4>Support</h4>
					<p>Emergency Contact</p>
					<p>Help Center</p>
					<p>Status Page</p>
				</div>

				<div>
					<h4>Newsletter</h4>
					<p>Stay updated on global relief efforts.</p>
					<div className="newsletter-row">
						<input type="email" placeholder="Enter your email" aria-label="Email address" />
						<button className="btn-primary" type="button">→</button>
					</div>
				</div>
			</div>

			<div className="container footer-bottom">
				<span>© 2024 RebuildHub Disaster Relief Management. All rights reserved.</span>
			</div>
		</footer>
	);
};

export default Footer;
