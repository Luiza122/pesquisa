function openForm(meal) {
    window.location.href = `form.html?meal=${meal}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const meal = urlParams.get('meal');

    if (meal) {
        document.getElementById('meal-name').textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
    } else {
        console.error('Parâmetro "meal" não encontrado na URL.');
    }
});
