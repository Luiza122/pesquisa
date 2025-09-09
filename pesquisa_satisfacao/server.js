const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session'); // Para gerenciar sessões
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const path = require('path');


const app = express();
const PORT = 21062;

app.use('/img', express.static(path.join(__dirname, 'img'), {
    maxAge: 0,  // Não permitir cache
    setHeaders: (res, path) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');  // Desabilita o cache
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }));

// Middleware para interpretar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração de sessão
app.use(session({
    secret: 'segredo', // Você pode mudar isso
    resave: false,
    saveUninitialized: true
}));

// Definir pasta para servir arquivos estáticos (por exemplo, form.html)
app.use(express.static('public'));

// Conexão com o banco de dados MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'wwgrup_kaua',
    password: 'Raizes@412tech',
    database: 'wwgrup_pesquisa_satisfacao',
    timezone: 'Z', // Para usar o UTC ou ajuste para '-03:00'
    waitForConnections: true,
    connectionLimit: 200, // Limite de conexões simultâneas
    queueLimit: 0 // Sem limite para fila de espera
});

//Exporta o pool como uma promessa para uso nas rotas
const db = pool.promise();

module.exports = db; // Exporta o pool para uso em outras partes do código, se necessário

// Rota para a página inicial (formulário)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

// Rota para login da pesquisa
app.post('/login-pesquisa', (req, res) => {
    const { username, password } = req.body;

    const validUsers = [
        { unidade: 'administrador', username: 'admin', password: 'admin123' },
        { unidade: 'CROMUS', username: 'cromus', password: 'Cr0mUs_!@2025' },
        { unidade: 'CROMUS LANCHONETE', username: 'cromus_lanchonete', password: 'Cr0mUsL@nCh0n3t3!2025' },
        

    ];

    const user = validUsers.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        req.session.user = {
            username: user.username,
            unidade: user.unidade,
        };
        res.redirect('/index.html'); // Redireciona para a página index.html
    } else {
        res.status(401).send('Usuário ou senha inválidos');
    }
});


const mealSchedules = {
    'administrador': {
      almoço: { inicio: 9, fim: 0 },
    },
   
    'CROMUS': {
      almoço: { inicio: 8.5, fim: 14.5},
      jantar: { inicio: 16.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'CROMUS LANCHONETE': {
          almoço: { inicio: 8.5, fim: 14.5},
          jantar: { inicio: 16.5, fim: 21.5 },
          ceia: { inicio: 23.5, fim: 4 },
        },
    'UNIDADE TESTE': {
         almoço: { inicio: 6, fim: 22 },
      
    },
  };
  
  app.get('/get-horarios/:unidade', (req, res) => {
    const unidade = req.params.unidade.toLowerCase(); // Normalizar para minúsculas
    console.log("Unidade recebida no endpoint:", unidade); // Para depuração
    const horarios = mealSchedules[unidade] || {};
    console.log("Horários encontrados:", horarios); // Para depuração
    res.json(horarios);
});
  

// Rota para buscar dados da sessão
app.get('/get-session-data', (req, res) => {
    if (req.session.user) {
        res.json({ unidade: req.session.user.unidade });
    } else {
        res.status(403).json({ error: 'Não autorizado' });
    }
});

// Rota para a página de login de admin
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Rota para a página de administração
app.get('/admin', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/public/admin.html');
    } else {
        res.send('Por favor, faça login para ver esta página.');
    }
});

// Middleware para adicionar dados de unidade e tipo de refeição na sessão antes do redirecionamento ao formulário
// Rota para preparar o formulário (aceita GET e POST)
app.all('/prepare-form', (req, res) => {
    const { unidade, tipo_refeicao } = req.method === 'GET' ? req.query : req.body;

    if (!unidade || !tipo_refeicao) {
        res.status(400).send('Unidade e Tipo de Refeição são obrigatórios');
        return;
    }

    // Validação de horário (opcional, se necessário)
    const horariosPermitidos = {
        almoço: { inicio: 6, fim: 17 }, // 6h às 17h
        jantar: { inicio: 13.5, fim: 23.5 }, // 13h30 às 23h30
        ceia: { inicio: 23, fim: 5 }, // 23h às 5h do dia seguinte
        desjejum: { inicio: 4, fim: 11.5 } // 4h às 11h30
    };

    const agora = new Date();
    const horaAtual = agora.getHours() + agora.getMinutes() / 60;

    const horario = horariosPermitidos[tipo_refeicao];
    if (!horario) {
        res.status(400).send('Tipo de Refeição inválido');
        return;
    }

    const { inicio, fim } = horario;
    const dentroDoHorario =
        (horaAtual >= inicio && horaAtual <= fim) || // Caso normal
        (fim < inicio && (horaAtual >= inicio || horaAtual <= fim)); // Atravessando a meia-noite

    if (!dentroDoHorario) {
        res.status(400).send('Fora do horário permitido para esta refeição');
        return;
    }

    // Armazena os dados na sessão
    req.session.unidade = unidade;
    req.session.tipo_refeicao = tipo_refeicao;

    // Redireciona para o formulário de feedback
    res.redirect('/form.html');
});

