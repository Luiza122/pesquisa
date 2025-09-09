<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Exportar Respostas</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            padding: 40px;
            text-align: center;
            color: #333;
        }

        .export-container {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        }

        .logo {
            width: 120px;
            margin-bottom: 20px;
        }

        h2 {
            color: #222;
            margin-bottom: 30px;
        }

        button {
            background-color: #f5d96d;
            color: #222;
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        button:hover {
            background-color: #e8c952;
        }

        .footer {
            margin-top: 40px;
            font-size: 13px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="export-container">
        <img src="logo.jpeg" alt="Logo da Empresa" class="logo">
        <h2>Exportar Respostas da Pesquisa para Excel</h2>
        <form action="gerar_excel.php" method="post">
            <button type="submit">Exportar para Excel</button>
        </form>
    </div>
    <div class="footer">
        &copy; <?php echo date("Y"); ?> - Sistema de Pesquisa de Satisfação
    </div>
</body>
</html>
