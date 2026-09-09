const API = `${SUPABASE_URL}/rest/v1`;

const CABECALHOS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

function montarModelo(linha) {
  return [linha.marca, linha.modelo, linha.versao].filter(Boolean).join(" ");
}

function texto(valor) {
  const limpo = (valor || "").trim();
  return limpo || "Não informado";
}

function paraCarro(linha) {
  return {
    id: linha.slug,
    veiculoId: linha.id,
    marca: linha.marca,
    modelo: montarModelo(linha),
    tipo: linha.tipo || "hatch",
    ano: linha.ano_modelo || linha.ano_fabricacao || null,
    km: Number(linha.km) || 0,
    preco: linha.preco === null || linha.preco === undefined ? null : Number(linha.preco),
    blindado: Boolean(linha.blindado),
    cambio: texto(linha.cambio),
    combustivel: texto(linha.combustivel),
    cor: texto(linha.cor),
    portas: Number(linha.portas) || 0,
    descricao: linha.descricao || "",
    opcionais: Array.isArray(linha.opcionais) ? linha.opcionais : [],
    fotos: Array.isArray(linha.fotos) ? linha.fotos : [],
  };
}

async function fetchCarrosPublicados() {
  try {
    const resposta = await fetch(
      `${API}/veiculos_publicos?select=*&order=publicado_em.desc,criado_em.desc`,
      { headers: CABECALHOS, cache: "no-store" },
    );
    if (!resposta.ok) throw new Error(`Resposta ${resposta.status}`);
    const linhas = await resposta.json();
    if (!Array.isArray(linhas)) return null;
    return linhas.map(paraCarro);
  } catch (erro) {
    console.warn("Não foi possível carregar o catálogo do banco, usando dados locais.", erro);
    return null;
  }
}

// Registra o contato e nunca atrapalha a conversa: se falhar, o WhatsApp abre
// do mesmo jeito. A conversa com o cliente vale mais que o registro.
async function registrarLead(dados) {
  try {
    const resposta = await fetch(`${API}/leads`, {
      method: "POST",
      headers: { ...CABECALHOS, Prefer: "return=minimal" },
      body: JSON.stringify({
        nome: dados.nome || "Contato pelo site",
        telefone: dados.telefone || null,
        whatsapp: dados.telefone || null,
        email: dados.email || null,
        veiculo_id: dados.veiculoId || null,
        mensagem: dados.mensagem || null,
        origem: dados.origem || "site_interesse",
      }),
    });
    return resposta.ok;
  } catch (erro) {
    console.warn("Não foi possível registrar o contato.", erro);
    return false;
  }
}

const VISUALIZACOES_REGISTRADAS = new Set();

async function registrarVisualizacao(veiculoId) {
  if (!veiculoId || VISUALIZACOES_REGISTRADAS.has(veiculoId)) return;
  VISUALIZACOES_REGISTRADAS.add(veiculoId);
  try {
    await fetch(`${API}/veiculo_visualizacoes`, {
      method: "POST",
      headers: { ...CABECALHOS, Prefer: "return=minimal" },
      body: JSON.stringify({ veiculo_id: veiculoId, origem: "site" }),
    });
  } catch (erro) {
    console.warn("Não foi possível registrar a visualização.", erro);
  }
}
