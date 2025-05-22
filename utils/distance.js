/**
 * Calculate distance between two points using Haversine formula
 * Perfect for calculating distances between Indian cities
 */
function calculateDistance(userLat, userLon, schoolLat, schoolLon) {
    const earthRadiusKm = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const latDifference = degreesToRadians(schoolLat - userLat);
    const lonDifference = degreesToRadians(schoolLon - userLon);

    // Haversine formula for accurate distance calculation
    const a =
        Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
        Math.cos(degreesToRadians(userLat)) * Math.cos(degreesToRadians(schoolLat)) *
        Math.sin(lonDifference / 2) * Math.sin(lonDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInKm = earthRadiusKm * c;
    return distanceInKm;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export { calculateDistance };