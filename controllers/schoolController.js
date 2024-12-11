import db from '../config/db.js';
import calculateDistance from '../utils/calculateDistance.js';

export const addSchool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Validate input
    if (!name || !address || 
        latitude == null || longitude == null ||
        isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ 
        message: 'Invalid input. All fields are required with valid coordinates.' 
      });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    await db.execute(query, [name, address, parseFloat(latitude), parseFloat(longitude)]);

    res.status(201).json({ 
      message: 'School added successfully',
      school: { name, address, latitude, longitude }
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ 
      message: 'Error adding school', 
      error: error.message 
    });
  }
};

export const listSchools = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate input
    if (latitude == null || longitude == null || 
        isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ 
        message: 'Invalid coordinates. Latitude and longitude are required.' 
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Fetch all schools
    const [rows] = await db.query('SELECT * FROM schools');

    // Calculate and sort distances
    const schoolsWithDistance = rows.map(school => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  } catch (error) {
    console.error('Error listing schools:', error);
    res.status(500).json({ 
      message: 'Error fetching schools', 
      error: error.message 
    });
  }
};