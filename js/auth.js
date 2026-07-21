/**
 * =====================================================
 * PORTAL RH CMIVET
 * auth.js
 * =====================================================
 */

const Auth = {

    async login(email, senha) {

        try {

            const resposta = await API.login(email, senha);

            if (!resposta || !resposta.sucesso) {
                throw new Error(resposta?.erro || "Usuário ou senha inválidos.");
            }

            localStorage.setItem(
                CONFIG.STORAGE.TOKEN,
                resposta.token
            );

            localStorage.setItem(
                CONFIG.STORAGE.USER,
                JSON.stringify(resposta.usuario || resposta)
            );

            return resposta;

        } catch (erro) {

            console.error("Erro no login:", erro);

            throw erro;

        }

    },

    logout() {

        localStorage.removeItem(CONFIG.STORAGE.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE.USER);

        window.location.href = "login.html";

    },

    getToken() {

        return localStorage.getItem(CONFIG.STORAGE.TOKEN);

    },

    getUser() {

        const dados = localStorage.getItem(CONFIG.STORAGE.USER);

        if (!dados) return null;

        try {

            return JSON.parse(dados);

        } catch {

            return null;

        }

    },

    isAuthenticated() {

        return !!this.getToken();

    },

    async validarSessao() {

        const token = this.getToken();

        if (!token) {

            this.logout();
            return false;

        }

        try {

            const resposta = await API.validarSessao(token);

            if (!resposta.sucesso) {

                this.logout();
                return false;

            }

            return true;

        } catch (erro) {

            console.error(erro);

            this.logout();

            return false;

        }

    },

    protegerPagina() {

        if (!this.isAuthenticated()) {

            window.location.href = "login.html";

        }

    }

};