app.get('/api/session-data', (req, res) => {
    // Envia os dados da sessão como JSON para o cliente
    res.json({
        unidade: req.session.unidade,
        tipo_refeicao: req.session.tipo_refeicao
    });
});

const moment = require("moment-timezone");


// Supondo que você tenha o campo `dataHora` retornado do banco de dados
const dataHoraRecuperada = "2025-02-17 13:03:11";  // Exemplo de data retornada do banco

const dataHoraBrasilia = moment.utc(dataHoraRecuperada).tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");
console.log("Data ajustada para São Paulo:", dataHoraBrasilia);

// Obtendo a data/hora correta no fuso de São Paulo
const dataHoraString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss");

// Convertendo a string para um objeto Date
const dataHora = new Date(dataHoraString);

// Função para formatar a data no estilo brasileiro
const formatarData = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
};

const dataFormatada = formatarData(dataHora);
console.log("Data formatada:", dataFormatada);

// Exemplo de uso ao processar uma rota, supondo que temos uma data ISO no banco de dados
app.get('/formatar-data', (req, res) => {
    const exemploDataISO = '16-12-2024T00:00Z'; // Exemplo de data ISO
    // Convertendo a data para o fuso horário de São Paulo
    const dataHoraMoment = moment.utc(exemploDataISO).tz("America/Sao_Paulo");
    const dataFormatada = formatarDataBrasileira(dataHoraMoment);
    

    res.send(`Data formatada no estilo brasileiro: ${dataFormatada}`);
});


app.post('/submit-feedback', async (req, res) => {
    const { nome, sabor_refeicao, apresentacao_refeicao, temperatura_refeicao, limpeza_organizacao, atendimento_equipa, comentario } = req.body;
    const dataHora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Recupera unidade e tipo de refeição da sessão
    const unidade = req.session.unidade;
    const tipo_refeicao = req.session.tipo_refeicao;

    // Checa se unidade e tipo de refeição estão presentes
    if (!unidade || !tipo_refeicao) {
        res.status(400).send('Unidade e Tipo de Refeição são obrigatórios.');
        return;
    }

    const sql = `
        INSERT INTO feedback 
        (nome, tipo_refeicao, sabor_refeicao, apresentacao_refeicao, temperatura_refeicao, limpeza_organizacao, atendimento_equipa, comentario, unidade, dataHora) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nome, tipo_refeicao, sabor_refeicao, apresentacao_refeicao, temperatura_refeicao, limpeza_organizacao, atendimento_equipa, comentario, unidade, dataHora];

    try {
        const [result] = await db.execute(sql, values);
        console.log('Feedback salvo com sucesso!', result);

        res.send(`
            <html>
                <head>
                    <title>Sucesso</title>
                    <link rel="stylesheet" href="styles.css">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #f0f0f0;
                        }
                        .success-message {
                            padding: 20px;
                            border-radius: 5px;
                            background-color: #dff0d8;
                            color: #3c763d;
                            font-size: 24px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-message">
                        Feedback enviado com sucesso! Obrigado pela sua participação!
                    </div>
                    <script>
                        setTimeout(() => {
                            window.location.href = '/form.html';
                        }, 5000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro ao salvar feedback no banco de dados:', error);
        res.status(500).send('Erro ao enviar o feedback');
    }
});

// Rota para buscar feedbacks
app.get('/feedbacks', async (req, res) => {
    const sql = `
        SELECT nome, tipo_refeicao, unidade, sabor_refeicao, apresentacao_refeicao, temperatura_refeicao, limpeza_organizacao, atendimento_equipa, comentario, dataHora 
        FROM feedback
    `;

    try {
        // Usa `db.query` para buscar os dados
        const [results] = await db.query(sql);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar feedbacks:', error);
        res.status(500).send('Erro ao buscar feedbacks');
    }
});


