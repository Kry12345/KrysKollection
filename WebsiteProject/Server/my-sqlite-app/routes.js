const express = require('express');
const db = require('./db');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/collection", (req, res) => {
  db.all("SELECT * FROM collectionCard", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get("/setData", (req, res) => {
  db.all("SELECT * FROM sets", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get("/collection/151", (req, res) => {
  db.all("SELECT * FROM collectionCard WHERE cardSet = 'sv03.5'", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Login attempt for email: ${email} ${hashedPassword}`);


  //return res.status(501).json({ success: false, message: "Login not implemented yet" });


  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
    { id: user.id, email: user.email },      // payload (info you want in the token)
    "test",  // secret key
    { expiresIn: "24h" }                      // options (expiration)
  );
    res.json({ success: true, token: token });
  });
});

router.get("/verifyToken", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Token is valid", user: req.user });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, "test", (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}

router.get("/card/quantity/:id", (req, res) => {
  const cardId = req.params.id;
  db.get("SELECT quantity, reverse_quantity FROM collectionCard WHERE id = ?", [cardId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!rows) {
      res.json({found: false});
      return;
    }
    res.json({found: true, quantity: rows.quantity, reverse_quantity: rows.reverse_quantity});
  });
});

router.put("/card/quantity/:id", authenticateToken, (req, res) => {
  const cardId = req.params.id;
  const { type, newQuantity, reverseExists, setId } = req.body;

  db.get("SELECT * FROM collectionCard WHERE id = ?", [cardId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      db.run("INSERT INTO collectionCard (id, cardSet, quantity, reverse_quantity) VALUES (?, ?, ?, ?)", [cardId, setId, type === "normal" ? newQuantity : 0, reverseExists ? (type === "reverse" ? newQuantity : 0) : null], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      return;
      });
      return;
    }
    const updateField = type === "normal" ? "quantity" : "reverse_quantity";
    db.run(`UPDATE collectionCard SET ${updateField} = ? WHERE id = ?`, [newQuantity, cardId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
      return;
    });
  });
});

module.exports = router;