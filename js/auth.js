/**
 * =====================================================
 * PORTAL RH CMIVET
 * auth.js
 * Camada de autenticação do Frontend
 * Compatível com Auth.gs
 * =====================================================
 */

const Auth = {

    /**
     * Efetua login
     */
    async login(email, senha) {

        if (!email || !senha) {
            throw new Error("Informe e-mail e senha.");
        }

        try {

            const resposta = await API.login(
                email.trim().toLowerCase(),
                senha
            );

            if (!resposta.sucesso) {
                throw new Error(
                    resposta.erro || "Falha na autenticação."
                );
            }

            Session.save(
                resposta.usuario,
                resposta.token
            );

            return resposta;

        } catch (erro) {

            console.error("Erro no login:", erro);

            throw erro;

        }

    },

    /**
     * Logout
     */
    logout() {

        Session.logout();

    },

    /**
     * Token atual
     */
    getToken() {

        return Session.getToken();

    },

    /**
     * Usuário atual
     */
    getUser() {

        return Session.getUser();

    },

    /**
     * Verifica se existe login
     */
    isAuthenticated() {

        return Session.isLogged();

    },

    /**
     * Valida sessão no Apps Script
     */
    async validarSessao() {

        const token = this.getToken();

        if (!token) {

            return false;

        }

        try {

            const resposta = await API.validarSessao(token);

            if (!resposta.sucesso) {

                Session.clear();

                return false;

            }

            return true;

        }

        catch (erro) {

            console.error(erro);

            Session.clear();

            return false;

        }

    },

    /**
     * Protege páginas internas
     */
    async protegerPagina() {

        const ok = await this.validarSessao();

        if (!ok) {

            window.location.href = "login.html";

        }

    }

};
