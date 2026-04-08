import React, { useState } from "react";
import { createAid } from "../../services/aidService";
import { FaFingerprint } from "react-icons/fa";
import { IoStorefrontOutline } from "react-icons/io5";
import { TiLocationOutline } from "react-icons/ti";
import { MdOutlineSecurity } from "react-icons/md";
import { LuHeartHandshake } from "react-icons/lu";
import { ImAidKit } from "react-icons/im";

const initialFormState = {
	damageReportId: "",
	aidType: "Food",
	quantity: "",
	location: {
		country: "",
		province: "",
		district: "",
		city: "",
	},
};

const aidTypes = ["Food", "Water", "Medicine", "Shelter", "Clothing", "Other"];

const locationOptions = {
	"Sri Lanka": {
		Western: {
			Colombo: ["Colombo", "Dehiwala", "Maharagama"],
			Gampaha: ["Negombo", "Gampaha", "Wattala"],
			Kalutara: ["Kalutara", "Panadura", "Horana"],
		},
		Central: {
			Kandy: ["Kandy", "Peradeniya", "Gampola"],
			Matale: ["Matale", "Dambulla", "Galewela"],
			NuwaraEliya: ["Nuwara Eliya", "Hatton", "Talawakele"],
		},
		Southern: {
			Galle: ["Galle", "Ambalangoda", "Hikkaduwa"],
			Matara: ["Matara", "Weligama", "Dikwella"],
			Hambantota: ["Hambantota", "Tangalle", "Tissamaharama"],
		},
		Northern: {
			Jaffna: ["Jaffna", "Nallur", "Chavakachcheri"],
			Kilinochchi: ["Kilinochchi", "Pallai", "Poonakary"],
			Mannar: ["Mannar", "Murunkan", "Pesalai"],
		},
		Eastern: {
			Batticaloa: ["Batticaloa", "Kattankudy", "Eravur"],
			Ampara: ["Ampara", "Kalmunai", "Sammanthurai"],
			Trincomalee: ["Trincomalee", "Kinniya", "Kantale"],
		},
	},
};

