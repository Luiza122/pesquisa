<?php
$host = 'localhost';
$usuario = 'kaua';
$senha = 'Marques1303@';
$banco = 'Cucinare_pesquisa';

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
