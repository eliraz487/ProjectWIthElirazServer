import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2/promise';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { signInWithEmailAndPassword } from 'firebase/auth';
import 'dotenv/config';



const app = express();
const PORT = process.env.PORT || 3000;

const serviceAccount ={
    "type": process.env.type,
    "project_id": process.env.type,
    "private_key_id": process.env.type,
    "private_key": process.env.private_key,
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri":process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url,
    "universe_domain": process.env.universe_domain,
}


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.json());
app.use(cors());

// Database configuration
const dbConfig = {
    host: '193.203.166.12',
    user: 'u398523801_eliraz487',
    password: 'Manraz147@',
    database: 'u398523801_discussionfeed',
};

// Maps for converting strings to foreign key IDs

// Function to load maps from the database


// Load maps initially
const initialConnection = await mysql.createConnection(dbConfig);
await initialConnection.end();

// Middleware to connect to the database at the start of each request
const connectToDatabase = async (req, res, next) => {
    try {
        req.dbConnection = await mysql.createConnection(dbConfig);
        next();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        res.status(500).json({ message: 'Failed to connect to database' });
    }
};

// Middleware to close the database connection at the end of each request
const closeDbConnection = async (req, res, next) => {
    if (req.dbConnection) {
        await req.dbConnection.end();
    }
    next();
};

app.use(connectToDatabase);

// API to get all cities
app.get('/cities', async (req, res) => {
    try {
        const [cities] = await req.dbConnection.query('SELECT * FROM City ORDER BY City');
        res.status(200).json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get cities' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to get all genders
app.get('/genders', async (req, res) => {
    try {
        const [genders] = await req.dbConnection.query('SELECT * FROM Gender');
        res.status(200).json(genders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get genders' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to get all religions
app.get('/religions', async (req, res) => {
    try {
        const [religions] = await req.dbConnection.query('SELECT * FROM Religion');
        res.status(200).json(religions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get religions' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to get all educations
app.get('/educations', async (req, res) => {
    try {
        const [educations] = await req.dbConnection.query('SELECT * FROM Education');
        res.status(200).json(educations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get educations' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to get all economic situations
app.get('/economic-situations', async (req, res) => {
    try {
        const [economicSituations] = await req.dbConnection.query('SELECT * FROM EconomicSituation');
        res.status(200).json(economicSituations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get economic situations' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});



// Register user API
app.post('/register', async (req, res) => {
    const userData = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email: userData.email,
            emailVerified: false,
            phoneNumber: `+972${userData.phone}`, // assuming Israeli phone numbers
            password: userData.password,
            displayName: `${userData.firstName} ${userData.lastName}`,
            disabled: false,
        });


        await req.dbConnection.query(
            'INSERT INTO Users (GoogleUserID, FirstName, Lastname, Email, Phone, Gender, Religion, BirthDate, City, EconomicSituation, Education, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userRecord.uid,
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.phone,
                userData.gender,
                userData.religion,
                userData.birthDate,
                userData.city,
                userData.economicSituation,
                userData.education,
                true,
            ]
        );
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register user' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to send validation email
app.post('/send-validation-email', async (req, res) => {
    const { email } = req.body;

    try {
        // Send validation email (dummy implementation)
        // Replace with your actual email sending logic
        console.log(`Sending validation email to ${email}`);
        res.status(200).json({ message: 'Validation email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send validation email' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

// API to validate user code
app.post('/validate-code', async (req, res) => {
    const { email, code } = req.body;

    try {
        // Validate code (dummy implementation)
        // Replace with your actual code validation logic
        if (code === '123456') {
            res.status(200).json({ message: 'Code validated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid code' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to validate code' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});


// Login user API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(admin.auth(), email, password);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Here you should implement your own password verification logic

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to login user' });
    } finally {
        await closeDbConnection(req, res, () => {});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
