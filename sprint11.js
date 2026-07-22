/*************************************************
 * SPRINT11.JS v2.0
 * Portal RH CMIVET
 *************************************************/

const API_URL =
"https://script.google.com/macros/s/AKfycbz7dmmQpgyCucCbCFlsXmzp3gf_A_eBUdlkrgx5Ysik5729_U9vsswW3gSfQtGDaFuj/exec";

const TOKEN =
sessionStorage.getItem("cmivet_token");

const DAILY_KEY =
"cmivet-termometro-dia";

const overlay =
document.querySelector("#mandatoryOverlay");

const form =
document.querySelector("#responseForm");
function todayKey(){

    return new Intl.DateTimeFormat(

        "sv-SE",

        {

            timeZone:"America/Sao_Paulo"

        }

    ).format(new Date());

}

function alreadyAnswered(){

    return localStorage.getItem(

        DAILY_KEY

    )===todayKey();

}

function showMandatory(){

    overlay.hidden=false;

    document.body.style.overflow="hidden";

}

function releasePortal(){

    localStorage.setItem(

        DAILY_KEY,

        todayKey()

    );

    overlay.hidden=true;

    document.body.style.overflow="";

}

function escapeHtml(value=""){

    return String(value)

    .replace(/[&<>"']/g,function(char){

        return{

            "&":"&amp;",

            "<":"&lt;",

            ">":"&gt;",

            '"':"&quot;",

            "'":"&#039;"

        }[char];

    });

}
async function post(data){

    const response=

    await fetch(

        API_URL,

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify(data)

        }

    );

    return await response.json();

}
/*************************************************
 * ENVIO DO TERMÔMETRO
 *************************************************/

if (form) {

    form.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();

            const formData = new FormData(form);

            const button = form.querySelector(

                'button[type="submit"]'

            );

            const comment =

                formData.get("comment") || "";

            const mood =

                Number(formData.get("mood"));

            if (!mood) {

                alert(

                    "Selecione como você está se sentindo."

                );

                return;

            }

            button.disabled = true;

            const originalText =

                button.textContent;

            button.textContent =

                "Enviando...";

            try {

                const response = await post({

                    action: "termometro",

                    token: TOKEN,

                    nota: mood,

                    observacao: comment.trim()

                });

                if (!response.sucesso) {

                    throw new Error(

                        response.erro ||

                        "Não foi possível registrar a resposta."

                    );

                }

                releasePortal();

                form.reset();

                alert(

                    "Resposta registrada com sucesso!"

                );

                await verifyDailyThermometer();

            }

            catch (error) {

                console.error(error);

                alert(

                    error.message ||

                    "Erro ao enviar resposta."

                );

            }

            finally {

                button.disabled = false;

                button.textContent = originalText;

            }

        }

    );

}
/*************************************************
 * VERIFICAÇÃO DO TERMÔMETRO
 *************************************************/

async function verifyDailyThermometer() {

    if (!TOKEN) {

        showMandatory();

        return;

    }

    try {

        const response = await post({

            action: "verificarTermometroHoje",

            token: TOKEN

        });

        if (

            response.sucesso &&

            response.respondeu

        ) {

            releasePortal();

            return;

        }

        showMandatory();

    }

    catch (error) {

        console.error(error);

        showMandatory();

    }

}

/*************************************************
 * INICIALIZAÇÃO GERAL
 *************************************************/

async function initializePortal() {

    try {

        await verifyDailyThermometer();

        await loadAnnouncements();

        if (typeof loadCoffeeRH === "function") {

            await loadCoffeeRH();

        }

        if (typeof loadDashboard === "function") {

            await loadDashboard();

        }

    }

    catch (error) {

        console.error(

            "Erro na inicialização:",

            error

        );

    }

}

document.addEventListener(

    "DOMContentLoaded",

    initializePortal

);
/*************************************************
 * COMUNICADOS
 *************************************************/

async function loadAnnouncements() {

    const container =

        document.querySelector(

            "#announcementList"

        );

    const home =

        document.querySelector(

            "#homeAnnouncements"

        );

    if (!container && !home) {

        return;

    }

    try {

        const response = await fetch(

            `${API_URL}?action=comunicados&t=${Date.now()}`,

            {

                cache: "no-store"

            }

        );

        const data =

            await response.json();

        const lista =

            (

                Array.isArray(data)

                ? data

                : data.comunicados || []

            )

            .filter(function(item){

                return String(

                    item.ativo || "sim"

                ).toLowerCase() !== "não";

            });

        const html =

            lista.length

            ? lista.map(function(item){

                return `

                <article class="card">

                    <span class="badge">

                        ${escapeHtml(

                            item.categoria ||

                            "Comunicado"

                        )}

                    </span>

                    <h4>

                        ${escapeHtml(

                            item.titulo ||

                            "Sem título"

                        )}

                    </h4>

                    <p>

                        ${escapeHtml(

                            item.descricao ||

                            ""

                        )}

                    </p>

                </article>

                `;

            }).join("")

            :

            `<div class="empty">

                Nenhum comunicado disponível.

            </div>`;

        if (container) {

            container.innerHTML =

                html;

        }

        if (home) {

            home.innerHTML =

                lista

                .slice(0,3)

                .map(function(item){

                    return `

                    <article class="card">

                        <span class="badge">

                            ${escapeHtml(

                                item.categoria ||

                                "Comunicado"

                            )}

                        </span>

                        <h4>

                            ${escapeHtml(

                                item.titulo ||

                                "Sem título"

                            )}

                        </h4>

                        <p>

                            ${escapeHtml(

                                item.descricao ||

                                ""

                            )}

                        </p>

                    </article>

                    `;

                })

                .join("");

        }

    }

    catch(error){

        console.error(error);

        if(container){

            container.innerHTML =

            `<div class="empty">

                Não foi possível carregar os comunicados.

            </div>`;

        }

    }

}
/*************************************************
 * CAFÉ RH
 *************************************************/

async function loadCoffeeRH() {

    const form =

        document.querySelector(

            "#coffeeForm"

        );

    if (!form) {

        return;

    }

    if (form.dataset.loaded) {

        return;

    }

    form.dataset.loaded = "true";

    form.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();

            const button =

                form.querySelector(

                    'button[type="submit"]'

                );

            const originalText =

                button.textContent;

            button.disabled = true;

            button.textContent =

                "Enviando...";

            try {

                const response =

                    await post({

                        action: "cafeRH",

                        token: TOKEN,

                        nome:

                            form.coffeeName.value.trim(),

                        setor:

                            form.coffeeSector.value.trim(),

                        contato:

                            form.coffeeContact.value.trim(),

                        motivo:

                            form.coffeeReason.value.trim(),

                        prioridade:

                            form.coffeeUrgency.value

                    });

                if (!response.sucesso) {

                    throw new Error(

                        response.erro ||

                        "Não foi possível enviar a solicitação."

                    );

                }

                alert(

                    "Solicitação enviada com sucesso."

                );

                form.reset();

            }

            catch (error) {

                console.error(error);

                alert(

                    error.message ||

                    "Erro ao enviar solicitação."

                );

            }

            finally {

                button.disabled = false;

                button.textContent =

                    originalText;

            }

        }

    );

}
