const API_BASE_URL = 'http://localhost:5000/api/volunteers';

export const registerVolunteer = async (formData) => {
	const response = await fetch(`${API_BASE_URL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	const payload = await response.json();

	if (!response.ok) {
		const firstValidationError = payload?.errors?.[0]?.msg;
		const message = firstValidationError || payload?.message || 'Failed to register volunteer';
		throw new Error(message);
	}

	return payload;
};
