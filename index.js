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
    'mongodb+srv://user1:akshay21@cluster0.ceq90.mongodb.net/schedulesDB',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

// Define Schema for Predefined Slots
const predefinedSlotSchema = new mongoose.Schema({
    slots: [String], // Array of predefined slots
});

const PredefinedSlot = mongoose.model('PredefinedSlot', predefinedSlotSchema);

// Define Schema for User Schedules
const scheduleSchema = new mongoose.Schema({
    username: String,
    slots: [String], // Array of selected slots
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// Initialize Predefined Slots in DB
async function initializeSlots() {
    const predefinedSlots = [
        'A11', 'B11', 'C11', 'A21', 'A14', 'B21', 'C21',
        'D11', 'E11', 'F11', 'D21', 'E14', 'E21', 'F21',
        'A12', 'B12', 'C12', 'A22', 'B14', 'B22', 'A24',
        'D12', 'E12', 'F12', 'D22', 'F14', 'E22', 'F22',
        'A13', 'B13', 'C13', 'A23', 'C14', 'B23', 'B24',
        'D13', 'E13', 'F13', 'D23', 'D14', 'D24', 'E23',
    ];

    const existingSlots = await PredefinedSlot.findOne();
    if (!existingSlots) {
        const newPredefinedSlots = new PredefinedSlot({ slots: predefinedSlots });
        await newPredefinedSlots.save();
        console.log('Predefined slots initialized');
    }
}

// Call the initialization function
initializeSlots();

// Save User Schedule
app.post('/save-schedule', async (req, res) => {
    const { username, slots } = req.body;

    try {
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

// Compare Slots for Multiple Users and Return Uncommon Slots
app.post('/compare-schedules', async (req, res) => {
    const { usernames } = req.body;

    try {
        // Fetch schedules for all users
        const userSchedules = await Schedule.find({ username: { $in: usernames } });

        if (userSchedules.length !== usernames.length) {
            return res.status(404).json({ error: 'One or more users not found' });
        }

        // Fetch predefined slots
        const predefined = await PredefinedSlot.findOne();
        if (!predefined) {
            return res.status(404).json({ error: 'Predefined slots not found' });
        }

        // Collect all user-selected slots
        const allUserSlots = userSchedules.map(user => user.slots);

        // Flatten all user-selected slots into a single array
        const mergedSlots = allUserSlots.flat();

        // Find uncommon slots by comparing merged slots with predefined slots
        const uncommonSlots = predefined.slots.filter(slot => !mergedSlots.includes(slot));

        res.json({ uncommonSlots });
    } catch (err) {
        res.status(500).json({ error: 'Error comparing schedules' });
    }
});

// Fetch Predefined Slots
app.get('/predefined-slots', async (req, res) => {
    const predefined = await PredefinedSlot.findOne();
    if (!predefined) {
        return res.status(404).json({ error: 'Predefined slots not found' });
    }
    res.json(predefined.slots);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
