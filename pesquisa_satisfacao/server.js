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
        { unidade: 'quitandeiros', username: 'quitandeiros', password: 'Quitandeiros@2025!' },
        { unidade: 'ANTOLIN TAUBATE', username: 'antolin_taubate', password: 'Antolin@2025!' },
        { unidade: 'BUNGE SANTOS', username: 'bunge_santos', password: 'Bunge@2025!' },
        { unidade: 'ANTOLIN CACAPAVA', username: 'antolin_cacapava', password: 'Antolin@2025!' },
        { unidade: 'ADEZAN CACAPAVA', username: 'adezan_cacapava', password: '@dezan2025!' },
        { unidade: 'AGROCERES', username: 'agroceres', password: 'AgR0C#r3s!567' },
        { unidade: 'ALBRAS', username: 'albras', password: '@lbr@5_!234' },
        { unidade: 'ALESTIS', username: 'alestis', password: 'AlEsT1$456' },
        { unidade: 'ALPHAPARK DISO', username: 'alphapark_diso', password: 'Alpha@diso!' },
        { unidade: 'ALPHAPARK ROBIEL', username: 'alphapark_robiel', password: 'Alpha@robiel!' },
        { unidade: 'AMAZON TRANSPORTES', username: 'amazon_transportes', password: '@m@z0nTr@nsP0rt3s!' },
        { unidade: 'ANDRIELLO LAPA', username: 'andriello_lapa', password: '@ndr13ll0lapa' },
         { unidade: 'ANDRIELLO LIMAO', username: 'andriello_limao', password: '@ndr13ll0$limao' },
        { unidade: 'ANHEMBI', usernamfe: 'anhembi', password: '@nH3mb!_123' },
        { unidade: 'BENASSI', username: 'benassi', password: 'B3n@$$!2024' },
        { unidade: 'BLANVER', username: 'blanver', password: 'Bl@nv3r!5678' },
        { unidade: 'BOSAL ITUPEVA', username: 'bosal_itupeva', password: 'B0$@l1TUp3v@_999' },
        { unidade: 'BRASLIMPO', username: 'braslimpo', password: 'Br@sl!mp0@123' },
        { unidade: 'BUNGE', username: 'bunge', password: 'BunG3!_4F567' },
        { unidade: 'CAMESA DUTRA', username: 'camesa_dutra', password: 'C@m3$@DuTr@_2025' },
        { unidade: 'CAMPO LIMPO', username: 'campo_limpo', password: 'C@mP0_L!mp0@123' },
        { unidade: 'CASTELO', username: 'castelo', password: 'C@st3l0_!2025' },
        { unidade: 'CBE', username: 'cbe', password: 'CBE_!@123' },
        { unidade: 'CBP', username: 'cbp', password: 'Cbp#2025!' },
        { unidade: 'CIP', username: 'cip', password: 'C1P@#2025' },
        { unidade: 'COBREQ', username: 'cobreq', password: 'C0br3q!_1234' },
        { unidade: 'CONVERPLAST AMANCIO', username: 'converplast_amancio', password: 'C0nv3rPl@st@_@m@nc10' },
        { unidade: 'CONVERPLAST AMANCIO 1', username: 'converplast_amancio1', password: 'C0nv3rP1@st_@m@nc10_1!' },
        { unidade: 'CONVERPLAST MATRIZ', username: 'converplast_matriz', password: 'C0nv3rPl@st@_M@tr1z_2025' },
        { unidade: 'CORPAK FILIAL', username: 'corpak_filial', password: 'C0rp@kF1l!@l#2025' },
        { unidade: 'CORPAK MATRIZ', username: 'corpak_matriz', password: 'C0rp@k_M@tr1z!2025' },
        { unidade: 'CORREIAS MERCURIO', username: 'correias_mercurio', password: 'C0rr3!@sM3rcUr10!' },
        { unidade: 'COURO TOP', username: 'couro_top', password: 'C0Ur0T0p_!@123' },
        { unidade: 'CROMUS', username: 'cromus', password: 'Cr0mUs_!@2025' },
        { unidade: 'CROMUS LANCHONETE', username: 'cromus_lanchonete', password: 'Cr0mUsL@nCh0n3t3!2025' },
        { unidade: 'CULLIGAN', username: 'culligan', password: 'CulL1g@N!@987' },
        { unidade: 'DELTA PARK', username: 'delta_park', password: 'D3lt@P@rk_2025' },
        { unidade: 'DINATECNICA', username: 'dinatecnica', password: 'D1n@t3cn1c@_2025!' },
        { unidade: 'DISO', username: 'diso', password: 'D!s0_#2025' },
        { unidade: 'DV3', username: 'dv3', password: 'D_V3@123' },
        { unidade: 'FANEM', username: 'fanem', password: 'F@n3m!_#2025' },
        { unidade: 'FARMARIN ARMAZEM', username: 'farmarin_armazem', password: 'F@rm@r1n!A_2025' },
        { unidade: 'FARMARIN FILIAL', username: 'farmarin_filial', password: 'F@rm@r1n!F_2025' },
        { unidade: 'FARMARIN MATRIZ', username: 'farmarin_matriz', password: 'F@rm@r1n!M_2025' },
        { unidade: 'FITAS ESTRELA', username: 'fitas_estrela', password: 'F1t@s_Estr3l@_2025' },
        { unidade: 'FLEXFORM ', username: 'flexform', password: 'Fl3xF0rm@2025!' },
        { unidade: 'FORTE VEICULOS ', username: 'forte_veiculos', password: 'F0rt3!2025' },
        { unidade: 'FOX CABREUVA ', username: 'fox_cabreuva', password: 'F0xC@br3uv@_#2025' },
        { unidade: 'FOX CAMPINAS ', username: 'fox_campinas', password: 'F0xC@mP1n@5_!2025' },
        { unidade: 'GCP', username: 'gcp', password: 'GCP_2025@#' },
        { unidade: 'GIMI 1', username: 'gimi1', password: 'G!m1_@2025' },
        { unidade: 'GIMI 2', username: 'gimi2', password: 'G!m2_@2025' },
        { unidade: 'GIOVANELLA', username: 'giovanella', password: 'G!0v@N3ll@_2025' },
        { unidade: 'HEBRAICA', username: 'hebraica', password: 'H3br@1c@2025_!' },
        { unidade: 'HITECH', username: 'hitech', password: 'H!t3ch_2025!' },
        { unidade: 'HOGANAS', username: 'hoganas', password: 'H0g@n@5_!2025' },
        { unidade: 'HUF', username: 'huf', password: 'H!f_#2024' },
        { unidade: 'IBER OLEFF', username: 'iber_oleff', password: '!B3r0l3ff@2025' },
        { unidade: 'IMBERA', username: 'imbera', password: '!mb3r@2025_!' },
        { unidade: 'IMERYS RT', username: 'imerys_rt', password: '!m3rY$R7_2025' },
        { unidade: 'INDUSCABOS', username: 'induscabos', password: 'induscabos_2025' },
        { unidade: 'ITM', username: 'itm', password: '!TM@2025' },
        { unidade: 'JAPAUTO', username: 'japauto', password: 'J@p@ut0_2025!' },
        { unidade: 'JMB', username: 'jmb', password: 'JmB@#2025' },
        { unidade: 'JOTAEME', username: 'jotaeme', password: 'J0t@3m3!2025' },
        { unidade: 'KAWAGRAF', username: 'kawagraf', password: 'K@w@gR@f_2025!' },
        { unidade: 'KURITA', username: 'kurita', password: 'K@r!T@_2025' },
        { unidade: 'LANMAR', username: 'lanmar', password: 'L@nm@r_2025!' },
        { unidade: 'LCI', username: 'lci', password: 'Lci@2025' },
        { unidade: 'LEPE', username: 'lepe', password: 'L3p3@2025!' },
        { unidade: 'LEROY JAGUARE', username: 'leroy_jaguare', password: 'L3r0yJ@g@r3!2025' },
        { unidade: 'LEROY MORUMBI', username: 'leroy_morumbi', password: 'L3r0yM0rumb1@2025' },
        { unidade: 'LINDAL', username: 'lindal', password: 'L1nd@l_2025!' },
        { unidade: 'LOCOMOTIVA', username: 'locomotiva', password: 'L0c0m0t!v@_2025' },
        { unidade: 'LUXALUM', username: 'luxalum', password: 'LUX@lUm_!2025' },
        { unidade: 'MACDERMID', username: 'macdermid', password: 'M@cd3rm!d_2025!' },
        { unidade: 'MARISA', username: 'marisa', password: 'M@r!s@_2025' },
        { unidade: 'MBCC', username: 'mbcc', password: 'MBC@2025_!' },
        { unidade: 'MERSEN', username: 'mersen', password: 'M3rs3n_@2025' },
        { unidade: 'MINEBEA ', username: 'minebea', password: 'M!n3b3@2025' },
        { unidade: 'MOSCA', username: 'mosca', password: 'M0sc@2025!' },
        { unidade: 'MURCIA', username: 'murcia', password: 'M!rc14@2025' },
        { unidade: 'NAGEL', username: 'nagel', password: 'N@g3l_2025' },
        { unidade: 'NAUTIKA', username: 'nautika', password: 'Nautika_2025' },
        { unidade: 'NHL', username: 'nhl', password: 'NHL_@2025' },
        { unidade: 'NITA', username: 'nita', password: 'N!t@_2025' },
        { unidade: 'NOVARES', username: 'novares', password: 'N0v@r3$2025' },
        { unidade: 'ORICA', username: 'orica', password: '0r!c@2025_!' },
        { unidade: 'PACIFICO LOG', username: 'pacifico_log', password: 'P@c1f!c0L0g_2025' },
        { unidade: 'PARKER DIADEMA', username: 'parker_diadema', password: 'P@rk3rD!@d3m@_2025' },
        { unidade: 'PARKER JACAREI', username: 'parker_jacarei', password: 'P@rk3rJ@c@r31_2025' },
        { unidade: 'PARKER PERUS', username: 'parker_perus', password: 'P@rk3rP3ru$2025' },
        { unidade: 'PARKER SJC', username: 'parker_saojose', password: 'P@rk3rS@0J0s3D0$C@mp0s2025' },
        { unidade: 'PAULUS COTIA', username: 'paulus_cotia', password: 'P@u1usC0t!@2025' },
        { unidade: 'PERFIL LIDER', username: 'perfil_lider', password: 'P3rf!lL!d3r_2025' },
        { unidade: 'PIFFERPRINT', username: 'pifferprint', password: 'P1ffer_2025' },
        { unidade: 'PLANMAR', username: 'planmar', password: 'Pl@nM@r_2025' },
        { unidade: 'POLIMIX AGREGADOS', username: 'polimix_agregados', password: 'P0l!m1x_@gr3g@d0$2025' },
        { unidade: 'POLIMIX CONCRETO', username: 'polimix_concretos', password: 'P0l!m1xC0ncr3t0_2025' },
        { unidade: 'PURATOS FILIAL', username: 'puratos_filial', password: 'P#ur@t0sF1l!@l2025' },
        { unidade: 'PURATOS MATRIZ', username: 'puratos_matriz', password: 'P#ur@t0sM@tr1z_2025' },
        { unidade: 'RCN', username: 'rcn', password: 'RCN_2025!' },
        { unidade: 'REFAL', username: 'refal', password: 'R3f@l2025!' },
        { unidade: 'REIS OFFICE', username: 'reis_office', password: 'R3!$0ff1c3@2025' },
        { unidade: 'SMAGALHAES GUARUJA', username: 'smagalhaes_guaruja', password: 'SM@galhesGj@_2025' },
        { unidade: 'SMAGALHAES SANTOS', username: 'smagalhaes_santos', password: 'SM@galhessnt@_2025' },
        { unidade: 'SAGE ', username: 'sage', password: 'S@g3_2025!' },
        { unidade: 'SAINT GOBAIN', username: 'saint_gobain', password: 'S@!ntG0b@!n_2025' },
        { unidade: 'SCHUTZ VASITEX1', username: 'schutz_vasitex1', password: 'Schutz1@2025' },
        { unidade: 'SCHUTZ VASITEX2', username: 'schutz_vasitex2', password: 'Schutz2@2025' },
        { unidade: 'SCHUTZ VASITEX3', username: 'schutz_vasitex3', password: 'Schutz3@2025' },
        { unidade: 'SILGAN JUNDIAI', username: 'silgan_jundiai', password: 'S!lg@nJund1@!_2025' },
        { unidade: 'SILGAN JUNDIAI LANCHONETE', username: 'silgan_jundiailanchonete', password: 'S!lg@nJund1@!L@nc#2025' },
        { unidade: 'SILGAN MOGI', username: 'silgan_mogi', password: 'S!lg@nM0g!_2025' },
        { unidade: 'SILGAN VALINHOS', username: 'silgan_valinhos', password: 'S!lg@nV@l!nh0$2025' },
        { unidade: 'SINER', username: 'siner', password: 'S!n3r@_2025' },
         { unidade: 'SINERII', username: 'siner2', password: 'S!n3r2@_2025' },
        { unidade: 'SINTO BRASIL ATIBAIA', username: 'sinto_atibaia', password: 'S!nt0Br@' },
        { unidade: 'SINTO BRASILSP', username: 'sinto_sp', password: 'S!nt0Br@S!l_SP2025' },
        { unidade: 'SOFT SPUMA', username: 'soft_spuma', password: 'S0ft$Pum@_1234' },
        { unidade: 'SOLISTICA', username: 'solistica', password: 'S0l!$t!c@_2025' },
        { unidade: 'SOLISTICA LANCHONETE', username: 'solistica_lanchonete', password: 'S0l!$t!c@L@nch_567' },
        { unidade: 'SONOCO', username: 'sonoco', password: 'S0n0c0!!' },
        { unidade: 'SPAL ITABIRITO', username: 'spal_itabirito', password: 'SP@l!t@b!r!t0!' },
        { unidade: 'SPAL MOGI DAS CRUZES ', username: 'spal_mogi', password: 'SP@lM0g1D@sCruz3s#' },
        { unidade: 'SPAL SANTOS ', username: 'spal_santos', password: 'SP@l$@nt0s_!456' },
        { unidade: 'SPG', username: 'spg', password: 'SPG_@2025!' },
        { unidade: 'SUECO', username: 'sueco', password: 'Sueco@2025!' },
        { unidade: 'SULZER', username: 'sulzer', password: 'S#ulz3r!2025' },
        { unidade: 'TAGMA', username: 'tagma', password: 'T@gm@2025_!' },
        { unidade: 'TATUZINHO', username: 'tatuzinho', password: 'T@tuz1nh0@123' },
        { unidade: 'TECFIL 1', username: 'tecfil1', password: 'T3cf!l_1!2025' },
        { unidade: 'TECFIL 1 LANCHONETE', username: 'tecfi1_lanchonete', password: 'T3cf!lL@nc#2025' },
        { unidade: 'TECFIL 3', username: 'tecfil3', password: 'T3cf!l_3@456' },
        { unidade: 'TECHNIPLAS', username: 'techniplas', password: 'T3chn!pl@s!2025' },
        { unidade: 'TEKNO', username: 'tekno', password: 'T3kn0!@2025' },
        { unidade: 'THREEBOND', username: 'threebond', password: 'Thr33B0nd@5678' },
        { unidade: 'TOYOBO', username: 'toyobo', password: 'T0y0b0_2025!' },
        { unidade: 'TOYOBO AMERICANA', username: 'toyobo_americana', password: 'T0y0b0_2025!' },
        { unidade: 'TROPICAL', username: 'tropical', password: 'Tr0p!c@l@2025' },
        { unidade: 'TRUCKVAN', username: 'truckvan', password: 'Tr@ckv@n_1234' },
        { unidade: 'TWE BETIM', username: 'twe_betim', password: 'TW3B3t1m#567' },
        { unidade: 'TWE CACAPAVA', username: 'twe_cacapava', password: 'TW3C@C@p@v@!2025' },
        { unidade: 'TWE SBC', username: 'twe_sbc', password: 'TW3SBC_!123' },
        { unidade: 'UNIVAR', username: 'univar', password: 'Un1v@r_!2025' },
        { unidade: 'VAE BRASIL', username: 'vae_brasil', password: 'V@3Br@s!l2025' },
        { unidade: 'VALGROUP', username: 'valgroup', password: 'V@lGr0up@5678' },
        { unidade: 'VIGOR', username: 'vigor', password: 'V1gor@2025!' },
        { unidade: 'VOPAK', username: 'vopak', password: 'V0p@k!' },
        { unidade: 'UNIDADE TESTE', username: 'teste', password: 'teste' },
        { unidade: 'WILSON SONS', username: 'wilson_sons', password: 'W!ls0nS0ns#2025' },

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
    'alphapark diso': {
      almoço: { inicio: 10, fim: 15 },
      jantar: { inicio: 17, fim: 21 },
    },
    'alphapark robiel': {
      almoço: { inicio: 10, fim: 15 },
      jantar: { inicio: 17.5, fim: 22 },
    },
    'antolin taubate': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 19, fim: 21 },
    },
    'antolin cacapava': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 18.5, fim: 23 },
    },
    'bunge santos': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 20.5 },
      ceia: { inicio: 21.5, fim: 1 },
    },
    'converplast amancio': {
      almoço: { inicio: 10, fim: 14 },
      jantar: { inicio: 18, fim: 21.5 },
      desjejum: { inicio: 5, fim: 9 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'converplast amancio 1': {
      almoço: { inicio: 10, fim: 14 },
      jantar: { inicio: 18, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 2.5 },
    },
    'converplast matriz': {
      almoço: { inicio: 9.5, fim: 14 },
      jantar: { inicio: 17.5, fim: 21.5 },
      desjejum: { inicio: 5, fim: 9 },
      ceia: { inicio: 22.5, fim: 2.5 },
    },
    'gimi 1': {
      almoço: { inicio: 9.5, fim: 14 },
      jantar: { inicio: 17, fim: 19.5 },
      desjejum: { inicio: 5.5, fim: 8 },
    },
    'gimi 2': {
      almoço: { inicio: 10.5, fim: 14.5 },
      desjejum: { inicio: 6, fim: 8 },
    },
    'orica': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17, fim: 21 },
      desjejum: { inicio: 5.5, fim: 8 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'puratos filial': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 20 },
      desjejum: { inicio: 5, fim: 9 },
    },
    'puratos matriz': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21.5 },
      desjejum: { inicio: 5, fim: 9 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'vae brasil': {
      almoço: { inicio: 11, fim: 14.5 },
      jantar: { inicio: 19, fim: 21.5 },
      desjejum: { inicio: 3.5, fim: 9.5 },
    },
    'vigor': {
      almoço: { inicio: 10, fim: 15.5 },
      jantar: { inicio: 16, fim: 20 },
      desjejum: { inicio: 4.5, fim: 10.5 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'soft spuma': {
      almoço: { inicio: 11, fim: 14 },
      desjejum: { inicio: 6, fim: 8 },
    },
    'rcn': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17, fim: 19.5 },
      desjejum: { inicio: 4, fim: 9 },
      ceia: { inicio: 0.5, fim: 2.5 },
    },
    'truckvan': {
      almoço: { inicio: 10.5, fim: 15 },
      desjejum: { inicio: 4.5, fim: 7.5 },
    },
    'andriello lapa': {
      desjejum: { inicio: 7.5, fim: 11.5 },
    },
    'andriello limao': {
      desjejum: { inicio: 7.5, fim: 11.5 },
    },
    'fanem': {
      almoço: { inicio: 10.5, fim: 14 },
      desjejum: { inicio: 5.5, fim: 8.5 },
    },
    'dv3': {
      almoço: { inicio: 11, fim: 15.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 2 },
    },
    'fitas estrela': {
      almoço: { inicio: 10.5, fim: 14 },
      ceia: { inicio: 22.5, fim: 2.5 },
    },
    'cromus': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 0.5, fim: 4 },
    },
    'lindal': {
      almoço: { inicio: 9.5, fim: 14},
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 0.5, fim: 4 },
    },
    'sinto brasilsp': {
      almoço: { inicio: 10.5, fim: 14.5},
    },
    'sinto brasil atibaia': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 0, fim: 4 },
    },
    'mbcc': {
      almoço: { inicio: 10.5, fim: 14},
    },
    'nautika': {
      almoço: { inicio: 10.5, fim: 15},
    },
     'paulus cotia': {
      almoço: { inicio: 10.5, fim: 14},
      jantar: { inicio: 17.5, fim: 20 },
      ceia: { inicio: 1.5, fim: 3.5 },
    },
    'siner': {
      almoço: { inicio: 11, fim: 14.5},
    },
    'itm': {
      almoço: { inicio: 9, fim: 14.5},
      jantar: { inicio: 17, fim: 21 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'planmar': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 16.5, fim: 21.5},
      ceia: { inicio: 23.5, fim: 5 },
    },
    'solistica': {
      almoço: { inicio: 10, fim: 14},
      jantar: { inicio: 16.5, fim: 20.5},
      ceia: { inicio: 12, fim: 2.5 },
    },
    'minebea': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 17, fim: 20.5},
      ceia: { inicio: 1.5, fim: 4 },
    },
    'puratos filial': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 17.5, fim: 20},
    },
    'threebond': {
      almoço: { inicio: 11, fim: 14},
    },
     'cip': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 19, fim: 21.5},
      ceia: { inicio: 23, fim: 0},
    },
    'fox campinas': {
      almoço: { inicio: 11, fim: 14},
    },
    'fox cabreuva': {
      almoço: { inicio: 10.5, fim: 14.5},
    },
    'sinerii': {
      almoço: { inicio: 11, fim: 14.5},
    },
    'kawagraf': {
      almoço: { inicio: 11, fim: 14.5},
      jantar: { inicio: 17, fim: 20},
    },
    'castelo': {
      almoço: { inicio: 9.5, fim: 14.5},
      jantar: { inicio: 17, fim: 20.5},
    },
    'lepe': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 15.5, fim: 19.5 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'leroy jaguare': {
      almoço: { inicio: 11.5, fim: 19 },
    },
     'jmb': {
      almoço: { inicio: 10.5, fim: 14.5 },
    },
    'leroy morumbi': {
      almoço: { inicio: 11, fim: 19.5 },
    },
    'nita': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 22.5 },
    },
    'parker perus': {
      almoço: { inicio: 10.5, fim: 14.5 },
    },
    'parker diadema': {
      almoço: { inicio: 10.5, fim: 14.5 },
    },
    'parker jacarei': {
      almoço: { inicio: 10, fim: 14.5 },
    },
    'parker sjc': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 20, fim: 23 },
    },
    'tatuzinho': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 19.5, fim: 22 },
    },
     'bosal itupeva': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 18, fim: 20 },
    },
     'dinatecnica': {
      almoço: { inicio: 10.5, fim: 14.5 },
    },
    'hitech': {
      almoço: { inicio: 11, fim: 15 },
    },
    'polimix concreto': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 17.5, fim: 20 },
    },
    'polimix agregados': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 19.5, fim: 1.5 },
    },
    'pifferprint': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 20 },
    },
    'adezan cacapava': {
      almoço: { inicio: 11, fim: 14.5},
      jantar: { inicio: 19.5, fim: 22 },
    },
    'agroceres': {
      almoço: { inicio: 10.5, fim: 15},
    },
    'albras': {
      almoço: { inicio: 10.5, fim: 14},
      jantar: { inicio: 17.5, fim: 20.5 },
    },
    'alestis': {
      almoço: { inicio: 11, fim: 15},
      jantar: { inicio: 19, fim: 15},
    },
    'amazon transportes': {
      almoço: { inicio: 10.5, fim: 21.5},
    },
    'anhembi': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'benassi': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 17.5, fim: 20 },
      ceia: { inicio: 23.5, fim: 2 },
    },
    'blanver': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 17.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'braslimpo': {
      almoço: { inicio: 10.5, fim: 14},
      jantar: { inicio: 14, fim: 16.5 },
    },
    'bunge': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 18.5, fim: 22 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'camesa dutra': {
      almoço: { inicio: 11, fim: 15 },
      jantar: { inicio: 21.5, fim: 1 },
      ceia: { inicio: 1.5, fim: 5 },
    },
    'campo limpo': {
      almoço: { inicio: 10, fim: 14},
      jantar: { inicio: 21, fim: 1.5 },
    },
    'cbp': {
      almoço: { inicio: 10.5, fim: 15},
    },
    'iber oleff': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 17.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 3.5 },
    },
    'cobreq': {
      almoço: { inicio: 10, fim: 14},
      jantar: { inicio: 17.5, fim: 20.5 },
      ceia: { inicio: 0, fim: 3.5 },
    },
    'spal itabirito': {
      almoço: { inicio: 10, fim: 14.5},
      jantar: { inicio: 17.5, fim: 22 },
      ceia: { inicio: 23.5, fim: 4 },
    },
     'spal mogi das cruzes': {
      almoço: { inicio: 9.5, fim: 14},
      jantar: { inicio: 16.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'spal santos': {
      almoço: { inicio: 10.5, fim: 14.5},
      jantar: { inicio: 18, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'corpak filial': {
      almoço: { inicio: 8.5, fim: 13.5},
      jantar: { inicio: 17, fim: 21 },
      ceia: { inicio: 0, fim: 4 },
    },
    'corpak matriz': {
      almoço: { inicio: 8.5, fim: 14.5},
      jantar: { inicio: 16.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'couro top': {
      almoço: { inicio: 11, fim: 15.5 },
    },
    'culligan': {
      almoço: { inicio: 10.5, fim: 15},
    },
    'delta park': {
      almoço: { inicio: 10.5, fim: 14},
    },
    'farmarin armazem': {
      almoço: { inicio: 11, fim: 15},
      jantar: { inicio: 17.5, fim: 21},
    },
    'farmarin matriz': {
      almoço: { inicio: 9.5, fim: 15.5},
      jantar: { inicio: 16.5, fim: 21 },
      ceia: { inicio: 22.5, fim: 4 },
    },
    'farmarin filial': {
      almoço: { inicio: 10, fim: 15},
      jantar: { inicio: 16.5, fim: 21 },
      ceia: { inicio: 23, fim: 3 },
    },
    'flexform': {
      almoço: { inicio: 10.5, fim: 14.5},
    },
    'forte veiculos': {
      almoço: { inicio: 10.5, fim: 14.5},
    },
    'gcp': {
      almoço: { inicio: 10.5, fim: 14.5},
      jantar: { inicio: 18.5, fim: 22.5 },
    },
    'giovanella': {
      almoço: { inicio: 10.5, fim: 14.5},
      ceia: { inicio: 1.5, fim: 4 },
    },
    'hebraica': {
      almoço: { inicio: 10.5, fim: 13.5},
      jantar: { inicio: 17, fim: 21 },
    },
    'hoganas': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 22 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'huf': {
      almoço: { inicio: 10, fim: 14 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'imbera': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 19.5, fim: 23 },
    },
    'imerys rt': {
      almoço: { inicio: 10.5, fim: 15.5 },
      jantar: { inicio: 13, fim: 15.5 },
      ceia: { inicio: 17.5, fim: 19 },
    },
    'induscabos': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 20.5 },
      ceia: { inicio: 23.5, fim: 3.5 },
    },
    'japauto': {
      almoço: { inicio: 10.5, fim: 14.5},
    },
    'jotaeme': {
      almoço: { inicio: 10.5, fim: 15},
      ceia: { inicio: 23, fim: 2},
    },
    'kurita': {
      almoço: { inicio: 11.5, fim: 15},
    },
    'lanmar': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 19.5, fim: 22 },
    },
    'lci': {
      almoço: { inicio: 10.5, fim: 14 },
    },
    'locomotiva': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21.5 },
      ceia: { inicio: 23.5, fim: 3.5 },
    },
    'luxalum': {
      almoço: { inicio: 10.5, fim: 14 },
      jantar: { inicio: 14.5, fim: 16 },
      ceia: { inicio: 2, fim: 4 },
    },
    'macdermid': {
      almoço: { inicio: 11, fim: 14.5 },
    },
    'marisa': {
      almoço: { inicio: 10.5, fim: 15 },
    },
    'mersen': {
      almoço: { inicio: 11, fim: 15 },
    },
     'mosca': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 21.5, fim: 1 },
    },
     'murcia': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 19.5, fim: 23 },
    },
     'nagel': {
      almoço: { inicio: 10.5, fim: 13.5 },
    },
    'nhl': {
      almoço: { inicio: 10.5, fim: 14 },
    },
    'novares': {
      almoço: { inicio: 10.5, fim: 14 },
      jantar: { inicio: 16.5, fim: 19 },
      ceia: { inicio: 0.5, fim: 4 },
    },
    
    'pacifico log': {
      almoço: { inicio: 11, fim: 15 },
      jantar: { inicio: 20, fim: 23 },
      ceia: { inicio: 23.5, fim: 2 },
    },
    'perfil lider': {
      almoço: { inicio: 11, fim: 15 },
      jantar: { inicio: 17.5, fim: 20.5},
    },
    'refal': {
      almoço: { inicio: 10.5, fim: 14 },
      jantar: { inicio: 17.5, fim: 20},
    },
    'reis office': {
      almoço: { inicio: 11, fim: 14.5 },
    },
    'sage': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 16.5, fim: 20 },
      ceia: { inicio: 23, fim: 3 },
    },
    'smagalhaes guaruja': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
    },
    'smagalhaes santos': {
      almoço: { inicio: 11, fim: 15 },
      jantar: { inicio: 17.5, fim: 21 },
    },
    'saint gobain': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 16.5, fim: 22 },
      ceia: { inicio: 23.5, fim: 5 },
    },
    'schutz vasitex1': {
      almoço: { inicio: 10, fim: 15 },
      jantar: { inicio: 16.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 4.5 },
    },
    'schutz vasitex2': {
      almoço: { inicio: 10, fim: 15 },
      jantar: { inicio: 16.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 4.5 },
    },
    'schutz vasitex3': {
      almoço: { inicio: 10, fim: 15 },
      jantar: { inicio: 16.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 4.5 },
    },
    'silgan jundiai': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21.5 },
      ceia: { inicio: 0.5, fim: 3.5 },
    },
    'silgan mogi': {
      almoço: { inicio: 9.5, fim: 14 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 0.5, fim: 5 },
    },
    'silgan valinhos': {
      almoço: { inicio: 10, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
    },
    'sonoco': {
      almoço: { inicio: 10, fim: 14 },
      jantar: { inicio: 17.5, fim: 21.5 },
    },
    'spg': {
      almoço: { inicio: 10, fim: 14 },
      jantar: { inicio: 16.5, fim: 20 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'sueco': {
      almoço: { inicio: 10.5, fim: 14.5 },
      ceia: { inicio: 23.5, fim: 3 },
      desjejum: { inicio: 5.5, fim: 8 },
    },
    'sulzer': {
      almoço: { inicio: 10, fim: 14 },
    },
     'tecfil 1': {
      almoço: { inicio: 9, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 22 },
      ceia: { inicio: 21.5, fim: 1 },
    },
    'tecfil 3': {
      almoço: { inicio: 12.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 23.5, fim: 3 },
    },
    'techniplas': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 16.5, fim: 21.5 },
      ceia: { inicio: 0.5, fim: 4.5 },
    },
    'tekno': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 18.5, fim: 22 },
      ceia: { inicio: 0.5, fim: 5 },
    },
    'toyobo': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
    },
    'toyobo americana': {
      almoço: { inicio: 10.5, fim: 14.5 },
    },
    'tropical': {
      almoço: { inicio: 11.5, fim: 15.5 },
      jantar: { inicio: 21.5, fim: 1 },
    },
    'twe cacapava': {
      almoço: { inicio: 10.5, fim: 14 },
      jantar: { inicio: 19.5, fim: 22.5 },
    },
    'twe betim': {
      almoço: { inicio: 10.5, fim: 14 },
      jantar: { inicio: 19, fim: 22 },
      ceia: { inicio: 2.5, fim: 5 },
    },
    'twe sbc': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 18, fim: 20.5 },
      ceia: { inicio: 1.5, fim: 4 },
    },
    'univar': {
      almoço: { inicio: 11, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 1, fim: 4.5 },
    },
    'tagma': {
      almoço: { inicio: 11, fim: 14.5 },
      jantar: { inicio: 18.5, fim: 22 },
      ceia: { inicio: 1, fim: 4.5 },
    },
    'valgroup': {
      almoço: { inicio: 9.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 22 },
      ceia: { inicio: 23.5, fim: 4 },
    },
    'vopak': {
      almoço: { inicio: 10.5, fim: 14.5 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 0.5, fim: 4 },
    },
    'wilson sons': {
      almoço: { inicio: 10.5, fim: 15 },
      jantar: { inicio: 17.5, fim: 21 },
      ceia: { inicio: 1.5, fim: 4 },
    },
    'UNIDADE TESTE': {
         almoço: { inicio: 06, fim: 22 },
      
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
