document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        // Salvar o token JWT e redirecionar para o painel de admin
        localStorage.setItem('token', result.token);
        window.location.href = '/admin-panel.html';
    } else {
        alert('Login falhou! Verifique suas credenciais.');
    }
});