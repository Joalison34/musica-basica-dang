const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comment-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão com MongoDB:', err));

// Esquemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['common', 'moderator', 'owner'], default: 'common' }
});

const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    role: { type: String, required: true },
    text: { type: String },
    timestamp: { type: String, required: true },
    media: { type: String },
    mediaType: { type: String }
});

const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Rotas
app.post('/api/users', async (req, res) => {
    const { username, password, roleCode } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }
    if (await User.findOne({ username })) {
        return res.status(400).json({ error: 'Nome de usuário já existe' });
    }
    let role = 'common';
    if (roleCode === '7733') role = 'moderator';
    if (roleCode === 'ABACATE') role = 'owner';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'Usuário criado' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    res.json({ username: user.username, role: user.role });
});

app.post('/api/comments', async (req, res) => {
    const { username, role, text, media, mediaType } = req.body;
    if (!text && !media) {
        return res.status(400).json({ error: 'Comentário ou mídia são obrigatórios' });
    }
    const comment = new Comment({
        username,
        role,
        text,
        timestamp: new Date().toLocaleString('pt-BR'),
        media,
        mediaType
    });
    await comment.save();
    res.status(201).json({ message: 'Comentário postado' });
});

app.get('/api/comments', async (req, res) => {
    const comments = await Comment.find().sort({ timestamp: -1 });
    res.json(comments);
});

app.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;
    if (role !== 'moderator' && role !== 'owner') {
        return res.status(403).json({ error: 'Não autorizado' });
    }
    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comentário apagado' });
});

app.post('/api/ban', async (req, res) => {
    const { banUsername, currentUser, currentRole } = req.body;
    if (currentRole !== 'owner') {
        return res.status(403).json({ error: 'Apenas o dono pode banir usuários' });
    }
    if (banUsername === currentUser) {
        return res.status(400).json({ error: 'Você não pode banir a si mesmo' });
    }
    await User.deleteOne({ username: banUsername });
    await Comment.deleteMany({ username: banUsername });
    res.json({ message: `Usuário ${banUsername} banido` });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
