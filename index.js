const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(4000, () => {
            console.log("Server is Running at http://localhost:4000/");
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

// POST API
app.post('/addNotes', async (request, response) => {
    try {
        const notesDetails = request.body;
        const { title, description, archieve, is_delete } = notesDetails;
        const sqlQuery = `
        INSERT INTO notes
            (title, description, archieve, is_delete) 
        VALUES (?, ?, ?, ?)
    `;

        await db.run(sqlQuery, [title, description, archieve, is_delete]);
        response.status(200).send("Note added successfully!");
    } catch (e) {
        console.error(`Error adding note: ${e.message}`);
        response.status(500).send("An error occurred while adding the note.");
    }
});

// GET API
app.get('/getNotes', async (request, response) => {
    try {
        const sqlQuery = `
            SELECT 
                * 
            FROM 
                notes 
            WHERE 
                archieve = 0 AND is_delete = 0;
        `;

        const notes = await db.all(sqlQuery);

        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

//PUT API when I click on archieve button then the archieve become its value to 1 and again click on it then it become 0
app.put('/updateArchievedNotes', async (request, response) => {
    try {
        const notesDetails = request.body;
        const { id, archieve } = notesDetails;
        const sqlQuery = `
        UPDATE notes
        SET archieve = ?
        WHERE id = ?;
        `
        await db.run(sqlQuery, [archieve, id]);
        response.status(200).send("Note updated successfully!");
    } catch (e) {
        console.error(`Error updating note: ${e.message}`);
        response.status(500).send("An error occurred while updating the note.");
    }
});


//GET API for archieve true condition only based on the above put api corresponding rows will be stored in this GET API
app.get('/getArchivedNotes', async (request, response) => {
    try {
        const sqlQuery = `
        SELECT
            *
        FROM 
            notes
        WHERE 
            archieve = 1 AND is_delete = 0;
        `;

        const notes = await db.all(sqlQuery);
        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

//PUT API when I click on delete button then the is_delete become its value to 1 and again click on it then it become 0
app.put('/updateDeleteNotes', async (request, response) => {
    try {
        const notesDetails = request.body;
        const { id, is_delete } = notesDetails;
        const sqlQuery = `
        UPDATE 
            notes
        SET 
            is_delete = ?
        WHERE 
            id = ?;
        `;
        
        await db.run(sqlQuery, [is_delete, id]);
        response.status(200).send("Note updated successfully!");
    } catch (e) {
        console.error(`Error updating note: ${e.message}`);
        response.status(500).send("An error occurred while updating the note.");
    }
});

//GET API for delete true condition only based on the above put api corresponding rows will be stored in this GET API
app.get('/getDeletedNotes', async (request, response) => {
    try {
        const sqlQuery = `
        SELECT
            *
        FROM
            notes
        WHERE
            is_delete = 1 AND archieve = 0;
        `;

        const notes = await db.all(sqlQuery);
        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

//GET API
app.get('/', async (request, response) => {
    try {
        response.send("Backend is Started");
    } catch (e) {
        console.error(e.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});