// Rota para exportar feedbacks como CSV
app.get('/export-csv', async (req, res) => {
    const sql = `
        SELECT unidade, nome, tipo_refeicao, 
               sabor_refeicao, apresentacao_refeicao, 
               temperatura_refeicao, limpeza_organizacao, 
               atendimento_equipa, comentario, data_hora 
        FROM feedback`;

    try {
        const [results] = await db.query(sql); // Correção aqui: usando db.query()

        const csvWriter = createCsvWriter({
            path: 'feedbacks.csv',
            header: [
                { id: 'unidade', title: 'Unidade' },
                { id: 'nome', title: 'Nome' },
                { id: 'tipo_refeicao', title: 'Tipo de Refeição' },
                { id: 'sabor_refeicao', title: 'Sabor da Refeição' },
                { id: 'apresentacao_refeicao', title: 'Apresentação da Refeição' },
                { id: 'temperatura_refeicao', title: 'Temperatura da Refeição' },
                { id: 'limpeza_organizacao', title: 'Limpeza e Organização' },
                { id: 'atendimento_equipa', title: 'Atendimento da Equipe' },
                { id: 'comentario', title: 'Comentário' },
                { id: 'dataHora', title: 'Data e Hora' }
            ]
        });

        await csvWriter.writeRecords(results);
        console.log('Arquivo CSV gerado com sucesso!');
        res.download('feedbacks.csv');
    } catch (err) {
        console.error('Erro ao buscar feedbacks:', err);
        res.status(500).send('Erro ao buscar feedbacks');
    }
});

// Rota para exportar feedbacks como Excel
app.get('/export-excel', async (req, res) => {
    const sql = `
        SELECT unidade, nome, tipo_refeicao, 
               sabor_refeicao, apresentacao_refeicao, 
               temperatura_refeicao, limpeza_organizacao, 
               atendimento_equipa, comentario, timestamp 
        FROM feedback`;

    try {
        const [results] = await db.query(sql); // Correção aqui: usando db.query()

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Feedbacks');

        worksheet.columns = [
            { header: 'Unidade', key: 'unidade' },
            { header: 'Nome', key: 'nome' },
            { header: 'Tipo de Refeição', key: 'tipo_refeicao' },
            { header: 'Sabor da Refeição', key: 'sabor_refeicao' },
            { header: 'Apresentação da Refeição', key: 'apresentacao_refeicao' },
            { header: 'Temperatura da Refeição', key: 'temperatura_refeicao' },
            { header: 'Limpeza e Organização', key: 'limpeza_organizacao' },
            { header: 'Atendimento da Equipe', key: 'atendimento_equipa' },
            { header: 'Comentário', key: 'comentario' },
            { header: 'Data e Hora', key: 'timestamp' }
        ];

        results.forEach((feedback) => {
            worksheet.addRow(feedback);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=feedbacks.xlsx');

        await workbook.xlsx.write(res);
        console.log('Arquivo Excel gerado com sucesso!');
        res.end();
    } catch (err) {
        console.error('Erro ao buscar feedbacks:', err);
        res.status(500).send('Erro ao gerar o arquivo Excel');
    }
});

// Rota para login do administrador
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Lista de usuários válidos
    const users = [
        { username: 'admin', password: 'Cucinare@2025' },
        { username: 'robinho', password: 'robinho@2025' }
    ];

    // Verifica se existe um usuário correspondente
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        req.session.loggedin = true;
        res.redirect('/admin');
    } else {
        res.status(401).send('Credenciais inválidas. Tente novamente.');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return;
        }
        res.redirect('/login');
    });
});


// Só libera a pergunta para CROMUS no dia 12/09
function liberarPerguntaSetor(unidade, data = new Date()) {
  const u = String(unidade || '').trim().toUpperCase();
  const d = new Date(data);
  const dia = d.getDate();
  const mes = d.getMonth() + 1; // jan = 0
  return u === 'CROMUS' && dia === 12 && mes === 9;
}

// Endpoint que o front consulta; aceita ?force=1 para testar fora do dia 12
app.get('/api/pergunta-setor', (req, res) => {
  const unidade = (req.session && req.session.unidade) ? req.session.unidade : '';
  const force = req.query.force === '1' || req.query.force === 'true';
  res.json({ mostrarPerguntaSetor: force || liberarPerguntaSetor(unidade) });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
