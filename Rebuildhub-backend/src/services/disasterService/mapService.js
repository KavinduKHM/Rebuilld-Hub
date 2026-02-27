exports.generateGoogleMapLink = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

exports.generateEmbedMapLink = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;
};