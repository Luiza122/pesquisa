<?php
include 'conexao.php';

function limpar($valor) {
    return htmlspecialchars(trim($valor));
}

$nome = limpar($_POST['nome']);
$email = limpar($_POST['email']);
$area = limpar($_POST['area']);
$outra_area = isset($_POST['outraArea']) ? limpar($_POST['outraArea']) : null;
$indicacao = limpar($_POST['indicacao']);
$comentarios = limpar($_POST['comentarios']);

$perguntas = [];
$motivos = [];

for ($i = 1; $i <= 7; $i++) {
    $perguntas[$i] = isset($_POST["pergunta$i"]) ? intval($_POST["pergunta$i"]) : null;
    $motivos[$i] = isset($_POST["motivo$i"]) ? limpar($_POST["motivo$i"]) : null;
}

// Verifica se o e-mail já foi usado
$sql_verifica = "SELECT id FROM respostas WHERE email = ?";
$stmt_verifica = $conn->prepare($sql_verifica);
$stmt_verifica->bind_param("s", $email);
$stmt_verifica->execute();
$stmt_verifica->store_result();

if ($stmt_verifica->num_rows > 0) {
    // Já existe uma resposta com esse e-mail
    echo "<!DOCTYPE html>
    <html lang='pt-BR'>
    <head>
        <meta charset='UTF-8'>
        <title>Erro</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f8d7da;
                color: #721c24;
                padding: 40px;
                text-align: center;
            }
            .box {
                background-color: #f5c6cb;
                border: 1px solid #f1b0b7;
                display: inline-block;
                padding: 30px;
                border-radius: 10px;
            }
            a {
                display: block;
                margin-top: 20px;
                color: #721c24;
                font-weight: bold;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class='box'>
            <h2>Este e-mail já foi usado para enviar uma resposta.</h2>
            <p>Se precisar corrigir alguma informação, entre em contato com o suporte.</p>
            <a href='form_pesquisa.html'>← Voltar para o formulário</a>
        </div>
    </body>
    </html>";
    exit;
}

$stmt_verifica->close();

// Inserção no banco
$sql = "INSERT INTO respostas (
    nome, email, area, outra_area,
    pergunta1, motivo1, pergunta2, motivo2, pergunta3, motivo3,
    pergunta4, motivo4, pergunta5, motivo5, pergunta6, motivo6,
    pergunta7, motivo7, indicacao, comentarios
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssisisisisisisisss",
    $nome, $email, $area, $outra_area,
    $perguntas[1], $motivos[1], $perguntas[2], $motivos[2],
    $perguntas[3], $motivos[3], $perguntas[4], $motivos[4],
    $perguntas[5], $motivos[5], $perguntas[6], $motivos[6],
    $perguntas[7], $motivos[7], $indicacao, $comentarios
);

if ($stmt->execute()) {
    header("Location: agradecimento.html");
    exit;
} else {
    echo "Erro ao salvar: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
