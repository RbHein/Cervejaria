document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginScreen = document.getElementById("login-screen");
    const dashboard = document.querySelector(".dashboard");
    const userNameSpan = document.querySelector(".user-name");

    // Usuários pré cadastrados
    const usuarios = {
        admin: { senha: "12345678", nome: "Admin" },
    };

    function mostrarDashboard(nomeUsuario) {
        if (loginScreen) loginScreen.style.display = "none";
        if (dashboard) dashboard.style.display = "flex";
        if (userNameSpan) userNameSpan.textContent = nomeUsuario;

        const logoutBtn = document.querySelector(".logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("logado");
                localStorage.removeItem("nomeUsuario");
                window.location.href = "index.html"; // Redireciona para login
            });
        }
    }

    // ✅ Verifica se está logado ao abrir qualquer página
    if (localStorage.getItem("logado") === "true") {
        const nomeUsuario = localStorage.getItem("nomeUsuario") || "Usuário";
        mostrarDashboard(nomeUsuario);
    } else {
        // Se não estiver logado, e estiver em uma página protegida (sem login-form), redireciona
        if (!loginForm && !window.location.pathname.includes("index.html")) {
            window.location.href = "index.html";
        }
    }

    // ✅ Parte só para a tela de login
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (usuarios[username] && usuarios[username].senha === password) {
                localStorage.setItem("logado", "true");
                localStorage.setItem("nomeUsuario", usuarios[username].nome);
                mostrarDashboard(usuarios[username].nome);
            } else {
                document.getElementById("error-message").textContent = "Usuário ou senha inválidos.";
            }
        });
    }
});
