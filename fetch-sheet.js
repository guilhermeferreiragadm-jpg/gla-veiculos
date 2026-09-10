const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSblWhDcMyTobXz3t5WgdVYcBzLm1FVVupw4MEYHos0bIEVJmFD5cGyFLbhSSRy84uPtjjUaA8cqkxn/pub?gid=1430753232&single=true&output=csv";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function toDirectImageLink(url) {
  if (!url) return null;
  if (url.includes("drive.google.com")) {
    const match = url.match(/[-\w]{25,}/);
    return match ? `https://lh3.googleusercontent.com/d/${match[0]}=w1200` : null;
  }
  return url;
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findColumn(header, startsWith) {
  return header.findIndex((h) => h.trim().toLowerCase().startsWith(startsWith));
}

async function fetchSheetCars() {
  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Falha ao buscar a planilha");
    const text = await res.text();
    const rows = parseCSV(text);
    if (!rows.length) return null;
    const header = rows[0];

    const col = {
      situacao: findColumn(header, "situa"),
      marca: findColumn(header, "marca"),
      modelo: findColumn(header, "modelo"),
      tipo: findColumn(header, "tipo"),
      ano: findColumn(header, "ano"),
      km: findColumn(header, "quilometragem"),
      preco: findColumn(header, "preço") >= 0 ? findColumn(header, "preço") : findColumn(header, "preco"),
      cambio: findColumn(header, "câmbio") >= 0 ? findColumn(header, "câmbio") : findColumn(header, "cambio"),
      combustivel: findColumn(header, "combust"),
      cor: findColumn(header, "cor"),
      portas: findColumn(header, "portas"),
      blindado: findColumn(header, "blindado"),
      descricao: findColumn(header, "descri"),
      opcionais: findColumn(header, "opcionais"),
      fotos: findColumn(header, "fotos"),
    };

    const tipoMap = { hatch: "hatch", "sedã": "sedan", sedan: "sedan", suv: "suv", picape: "picape", moto: "moto" };
    const latestByKey = new Map();

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const marca = (row[col.marca] || "").trim();
      const modelo = (row[col.modelo] || "").trim();
      const ano = (row[col.ano] || "").trim();
      if (!marca || !modelo) continue;
      const key = `${marca}|${modelo}|${ano}`.toLowerCase();
      latestByKey.set(key, row);
    }

    const cars = [];
    latestByKey.forEach((row) => {
      const situacao = (row[col.situacao] || "").trim().toLowerCase();
      if (situacao.startsWith("vendido")) return;

      const marca = (row[col.marca] || "").trim();
      const modeloRaw = (row[col.modelo] || "").trim();
      const anoRaw = (row[col.ano] || "").trim();
      const anoMatch = anoRaw.match(/\d{4}/);
      const anoNum = anoMatch ? parseInt(anoMatch[0], 10) : null;
      const kmNum = parseInt((row[col.km] || "").replace(/\D/g, ""), 10);
      const precoDigits = (row[col.preco] || "").replace(/[^\d,.]/g, "").replace(",", ".");
      const preco = precoDigits ? Math.round(parseFloat(precoDigits)) : null;
      const tipoRaw = (row[col.tipo] || "").trim().toLowerCase();
      const tipo = tipoMap[tipoRaw] || tipoRaw || "hatch";
      const blindado = (row[col.blindado] || "").trim().toLowerCase().startsWith("sim");
      const opcionais = (row[col.opcionais] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const fotosRaw = (row[col.fotos] || "").trim();
      const fotos = fotosRaw
        ? fotosRaw
            .split(",")
            .map((u) => toDirectImageLink(u.trim()))
            .filter(Boolean)
        : [];

      cars.push({
        id: slugify(`${marca}-${modeloRaw}-${anoRaw}`),
        marca,
        modelo: `${marca} ${modeloRaw}`.trim(),
        tipo,
        ano: anoNum,
        km: isNaN(kmNum) ? 0 : kmNum,
        preco,
        blindado,
        cambio: (row[col.cambio] || "").trim() || "Não informado",
        combustivel: (row[col.combustivel] || "").trim() || "Não informado",
        cor: (row[col.cor] || "").trim() || "Não informado",
        portas: parseInt(row[col.portas], 10) || 0,
        descricao: (row[col.descricao] || "").trim(),
        opcionais,
        fotos,
      });
    });

    return cars;
  } catch (err) {
    console.warn("Não foi possível carregar o catálogo da planilha, usando dados locais.", err);
    return null;
  }
}
