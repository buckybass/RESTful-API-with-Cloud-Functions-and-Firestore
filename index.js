const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const serviceAccount = require("./serviceAccountKey.json");
const { urlencoded } = require("express");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Main App
const app = express();

app.use(urlencoded({ extended: false }))
app.use(cors({ origin: true }));

// Main database reference
const db = admin.firestore();

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("hi  firebase");
});

// Create -> post()
app.post("/api/create", async (req, res) => {
  try {
    await db.collection('userDetails').doc(`/${Date.now()}/`).create({
      id: Date.now(),
      name: req.body.name,
      mobile: req.body.mobile,
      address: req.body.address
    })
    return res.status(200).send({ status: 'success', msg: 'บันท ึกแล้ว' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: 'failed', msg: 'บันทึกล้มเหลว' })
  }
})

// get -> get()
app.get('/api/get/:id', async (req, res) => {
  try {
    const reqDoc = (db.collection('userDetails').doc(req.params.id));
    let userDetails = await reqDoc.get();
    let responese = userDetails.data();
    if (!responese) {
      return res.status(400).send({ msg: "user not found" })
    }
    return res.status(200).send({ status: "succcess", data: responese })
  } catch (error) {
    return res.status(500).send({ status: "error" })
  }
})

//getAll
app.get('/api/getAll', async (req, res) => {
  try {
    const reqDoc = db.collection('userDetails');
    const user = await reqDoc.get()
    let Alluser = []
    user.forEach(doc => {
      Alluser.push(doc.data())
    });
    console.log(Alluser)

    return res.status(200).send({ status: "succcess", data: Alluser })
  } catch (error) {
    return res.status(500).send({ status: "error" })
  }
})

// Update -> put()
app.put("/api/update/:id", async (req, res) => {
  try {
    const reqDoc = db.collection('userDetails').doc(req.params.id)
    if (!(await reqDoc.get()).data()) {
      return res.status(400).send({ msg: "user not found" })
    }
    await reqDoc.update({
      name: req.body.name,
      mobile: req.body.mobile,
      address: req.body.address
    })
    return res.status(200).send({ status: 'success', msg: 'แก้ไขแล้ว' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: 'failed', msg: 'บันทึกล้มเหลว' })
  }
})

// Delete -> delete()
app.delete("/api/delete/:id", async (req, res) => {
  try {
    const reqDoc = db.collection('userDetails').doc(req.params.id)
    await reqDoc.delete(reqDoc)
    if (!(await reqDoc.get()).data()) {
      return res.status(400).send({ msg: "user not found" })
    }
    return res.status(200).send({ status: 'success', msg: 'ลบแล้ว' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: 'failed', msg: 'บันทึกล้มเหลว' })
  }
})

// exports the api to firebase cl oud functions
exports.app = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
