const express = require('express');
const router = express.Router();
const path = require('path');

const ctrlUser = require('../controllers/user');
const ctrlNews = require('../controllers/news');

router.post('/api/login', ctrlUser.login);
router.post('/api/authFromToken', ctrlUser.authFromToken);
router.get('/api/getUsers', ctrlUser.getUsers);
router.post('/api/saveNewUser', ctrlUser.saveNewUser);
router.put('/api/updateUser/:id', ctrlUser.updateUser);
router.delete('/api/deleteUser/:id', ctrlUser.deleteUser);
router.post('/api/saveUserImage/:id', ctrlUser.saveUserImage);
router.put('/api/updateUserPermission/:id', ctrlUser.updateUserPermission);

router.get('/api/getNews', ctrlNews.getNews);
router.post('/api/newNews', ctrlNews.newNews);
router.put('/api/updateNews/:id', ctrlNews.updateNews);
router.delete('/api/deleteNews/:id', ctrlNews.deleteNews);

router.get('*', function (req, res, next) { res.sendFile(path.join(__dirname, '../../dist/index.html')); });

module.exports = router;
