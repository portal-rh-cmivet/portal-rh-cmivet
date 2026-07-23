/*************************************************
 * CAFÉ RH
 * cafe-rh.js
 *************************************************/

const API_URL =
"https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const TOKEN =
sessionStorage.getItem("cmivet_token");

/*************************************************
 * POST
 *************************************************/

async function post(data){

    const response = await fetch(

        API_URL,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(data)

        }

    );

    return await response.json();

}

/*************************************************
 * ENVIAR SOLICITAÇÃO
 *************************************************/

const form =

document.getElementById("coffeeForm");

if(form){

    form.addEventListener(

        "submit",

        async function(event){

            event.preventDefault();

            const assunto =

            document

            .getElementById("assunto")

            .value

            .trim();

            const mensagem =

            document

            .getElementById("mensagem")

            .value

            .trim();

            if(!assunto){

                alert(

                "Informe o assunto."

                );

                return;

            }

            if(!mensagem){

                alert(

                "Descreva sua solicitação."

                );

                return;

            }

            const botao =

            document

            .getElementById("btnEnviar");

            const textoOriginal =

            botao.textContent;

            botao.disabled = true;

            botao.textContent =

            "Enviando...";

            try{

                const resposta =

                await post({

                    action:"cafeRH",

                    token:TOKEN,

                    assunto:assunto,

                    mensagem:mensagem

                });

                if(!resposta.sucesso){

                    throw new Error(

                        resposta.erro ||

                        "Erro ao enviar."

                    );

                }

                alert(

                    "Solicitação enviada com sucesso!"

                );

                form.reset();

            }

            catch(error){

                console.error(error);

                alert(

                    error.message ||

                    "Não foi possível enviar."

                );

            }

            finally{

                botao.disabled = false;

                botao.textContent =

                textoOriginal;

            }

        }

    );

}

/*************************************************
 * VOLTAR AO PORTAL
 *************************************************/

const voltar =

document.getElementById("btnVoltar");

if(voltar){

    voltar.addEventListener(

        "click",

        function(){

            window.location.href =

            "portal.html";

        }

    );

}
