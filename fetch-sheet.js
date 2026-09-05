const SUPABASE_URL = "https://uwquezlcuggorsytokig.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cXVlemxjdWdnb3JzeXRva2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjE3NDYsImV4cCI6MjEwNDE5Nzc0Nn0.axUTpqAXtvHVx83LQV-ErV6enfbG_roB6tj_eeVupLA";

export function mapSupabaseRowToCar(row) {
  return {
    id: row.id,
    marca: row.marca,
    modelo: `${row.marca} ${row.modelo}`.trim(),
    tipo: row.tipo,
    ano: row.ano,
    km: row.km,
    preco: row.preco_venda,
    blindado: row.blindado,
    cambio: row.cambio || "Não informado",
    combustivel: row.combustivel || "Não informado",
    cor: row.cor || "Não informado",
    portas: row.portas || 0,
    descricao: row.descricao || "",
    opcionais: row.opcionais || [],
    fotos: row.fotos || [],
  };
}

export async function fetchSheetCars() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/veiculos?status=in.(disponivel,reservado)&select=*`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Falha ao buscar veículos do Supabase");
    const rows = await res.json();
    return rows.map(mapSupabaseRowToCar);
  } catch (err) {
    console.warn("Não foi possível carregar o catálogo do Supabase, usando dados locais.", err);
    return null;
  }
}
