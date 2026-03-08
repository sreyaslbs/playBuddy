export interface CityInfo {
    city: string;
    state: string;
}

export const INDIAN_LOCATIONS: CityInfo[] = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Surat', state: 'Gujarat' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Kanpur', state: 'Uttar Pradesh' },
    { city: 'Nagpur', state: 'Maharashtra' },
    { city: 'Indore', state: 'Madhya Pradesh' },
    { city: 'Thane', state: 'Maharashtra' },
    { city: 'Bhopal', state: 'Madhya Pradesh' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
    { city: 'Patna', state: 'Bihar' },
    { city: 'Vadodara', state: 'Gujarat' },
    { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { city: 'Ludhiana', state: 'Punjab' },
    { city: 'Agra', state: 'Uttar Pradesh' },
    { city: 'Nashik', state: 'Maharashtra' },
    { city: 'Faridabad', state: 'Haryana' },
    { city: 'Meerut', state: 'Uttar Pradesh' },
    { city: 'Rajkot', state: 'Gujarat' },
    { city: 'Kalyan-Dombivli', state: 'Maharashtra' },
    { city: 'Vasai-Virar', state: 'Maharashtra' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Srinagar', state: 'Jammu and Kashmir' },
    { city: 'Aurangabad', state: 'Maharashtra' },
    { city: 'Dhanbad', state: 'Jharkhand' },
    { city: 'Amritsar', state: 'Punjab' },
    { city: 'Navi Mumbai', state: 'Maharashtra' },
    { city: 'Prayagraj', state: 'Uttar Pradesh' },
    { city: 'Ranchi', state: 'Jharkhand' },
    { city: 'Howrah', state: 'West Bengal' },
    { city: 'Jabalpur', state: 'Madhya Pradesh' },
    { city: 'Gwalior', state: 'Madhya Pradesh' },
    { city: 'Vijayawada', state: 'Andhra Pradesh' },
    { city: 'Jodhpur', state: 'Rajasthan' },
    { city: 'Madurai', state: 'Tamil Nadu' },
    { city: 'Raipur', state: 'Chhattisgarh' },
    { city: 'Kota', state: 'Rajasthan' },
    { city: 'Guwahati', state: 'Assam' },
    { city: 'Chandigarh', state: 'Chandigarh' },
    { city: 'Solapur', state: 'Maharashtra' },
    { city: 'Hubballi-Dharwad', state: 'Karnataka' },
    { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
];

export const STATES = Array.from(new Set(INDIAN_LOCATIONS.map(loc => loc.state))).sort();

export const getCitiesByState = (state: string) => {
    return INDIAN_LOCATIONS
        .filter(loc => loc.state === state)
        .map(loc => loc.city)
        .sort();
};
