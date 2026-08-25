/*************************************************
 * COMUNICADOS
 *************************************************/

getComunicados() {

    return this.request(
        "getComunicados",
        {}
    );

},

novoComunicado(dados) {

    return this.request(
        "novoComunicado",
        dados
    );

},

listarComunicadosAdmin(token) {

    return this.request(
        "listarComunicadosAdmin",
        { token }
    );

},

comunicadosPendentes(token) {

    return this.request(
        "comunicadosPendentes",
        { token }
    );

},

confirmarLeitura(dados) {

    return this.request(
        "confirmarLeitura",
        dados
    );

},

alterarStatusComunicado(dados) {

    return this.request(
        "alterarStatusComunicado",
        dados
    );

},

excluirComunicado(dados) {

    return this.request(
        "excluirComunicado",
        dados
    );

},
