const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
  const securMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
  const securPassword =  /^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
  if (!securMail.test(req.body.email)) {
    return res.status(401).json({ message: 'Format Email invalide'});
  } 
  else if (!securPassword.test(req.body.password)) {
    return res.status(401).json({ message: 'Le MDP doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial et avoir minimum 10 caractères'});
  } else {
      bcrypt.hash(req.body.password, 10)
          .then(hash => {
              const user = new User({ email: req.body.email, password: hash });
              user.save()
              .then(() => res.status(201).json({ message: 'Utilisateur créé!' }))
              .catch(error => res.status(400).json({ error }));
          })
          .catch(error => res.status(500).json({ error }))
}};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};