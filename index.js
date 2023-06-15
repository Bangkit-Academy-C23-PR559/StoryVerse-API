const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Inisialisasi cloud storage
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid'); // Import library uuid

const storage = new Storage();
const bucketName = 'storyverse-app.appspot.com';
const datasetFilename = 'dataset.csv';
const datasetBucket = storage.bucket(bucketName);
const datasetFile = datasetBucket.file(datasetFilename);

// Inisialisasi Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(express.json());
app.use(cors());

// Konfigurasi penyimpanan multer
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'Upload/'); // Mengganti direktori tujuan penyimpanan file
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuid.v4()}-${file.originalname}`;
            cb(null, uniqueName); // Menggunakan UUID untuk memberikan nama unik ke file
        },
    }),
    limits: {
        fileSize: 50000, // Batas ukuran file 50KB
    },
    fileFilter: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        if (extname !== '.png' && extname !== '.jpg') {
            return cb(new Error('Only PNG and JPG files are allowed'));
        }
        cb(null, true);
    },
});

// API endpoint untuk user register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    // validasi panjang password
    if (password.length < 8) {
        return res.status(400).json({ error: true, message: 'Password must be at least 8 characters' });
    }

    try {
        // cek apakah email sudah terdaftar
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (!snapshot.empty) {
            return res.status(400).json({ error: true, message: 'Email already exists' });
        }

        // menyimpan data user ke firebase
        await db.collection('users').add({ name, email, password });

        // respon sukses
        res.status(201).json({ error: false, message: 'User Created' });
    } catch (error) {
        // respon jika ada kesalahan data
        console.error('Error registering user:', error);
        res.status(500).json({ error: true, message: 'Failed to register user' });
    }
});

// API endpoint untuk user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // mencari user berdasarkan email
        const querySnapshot = await db.collection('users').where('email', '==', email).get();
        if (querySnapshot.empty) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // ambil data user dari hasil query
        const user = querySnapshot.docs[0].data();

        // verifikasi password
        if (user.password !== password) {
            return res.status(401).json({ error: true, message: 'Invalid password' });
        }

        // generate custom token JWT menggunakan Firebase Admin SDK
        const uid = querySnapshot.docs[0].id;
        const customToken = await admin.auth().createCustomToken(uid);

        // respon dengan data user dan token
        res.status(200).json({
            error: false,
            message: 'Success',
            loginResult: {
                userId: uid,
                name: user.name,
                token: customToken,
            },
        });
    } catch (error) {
        // respon jika terjadi kesalahan saat akses database
        console.error('Error logging in:', error);
        res.status(500).json({ error: true, message: 'Failed to login' });
    }
});

// API endpoint untuk cloud storage
app.get('/api/dataset', async (req, res) => {
    try {
        // Read the dataset file
        const stream = datasetFile.createReadStream();

        // Process the dataset
        const dataset = [];

        const csv = require('csv-parser');

        stream
            .pipe(csv())
            .on('data', (data) => {
                const { Title, Created_date, Author, Url, Category } = data;
                const id = uuid.v4();
                dataset.push({ id, Title, Created_date, Author, Url, Category });
            })
            .on('end', () => {
                // Return the dataset as a response
                res.json(dataset);
            })
            .on('error', (err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint untuk mengunggah foto, judul, dan deskripsi cerita
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Photo is required' });
        }

        const { path, mimetype } = file;

        if (!title || !description) {
            // Memeriksa apakah judul atau deskripsi kosong
            fs.unlinkSync(path); // Menghapus file yang diunggah
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const fileSize = fs.statSync(path).size;
        if (fileSize > 50000) {
            // Memeriksa apakah ukuran file melebihi batas
            fs.unlinkSync(path); // Menghapus file yang diunggah
            return res.status(400).json({ error: 'File size exceeds the limit of 50KB' });
        }

        return res.json({ success: true, message: 'Story uploaded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint untuk menyimpan komentar
app.post('/api/comment', async (req, res) => {
    try {
        const { comment } = req.body;

        // Buat ID unik menggunakan UUID
        const commentId = uuidv4();

        // Simpan komentar ke Firestore dengan ID yang dihasilkan
        await db.collection('comment').doc(commentId).set({ comment });

        // Respon sukses dengan ID komentar
        res.status(200).json({ success: true, commentId });
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ error: true, message: 'Failed to save comment' });
    }
});

// API endpoint untuk mengedit komentar berdasarkan ID
app.put('/api/comment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        // Periksa apakah komentar dengan ID yang diberikan ada di Firestore
        const commentRef = db.collection('comment').doc(id);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return res.status(404).json({ error: true, message: 'Comment not found' });
        }

        // Update komentar dengan nilai yang baru
        await commentRef.update({ comment });

        // Respon sukses
        res.status(200).json({ success: true, message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: true, message: 'Failed to update comment' });
    }
});

// API endpoint untuk menghapus komentar berdasarkan ID
app.delete('/api/comment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Periksa apakah komentar dengan ID yang diberikan ada di Firestore
        const commentRef = db.collection('comment').doc(id);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return res.status(404).json({ error: true, message: 'Comment not found' });
        }

        // Hapus komentar dari Firestore
        await commentRef.delete();

        // Respon sukses
        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: true, message: 'Failed to delete comment' });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
