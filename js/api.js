/**
 * =====================================================
 * PORTAL RH CMIVET
 * api.js
 * Comunicação com Google Apps Script
 * =====================================================
 */

const API = {

    /**
     * =================================================
     * MÉTODO GENÉRICO
     * =================================================
     */

    async request(action, data = {}) {

        try {

            const response = await fetch(
                CONFIG.API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({

                        action,

                        ...data

                    })

                }
            );


            if (!response.ok) {

                throw new Error(
                    "Erro HTTP " +
                    response.status
                );

            }


            return await response.json();

        }

        catch (erro) {

            console.error(
                "Erro API:",
                erro
            );


            return {

                sucesso: false,

                erro: erro.message

            };

        }

    },


    /*************************************************
     * AUTH
     *************************************************/

    login(email, senha) {

        return this.request(

            "login",

            {
                email,
                senha
            }

        );

    },


    validarSessao(token) {

        return this.request(

            "validarSessao",

            {
                token
            }

        );

    },


    logout(token) {

        return this.request(

            "logout",

            {
                token
            }

        );

    },


    /*************************************************
     * USUÁRIOS
     *************************************************/

    listarUsuarios(token) {

        return this.request(

            "listarUsuarios",

            {
                token
            }

        );

    },


    criarUsuario(dados) {

        return this.request(

            "criarUsuario",

            dados

        );

    },


    alterarStatusUsuario(dados) {

        return this.request(

            "alterarStatusUsuario",

            dados

        );

    },


    /*************************************************
     * COMUNICADOS
     *************************************************/


    /*
     * BUSCAR COMUNICADOS PARA O COLABORADOR
     *
     * Esta função estava faltando no api.js.
     *
     * Ela chama:
     *
     * getComunicados()
     *
     * do arquivo Comunicados.gs
     */

    getComunicados() {

        return this.request(

            "getComunicados",

            {}

        );

    },


    /*
     * NOVO COMUNICADO
     */

    novoComunicado(dados) {

        return this.request(

            "novoComunicado",

            dados

        );

    },


    /*
     * LISTAR COMUNICADOS PARA ADMIN
     */

    listarComunicadosAdmin(token) {

        return this.request(

            "listarComunicadosAdmin",

            {
                token
            }

        );

    },


    /*
     * COMUNICADOS PENDENTES
     */

    comunicadosPendentes(token) {

        return this.request(

            "comunicadosPendentes",

            {
                token
            }

        );

    },


    /*
     * CONFIRMAR LEITURA
     */

    confirmarLeitura(dados) {

        return this.request(

            "confirmarLeitura",

            dados

        );

    },


    /*
     * ALTERAR STATUS
     */

    alterarStatusComunicado(dados) {

        return this.request(

            "alterarStatusComunicado",

            dados

        );

    },


    /*
     * EXCLUIR COMUNICADO
     */

    excluirComunicado(dados) {

        return this.request(

            "excluirComunicado",

            dados

        );

    },


    /*************************************************
     * TERMÔMETRO
     *************************************************/

    salvarTermometro(dados) {

        return this.request(

            "termometro",

            dados

        );

    },


    verificarTermometroHoje(token) {

        return this.request(

            "verificarTermometroHoje",

            {
                token
            }

        );

    },


    resumoTermometro90(token) {

        return this.request(

            "resumoTermometro90",

            {
                token
            }

        );

    },


    /*************************************************
     * CAFÉ RH
     *************************************************/

    salvarCafeRH(dados) {

        return this.request(

            "cafeRH",

            dados

        );

    },


    listarCafeRH(token) {

        return this.request(

            "listarCafeRH",

            {
                token
            }

        );

    },


    alterarStatusCafeRH(dados) {

        return this.request(

            "alterarStatusCafeRH",

            dados

        );

    }

};
