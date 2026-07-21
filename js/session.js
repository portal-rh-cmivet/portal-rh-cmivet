/**
 * =====================================================
 * PORTAL RH CMIVET
 * session.js
 * =====================================================
 */

const Session = {

    save(usuario, token) {

        localStorage.setItem(
            CONFIG.STORAGE.USER,
            JSON.stringify(usuario)
        );

        localStorage.setItem(
            CONFIG.STORAGE.TOKEN,
            token
        );

    },

    getUser() {

        const dados = localStorage.getItem(
            CONFIG.STORAGE.USER
        );

        if (!dados) return null;

        try {

            return JSON.parse(dados);

        } catch {

            return null;

        }

    },

    getToken() {

        return localStorage.getItem(
            CONFIG.STORAGE.TOKEN
        );

    },

    isLogged() {

        return this.getToken() !== null;

    },

    clear() {

        localStorage.removeItem(
            CONFIG.STORAGE.USER
        );

        localStorage.removeItem(
            CONFIG.STORAGE.TOKEN
        );

    },

    async check() {

        if (!this.isLogged()) {

            window.location.href = "login.html";

            return false;

        }

        try {

            const resposta = await API.validarSessao(
                this.getToken()
            );

            if (!resposta.sucesso) {

                this.clear();

                window.location.href = "login.html";

                return false;

            }

            return true;

        }

        catch (erro) {

            console.error(erro);

            this.clear();

            window.location.href = "login.html";

            return false;

        }

    },

    logout() {

        this.clear();

        window.location.href = "login.html";

    }

};
