<?php
// Conexão direta ao banco de dados
$host = 'localhost';
$usuario = 'kaua';
$senha = 'Marques1303@';
$banco = 'Cucinare_pesquisa';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$banco", $usuario, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}

require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

// Consulta
$sql = "SELECT * FROM respostas";
$stmt = $pdo->query($sql);

// Criação da planilha
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Relatório');

// Cabeçalhos
$cabecalhos = [
    'Pontuação', 'Satisfação (%)', 'Nome', 'E-mail', 'Área de Atuação',
    'Pergunta 1', 'Motivo 1', 'Pergunta 2', 'Motivo 2',
    'Pergunta 3', 'Motivo 3', 'Pergunta 4', 'Motivo 4',
    'Pergunta 5', 'Motivo 5', 'Pergunta 6', 'Motivo 6',
    'Pergunta 7', 'Motivo 7', 'Indicação', 'Comentário Final'
];

$coluna = 'A';
foreach ($cabecalhos as $titulo) {
    $sheet->setCellValue($coluna . '1', $titulo);
    $coluna++;
}

// Estilo do cabeçalho
$style = $sheet->getStyle('A1:' . chr(ord('A') + count($cabecalhos) - 1) . '1');
$style->getFont()->setBold(true);
$style->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
$style->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFEFEFEF');
$style->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

$row = 2;
while ($dados = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $pontuacao = 0;
    for ($i = 1; $i <= 7; $i++) {
        $pontuacao += intval($dados["pergunta$i"]);
    }
    $satisfacao = round(($pontuacao / (7 * 10)) * 100); // cada pergunta de 0 a 10

    $sheet->setCellValue("A$row", $pontuacao);
    $sheet->setCellValue("B$row", "$satisfacao%");
    $sheet->setCellValue("C$row", $dados['nome']);
    $sheet->setCellValue("D$row", $dados['email']);
    $area = $dados['area'] === 'Outra' ? $dados['outra_area'] : $dados['area'];
    $sheet->setCellValue("E$row", $area);

    $col = 'F';
    for ($i = 1; $i <= 7; $i++) {
        $sheet->setCellValue($col++ . $row, $dados["pergunta$i"]);
        $sheet->setCellValue($col++ . $row, $dados["motivo$i"]);
    }

    $sheet->setCellValue($col++ . $row, $dados['indicacao']);
    $sheet->setCellValue($col++ . $row, $dados['comentarios']);

    $row++;
}

// Ajustar largura automática
foreach (range('A', $col) as $letra) {
    $sheet->getColumnDimension($letra)->setAutoSize(true);
}

// Saída
ob_clean();
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="relatorio_satisfacao.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>
