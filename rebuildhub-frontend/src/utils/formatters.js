export const formatCurrencyLKR = (value) => {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return "N/A";

	return new Intl.NumberFormat("en-LK", {
		style: "currency",
		currency: "LKR",
		maximumFractionDigits: 0,
	}).format(amount);
};
