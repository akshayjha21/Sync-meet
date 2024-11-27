const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(
    'mongodb+srv://user1:akshay21@cluster0.ceq90.mongodb.net/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

// Define Schema
const scheduleSchema = new mongoose.Schema({
    username: String,
    slots: [String], // Array of selected slots, e.g., ['A11', 'B11', 'C12']
});

// Create Model
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Save Schedule
app.post('/save-schedule', async (req, res) => {
    const { username, slots } = req.body;

    try {
        // Save or update user schedule
        const existing = await Schedule.findOne({ username });
        if (existing) {
            existing.slots = slots;
            await existing.save();
        } else {
            const newSchedule = new Schedule({ username, slots });
            await newSchedule.save();
        }

        res.json({ message: 'Schedule saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error saving schedule' });
    }
});

// Fetch Uncommon Slots
app.post('/compare-schedules', async (req, res) => {
    const { username1, username2 } = req.body;

    try {
        // Fetch schedules of two users
        const user1 = await Schedule.findOne({ username: username1 });
        const user2 = await Schedule.findOne({ username: username2 });

        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }

        // Find uncommon slots
        const uncommonSlots = user1.slots.filter(slot => !user2.slots.includes(slot));

        res.json({ uncommonSlots });
    } catch (err) {
        res.status(500).json({ error: 'Error comparing schedules' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
async function saveSchedule() {
    const username = 'user1'; // Replace with dynamic user input
    const selectedSlots = Array.from(document.querySelectorAll('.selected')).map(cell => cell.textContent);

    const response = await fetch('http://localhost:5000/save-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, slots: selectedSlots }),
    });

    const result = await response.json();
    alert(result.message);
}