const AidRequestForm = () => {
	const [formData, setFormData] = useState(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");
	const countryOptions = Object.keys(locationOptions);
	const provinceOptions = formData.location.country
		? Object.keys(locationOptions[formData.location.country] || {})
		: [];
	const districtOptions = formData.location.country && formData.location.province
		? Object.keys(locationOptions[formData.location.country]?.[formData.location.province] || {})
		: [];
	const cityOptions = formData.location.country && formData.location.province && formData.location.district
		? locationOptions[formData.location.country]?.[formData.location.province]?.[formData.location.district] || []
		: [];
	const mapQuery = [formData.location.city, formData.location.district, formData.location.province, formData.location.country]
		.filter((part) => part && part.trim())
		.join(", ");
	const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || "Sri Lanka")}&z=11&output=embed`;

	const handleChange = (event) => {
		const { name, value } = event.target;

		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			const nextLocation = {
				...formData.location,
				[child]: value,
			};

			if (child === "country") {
				nextLocation.province = "";
				nextLocation.district = "";
				nextLocation.city = "";
			}

			if (child === "province") {
				nextLocation.district = "";
				nextLocation.city = "";
			}

			if (child === "district") {
				nextLocation.city = "";
			}

			setFormData((prev) => ({
				...prev,
				[parent]: {
					...nextLocation,
				},
			}));
			return;
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			await createAid({
				damageReportId: formData.damageReportId,
				aidType: formData.aidType,
				quantity: Number(formData.quantity),
				location: {
					country: formData.location.country.trim(),
					province: formData.location.province.trim(),
					district: formData.location.district.trim(),
					city: formData.location.city.trim(),
				},
			});

			setIsSubmitted(true);
			setFormData(initialFormState);
		} catch (error) {
			setError(error.response?.data?.message || "Unable to submit aid request.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="page-shell">
			<div className="container" style={{ maxWidth: "1240px" }}>
				<div style={{ marginBottom: "1.5rem"  }}>
					<span className="section-label " style={{color:"#192bc2"}}>rebuild with rebuildhub</span>
                  
					<h1 className="page-title">  <ImAidKit />     Submit Your Aid Request</h1>
					<p className="page-subtitle" style={{ maxWidth: "760px" }}>
						Submit only the fields required by the aid API and save them directly to the database.
						 Ensure all address details are precise for localized distribution.
					</p>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "1.1rem",
						alignItems: "start",
					}}
				>
					<form onSubmit={handleSubmit} className="page-card" style={{ padding: "1.5rem" }}>
						{error && <p className="empty-state" style={{ color: "#b4232c", marginBottom: "1rem" }}>{error}</p>}

						{isSubmitted && (
							<div className="empty-state" style={{ color: "#0f5132", borderStyle: "solid", marginBottom: "1rem" }}>
								Aid request submitted successfully.
							</div>
						)}

						<div style={{ marginBottom: "1.2rem" }}>
							<h3 style={{ marginBottom: "0.45rem", fontSize: "1.05rem" }}><FaFingerprint color="#2563EB"  style={{ marginRight: "0.45rem" }}/>     Request Identification</h3>
							<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
								Damage Report ID
							</label>
							<input
								name="damageReportId"
								value={formData.damageReportId}
								onChange={handleChange}
								placeholder="e.g., 67f4f1efc042e8c5b4dbfd31"
								required
							/>
						</div>

						<div style={{ marginBottom: "1.2rem" }}>
							<h3 style={{ marginBottom: "0.65rem", fontSize: "1.05rem" }}><IoStorefrontOutline color="#2563EB"  style={{ marginRight: "0.45rem" }}/> Supply Requirements</h3>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										Food Category
									</label>
									<select name="aidType" value={formData.aidType} onChange={handleChange}>
										{aidTypes.map((type) => (
											<option key={type} value={type}>{type}</option>
										))}
									</select>
								</div>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										Quantity(No of People)
									</label>
									<input
										name="quantity"
										value={formData.quantity}
										onChange={handleChange}
										placeholder="Enter amount"
										type="number"
										min="1"
										required
									/>
								</div>
							</div>
						</div>

						<div style={{ marginBottom: "1.2rem" }}>
							<h3 style={{ marginBottom: "0.65rem", fontSize: "1.05rem" }}><TiLocationOutline  color="#2563EB"  style={{ marginRight: "0.45rem" }}/> Address Details</h3>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										Country
									</label>
									<select
										name="location.country"
										value={formData.location.country}
										onChange={handleChange}
										required
									>
										<option value="">Select country</option>
										{countryOptions.map((country) => (
											<option key={country} value={country}>{country}</option>
										))}
									</select>
								</div>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										Province
									</label>
									<select
										name="location.province"
										value={formData.location.province}
										onChange={handleChange}
										disabled={!formData.location.country}
										required
									>
										<option value="">Select province</option>
										{provinceOptions.map((province) => (
											<option key={province} value={province}>{province}</option>
										))}
									</select>
								</div>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										District
									</label>
									<select
										name="location.district"
										value={formData.location.district}
										onChange={handleChange}
										disabled={!formData.location.province}
										required
									>
										<option value="">Select district</option>
										{districtOptions.map((district) => (
											<option key={district} value={district}>{district}</option>
										))}
									</select>
								</div>
								<div>
									<label style={{ display: "block", fontSize: "0.69rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#5f79ac", marginBottom: "0.5rem" }}>
										City
									</label>
									<select
										name="location.city"
										value={formData.location.city}
										onChange={handleChange}
										disabled={!formData.location.district}
										required
									>
										<option value="">Select city</option>
										{cityOptions.map((city) => (
											<option key={city} value={city}>{city}</option>
										))}
									</select>
								</div>
							</div>
						</div>

						<button
							type="submit"
							className="btn-primary"
							disabled={isSubmitting}
							style={{ width: "100%", marginTop: "0.45rem", padding: "0.82rem 1rem" }}
						>
							{isSubmitting ? "Submitting Request..." : "Submit Aid Request"}
						</button>

						<p style={{ marginTop: "0.6rem", fontSize: "0.72rem", color: "#798eb9", textAlign: "center" }}>
							All submissions are recorded with workflow status for distribution transparency.
						</p>
					</form>

					<div style={{ display: "grid", gap: "1rem", color:"#1338BE" }}>
						<div className="page-card" style={{ overflow: "hidden", padding: 0 , color:"#1338BE",     background: "#eaf1ff"}}>
							<iframe
								title="Target Zone Map"
								src={mapSrc}
								style={{ width: "100%", height: "190px", border: 0 }}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
							
                            <div style={{ padding: "1rem 1rem 1.1rem", color: "#1338BE", background: "#eaf1ff" }}>
								<h3 style={{ fontSize: "1rem", marginBottom: "0.35rem" }}>Target Zone Validation</h3>
								<p style={{ color: "#6179aa", fontSize: "0.88rem", lineHeight: 1.5 }}>
									Location details route requests to the correct district distribution queue.
								</p>
							</div>
						</div>

						<div className="page-card" style={{ padding: "1rem", color:"#1338BE"  }} >
                            
							<h3 style={{ fontSize: "1rem", marginBottom: "0.35rem", marginLeft:"0.1rem" }}><MdOutlineSecurity style={{scale: "1.5" ,padding:"0.1rem"}}/> Verified Entry</h3>
							<p style={{ color: "#6179aa", fontSize: "0.88rem", lineHeight: 1.5 }}>
								Only authenticated users with permitted roles can create aid requests.
							</p>
						</div>

						<div 
							className="page-card"
							style={{
								padding: "1.2rem",
								background: "linear-gradient(135deg, #191970, #0047ab, #000080)",
								color: "#ADD8E6",
								position: "relative",
								overflow: "hidden",
							}}
						>
							<LuHeartHandshake
								style={{
									position: "absolute",
									top: "0.5rem",
									right: "0.6rem",
									fontSize: "5rem",
									opacity: 0.18,
									color: "#ffffff",
									pointerEvents: "none",
								}}
							/>
							<h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#ffffff" }}>Real-Time Impact</h3>
							<p style={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.6, fontSize: "0.9rem" }}>
								Every submitted request enters inventory and approval workflows immediately.
                                Every request submitted triggers an automated logistical review, prioritizing essential supplies for high-damage zones within 24 hours.
                            </p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AidRequestForm;
