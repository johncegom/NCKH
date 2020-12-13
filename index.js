if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
        pingInterval: 10000,
        pingTimeout: 50000,
});
const mqtt = require('paho-mqtt');
const bcrypt = require('bcryptjs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [
    {
        id: '1606041902892',
        email: 'tai@nckh',
        password: '$2b$10$m/rHTpsw.1ZI68jY23KqB.k5Z.XSOW/00FR8xEe9VeK1g/Ur.4FCO'
    },
    {
        id: '1606495243682',
        email: 'tho@nckh',
        password: '$2b$10$s7AgD7tAn3yMmot5lhXROe37f8cv8.d6UeUhhZw1G.QjtaNK/SXKG'
    },
    {
        id: '1606495310956',
        email: 'nminh@nckh',
        password: '$2b$10$JKmp.bNaQEAEY6xkWhE.EOM4z5C/cGLr/Ruin.Vhj4LMKE3xevpBa'
    },
    {
        id: '1606495355892',
        email: 'hminh@nckh',
        password: '$2b$10$xDAZKOvtIu1jXjjkUXOriuXLIgYaKd/nnFIPQPqwaWfx1vKE3PdBm'
    }
]

// sewer scheduler
var schedule =[];

app.set('view-engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.email });
});

//app.get('/register', checkNotAuthenticated, (req, res) => {
//    res.render('register.ejs')
//});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login');
    } catch (error) {
        req.redirect('/register');
    }
    console.log(users);
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/posts', (_req, res) => {
    res.json(posts)
});

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
});

app.post('/schedule', (req, res) => {
    schedule.push(req.body);
});

app.get('/schedule', (req, res) => {
    let data = JSON.stringify(schedule);
    res.end(data);
    // console.log(schedule);
})

app.post('/schedule/remove', (req, res) => {
    console.log(req.body);
    schedule = schedule.filter((item) => {
        return item['id'] != req.body.id;
    });
    console.log(schedule);
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

io.on('connection', (socket) => {
    console.log('client connected | ' + socket.id);

    socket.on('image-channel', img => {
        // console.log(img);
        io.emit('imageSend', img);
        io.emit('received', 1);
    });

    socket.on('danger-alert', is_danger => {
        var isDanger = is_danger;
        io.emit('isDanger', is_danger);
        console.log('Is Danger: ', is_danger);
    });

    socket.on('connect_failed', function(err){
        console.log('connection failed: ',err);
    });

    socket.on('error', function(err){
        console.log('error: ', err);
    });

    socket.on('disconnect', () => {
        console.log('client disconnected | ' + socket.id);
    });
});

server.listen(3000, () => {
    console.log('listen at 3000');
});
