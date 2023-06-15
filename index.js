const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import library uuid

// Inisialisasi Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Inisialisasi cloud storage
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid'); // Import library uuid

const storage = new Storage();
const bucketName = 'storyverse-app.appspot.com';
const datasetFilename = 'dataset.csv';
const bucket = storage.bucket(bucketName);
const datasetBucket = storage.bucket(bucketName);
const datasetFile = datasetBucket.file(datasetFilename);

app.use(express.json());
app.use(cors());

app.use(express.json());
app.use(cors());

// Konfigurasi Multer untuk upload file
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024, // Batas ukuran file 50KB
    },
    fileFilter: (req, file, cb) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed'));
      }
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
        let nextId = 1; // Inisialisasi ID awal

        stream
        .pipe(csv({ quote: '"', strict: true }))
        .on('data', (data) => {
            const { No, Title, Created_date, Author, Url, Article, Category } = data;
            const id = nextId; // Gunakan nilai nextId sebagai ID kustom
            nextId++; // Tambahkan 1 untuk ID selanjutnya
            let CoverImage = '';

            // Assign CoverImage based on No range
            if (No >= 1 && No <= 30) {
                CoverImage = 'https://storage.googleapis.com/storyverse-app.appspot.com/kesehatan_mental.jpg';
            } else if (No >= 31 && No <= 36) {
                CoverImage = 'https://storage.googleapis.com/storyverse-app.appspot.com/mistis.jpg';
            } else if (No >= 37 && No <= 71) {
                CoverImage = 'https://storage.googleapis.com/storyverse-app.appspot.com/pengalaman_pribadi.jpg';
            } else if (No >= 72 && No <= 91) {
                CoverImage = 'https://storage.googleapis.com/storyverse-app.appspot.com/percintaan.jpg';
            } else if (No >= 92 && No <= 110) {
                CoverImage = 'https://storage.googleapis.com/storyverse-app.appspot.com/profesi.jpg';
            }

    dataset.push({ id, Title, Created_date, Author, Url, Article, Category, CoverImage });
})
        .on('end', () => {
            // Return the dataset as a response
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(dataset));
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

app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
      const { title, description } = req.body;
      const file = req.file;
  
      if (!title || !description) {
        return res.status(400).json({ error: true, message: 'Title and description are required' });
      }
  
      if (!file) {
        return res.status(400).json({ error: true, message: 'No file uploaded' });
      }
  
      const fileName = file.originalname;
      const photoDestination = path.join('images/', fileName); // Folder tujuan file foto dalam cloud storage
      const uploadDestination = path.join('upload/', `${uuidv4()}.json`); // Folder tujuan file upload dalam cloud storage
  
      const fileBuffer = file.buffer;
      const fileSize = file.size;
  
      if (fileSize > 50 * 1024) {
        return res.status(400).json({ error: true, message: 'File size exceeds the limit of 50KB' });
      }
  
      // Upload file foto ke Cloud Storage
      const photoBlob = bucket.file(photoDestination); // Menggunakan folder tujuan file foto dalam penyimpanan
      const photoBlobStream = photoBlob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      photoBlobStream.on('error', (error) => {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: true, message: 'Failed to upload photo' });
      });
  
      photoBlobStream.on('finish', async () => {
        // Respon sukses dengan URL foto yang diunggah
        const photoUrl = `https://storage.googleapis.com/${bucketName}/${photoDestination}`;
  
        // Upload file upload ke Cloud Storage
        const uploadData = {
          fileUrl: photoUrl,
          title,
          description,
          uploadId: uuidv4(),
        };
  
        const uploadBlob = bucket.file(uploadDestination); // Menggunakan folder tujuan file upload dalam penyimpanan
        const uploadBlobStream = uploadBlob.createWriteStream({
          metadata: {
            contentType: 'application/json',
          },
        });
  
        uploadBlobStream.on('error', (error) => {
          console.error('Error uploading upload data:', error);
          res.status(500).json({ error: true, message: 'Failed to upload upload data' });
        });
  
        uploadBlobStream.on('finish', async () => {
          // Respon sukses dengan URL stories yang diunggah
          const uploadUrl = `https://storage.googleapis.com/${bucketName}/${uploadDestination}`;
          res.status(200).json({ error: false, message: 'File uploaded successfully', uploadUrl });
        });
  
        uploadBlobStream.end(JSON.stringify(uploadData));
      });
  
      photoBlobStream.end(fileBuffer);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: true, message: 'Failed to upload file' });
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
