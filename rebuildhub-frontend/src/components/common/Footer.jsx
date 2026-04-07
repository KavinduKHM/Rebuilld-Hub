import React from "react";

const Footer = () => {
	return (
		<footer className="site-footer" id="contact">
			<div className="container footer-grid">
				<div>
					<div className="footer-brand">
						<span className="brand-mark brand-mark--footer" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M12 2.2 4.5 5.8v5.8c0 4.6 3 8.5 7.5 10.5 4.5-2 7.5-5.9 7.5-10.5V5.8L12 2.2Z" />
								<path d="M8.1 11.2 12 8.4 15.9 11.2M8.1 11.2l2.5 5.2M15.9 11.2l-2.5 5.2M12 8.4v8" />
								<circle cx="12" cy="8.4" r="0.85" fill="currentColor" />
								<circle cx="8.1" cy="11.2" r="0.75" fill="currentColor" />
								<circle cx="15.9" cy="11.2" r="0.75" fill="currentColor" />
								<circle cx="10.6" cy="16.4" r="0.75" fill="currentColor" />
								<circle cx="13.4" cy="16.4" r="0.75" fill="currentColor" />
							</svg>
						</span>
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
