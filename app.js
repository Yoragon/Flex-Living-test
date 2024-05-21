const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const { log } = require('console');

const app = express();
const PORT = 3001;

const propertiesFilePath = './properties.json';

// Middleware to parse the body of POST requests as JSON
app.use(cors());
app.use(bodyParser.json());
// Endpoint to retrieve all properties data from properties.json
app.get('/properties', (req, res) => {
    fs.readFile(propertiesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading properties file:', err);
            return res.status(500).send('Error reading properties file.');
        }
        res.status(200).send(JSON.parse(data));
    });
});

//EndPoint to add a property
app.post('/add-property', (req, res) => {
    const newProperty = req.body;
    fs.readFile(propertiesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading properties file.');
        }
        const properties = JSON.parse(data).properties;
        // Check if the property ID already exists
        if (properties.some(property => property._id === newProperty._id)) {
            return res.status(400).send('Property with the same ID already exists.');
        }
        properties.unshift(newProperty); 
        const updatedData = JSON.stringify({ properties: properties }, null, 2);
        fs.writeFile(propertiesFilePath, updatedData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing properties file.');
            }
            res.status(201).send('Property added');
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//EndPoint to delete a property
app.delete('/delete-property/:id', (req, res) => {
    const propertyId = req.params.id;
    fs.readFile(propertiesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading properties file.');
        }
        let properties = JSON.parse(data).properties;
        const index = properties.findIndex(property => property._id === propertyId);
        if (index === -1) {
            return res.status(404).send('Property not found.');
        }
        properties.splice(index, 1); // Remove the property from the array
        const updatedData = JSON.stringify({ properties: properties }, null, 2);
        fs.writeFile(propertiesFilePath, updatedData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing properties file.');
            }
            res.status(200).send('Property deleted. Index was: ' + index);
        });
    });
});
// Endpoint to update a property
app.put('/update-property/:id', (req, res) => {
    const propertyId = req.params.id;
    const propertyUpdates = req.body;
    fs.readFile(propertiesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading properties file.');
        }
        let properties = JSON.parse(data).properties;
        const index = properties.findIndex(property => property._id === propertyId);
        if (index === -1) {
            return res.status(404).send('Property not found.');
        }
        // Update the property with new data
        properties[index] = { ...properties[index], ...propertyUpdates };
        const updatedData = JSON.stringify({ properties: properties }, null, 2);
        fs.writeFile(propertiesFilePath, updatedData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing properties file.');
            }
            res.status(200).send('Property updated');
        });
    });
});
