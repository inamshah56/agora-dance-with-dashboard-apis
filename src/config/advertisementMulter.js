// multer configuration for events

import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

// Function to create directory if it doesn't exist
const createDirectoryIfNotExists = (directory) => {
    try {
        mkdirSync(directory, { recursive: true });
    } catch (error) {
        console.error(`Error creating directory: ${error}`);
    }
};

const storage = diskStorage({
    destination: (req, file, cb) => {
        const eventTitle = req.body.title; // Assuming title is provided in request body
        const destinationPath = resolve(`static/images/advertisement/${eventTitle}`);

        // Create directory if it doesn't exist
        createDirectoryIfNotExists(destinationPath);

        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original filename for simplicity
    },
});

export default storage;
