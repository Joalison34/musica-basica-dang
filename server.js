const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const usersFile = 'users.json';
const commentsFile = 'comments.json';

async function initFiles() {
    try {
        await fs.access(usersFile);
    } catch {
        await fs.writeFile(usersFile, JSON.stringify([]));
    }
    try {
        await fs.access(commentsFile);
    } catch {
        await fs.writeFile(commentsFile, JSON.stringify([]));
    }
}

initFiles();

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/register', async (req, res) => {
    const { username, password, code } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome e senha são obrigatórios.' });
    }

    const users = JSON.parse(await fs.readFile(usersFile));
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Usuário já existe.' });
    }

    let role = 'user';
    if (code === '3237') {
        role = 'moderator';
    } else if (code === 'ABACATE') {
        role = 'owner';
    }

    const user = {
        username,
        password: hashPassword(password),
        role
    };
    users.push(user);
    await fs.writeFile(usersFile, JSON.stringify(users));
    res.json({ message: 'Conta criada.' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(await fs.readFile(usersFile));
    const user = users.find(u => u.username === username && u.password === hashPassword(password));
    if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    if (user.banned) {
        return res.status(403).json({ message: 'Conta banida.' });
    }
    res.json({ user: { username: user.username, role: user.role } });
});

app.post('/comments', async (req, res) => {
    const { username, content } = req.body;
    const users = JSON.parse(await fs.readFile(usersFile));
    const user = users.find(u => u.username === username);
    if (!user || user.banned) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const comments = JSON.parse(await fs.readFile(commentsFile));
    const comment = {
        id: comments.length + 1,
        username,
        role: user.role,
        content,
        timestamp: new Date().toISOString()
    };
    comments.push(comment);
    await fs.writeFile(commentsFile, JSON.stringify(comments));
    res.json({ message: 'Comentário postado.' });
});

app.get('/comments', async (req, res) => {
    const comments = JSON.parse(await fs.readFile(commentsFile));
    res.json(comments);
});

app.delete('/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    const users = JSON.parse(await fs.readFile(usersFile));
    const user = users.find(u => u.username === username);
    if (!user || !['moderator', 'owner'].includes(user.role)) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    let comments = JSON.parse(await fs.readFile(commentsFile));
    comments = comments.filter(c => c.id !== parseInt(id));
    await fs.writeFile(commentsFile, JSON.stringify(comments));
    res.json({ message: 'Comentário apagado.' });
});

app.post('/ban', async (req, res) => {
    const { username, targetUsername } = req.body;
    const users = JSON.parse(await fs.readFile(usersFile));
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'owner') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const targetUser = users.find(u => u.username === targetUsername);
    if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    if (targetUser.role === 'owner') {
        return res.status(403).json({ message: 'Não é possível banir outro dono.' });
    }

    targetUser.banned = true;
    await fs.writeFile(usersFile, JSON.stringify(users));
    res.json({ message: 'Usuário banido.' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
