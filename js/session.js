/**
 * =====================================================
 * PORTAL RH CMIVET
 * session.js
 * Gerenciamento de Sessão
 * Versão 1.0
 * =====================================================
 */

const Session = {

    /**
     * Salva usuário e token
     */
    save(usuario, token) {

        localStorage.setItem(
            CONFIG.STORAGE.TOKEN,
            token
        );

        localStorage.setItem(
            CONFIG.STORAGE.USER,
            JSON.stringify(usuario)
        );

    },

    /**
     * Obtém token
     */
    getToken() {

        return localStorage.getItem(
            CONFIG.STORAGE.TOKEN
        );

    },

    /**
     * Obtém usuário logado
     */
    getUser() {

        const dados = localStorage.getItem(
            CONFIG.STORAGE.USER
        );

        if (!dados) {

            return null;

        }

        try {

            return JSON.parse(dados);

        }

        catch (e) {

            console.error(e);

            return null;

        }

    },

    /**
     * Nome do usuário
     */
    getNome() {

        const u = this.getUser();

        return u ? u.nome : "";

    },

    /**
     * Perfil
     */
    getPerfil() {

        const u = this.getUser();

        return u ? u.perfil : "";

    },

    /**
     * ID
     */
    getId() {

        const u = this.getUser();

        return u ? u.id : "";

    },

    /**
     * Verifica login local
     */
    isLogged() {

        return this.getToken() !== null;

    },

    /**
     * Limpa sessão
     */
    clear() {

        localStorage.removeItem(
            CONFIG.STORAGE.TOKEN
        );

        localStorage.removeItem(
            CONFIG.STORAGE.USER
        );

    },

    /**
     * Verifica sessão no Apps Script
     */
    async check() {

        const token = this.getToken();

        if (!token) {

            return false;

        }

        try {

            const resposta = await API.validarSessao(token);

            if (!resposta.sucesso) {

                this.clear();

                return false;

            }

            return true;

        }

        catch (erro) {

            console.error(erro);

            this.clear();

            return false;

        }

    },

    /**
     * Logout
     */
    async logout() {

        try {

            const token = this.getToken();

            if (token) {

                await API.logout(token);

            }

        }

        catch (erro) {

            console.error(erro);

        }

        this.clear();

        window.location.href = "login.html";

    }

};
