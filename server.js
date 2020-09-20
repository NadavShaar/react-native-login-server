if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v1: uuidv1 } = require('uuid');

const users = [{id: 1, username: 'nadav', password: '1234', age: 36, firstName: 'Nadav', lastName: 'Shaar'}];
const data = [];
const ignoreAuthorizationOnRoutes = ['/login', '/register'];

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    if(ignoreAuthorizationOnRoutes.find(route => req.url === route)) return next();
    let token = req.headers.authtoken;
    let authToken = data.find(d => d.token === token);
    if(!authToken) return res.sendStatus(401);
    let user = users.find(user => user.id === authToken.id);
    req.user = user;

    next();
})

app.post('/register', (req, res) => {
    const userData = req.body;

    users.push({id: uuidv1(), ...userData});
    res.sendStatus(200);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(user => username === user.username);

    if(!user) return res.status(404).send(`User ${username} not found`);
    if(user.password !== password) return res.status(401).send(`Password incorrect`);

    const authToken = {id: user.id, token: uuidv1(), createdAt: Date.now()};

    data.push(authToken);
    res.status(200).send({authToken, user});
});

app.post('/authorize', (req, res) => {
    const { user } = req;
    res.send({user});
});

app.post('/getUser', (req, res) => {
    const { id } = req.body;
    const user = users.find(user => user.id === id);
    res.send(user);
});

app.listen( process.env.PORT || 3000 );