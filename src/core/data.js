/* ==========================================================================
   src/core/data.js — Fetches jobs.json and exposes helper functions.
   Supports both HTTP fetch (dynamic data) and fallback for local file:// protocol.
   ========================================================================== */

const RECRUITMENT_EMAIL = 'recrutamento@havelar.com';

let _cache = null;

// Backup hardcoded data for file:// protocol (CORS restriction)
const STATIC_JOBS_DATA = {
  "areas": [
    {
      "id": "impressao-3d",
      "name": "Impressão 3D",
      "short": "Operação e produção",
      "description": "Opera e monitoriza as nossas impressoras 3D em obra e fábrica.",
      "icon": "🖨️"
    },
    {
      "id": "engenharia-civil",
      "name": "Engenharia Civil",
      "short": "Projeto e obra",
      "description": "Investiga e desenvolve soluções estruturais para habitações impressas em 3D.",
      "icon": "🏗️"
    },
    {
      "id": "arquitetura",
      "name": "Arquitetura",
      "short": "Design habitacional",
      "description": "Desenha soluções habitacionais únicas pensadas para impressão 3D, em colaboração com equipas internacionais.",
      "icon": "📐"
    },
    {
      "id": "engenharia-materiais",
      "name": "Engenharia de Materiais",
      "short": "R&D betão",
      "description": "Desenvolve novas fórmulas de betão para impressão aditiva neutra em carbono.",
      "icon": "🧪"
    },
    {
      "id": "engenharia-mecanica",
      "name": "Engenharia Mecânica",
      "short": "Máquinas e sistemas",
      "description": "Desenvolve e mantém as nossas impressoras 3D industriais de grande escala, garantindo o seu funcionamento e evolução contínua.",
      "icon": "⚙️"
    },
    {
      "id": "engenharia-informatica",
      "name": "Engenharia Informática",
      "short": "Software e controlo",
      "description": "Cria o software que controla as máquinas e automatiza a produção.",
      "icon": "💻"
    },
    {
      "id": "comercial",
      "name": "Comercial",
      "short": "Vendas e clientes",
      "description": "Procuramos alguém com formação em Arquitetura ou Engenharia que saiba vender um produto técnico e inovador.",
      "icon": "🤝"
    }
  ],
  "jobTypes": [
    "Emprego",
    "Estágio Curricular",
    "Estágio de Verão"
  ],
  "jobs": [
    {
      "id": "op-3d",
      "title": "Operador(a) de Impressora 3D",
      "area": "impressao-3d",
      "types": ["Emprego"],
      "location": "Vila do Conde, Porto",
      "summary": "Opera e monitoriza as nossas impressoras 3D em obra e fábrica.",
      "responsibilities": [
        "Preparar e operar impressoras 3D de grande formato",
        "Monitorizar qualidade de impressão em tempo real",
        "Manutenção preventiva de primeiro nível"
      ],
      "requirements": [
        "Perfil técnico-industrial",
        "Experiência em maquinaria",
        "Carta de condução",
        "Disponibilidade para trabalho em exterior"
      ]
    },
    {
      "id": "eng-mec",
      "title": "Engenheiro(a) Mecânico(a)",
      "area": "engenharia-mecanica",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto",
      "summary": "Desenvolve e mantém as nossas impressoras 3D industriais de grande escala, garantindo o seu funcionamento e evolução contínua.",
      "responsibilities": [
        "Projeto mecânico de componentes das impressoras 3D",
        "Otimização de sistemas de extrusão",
        "Apoio ao projeto, montagem e testes de novas máquinas",
        "Documentação técnica"
      ],
      "requirements": [
        "Licenciatura em Eng. Mecânica (ou Estudante para Estágios)",
        "Experiência em manutenção industrial",
        "Conhecimentos de hidráulica e pneumática",
        "Disponibilidade para 8 semanas entre Junho e Setembro (para Estágio de Verão)"
      ]
    },
    {
      "id": "eng-mat",
      "title": "Engenheiro(a) de Materiais",
      "area": "engenharia-materiais",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto",
      "summary": "Desenvolve novas fórmulas de betão para impressão aditiva neutra em carbono.",
      "responsibilities": [
        "Formulação e caracterização de betões especiais",
        "Ensaios laboratoriais reológicos e mecânicos",
        "Colaboração com equipas de obra e I&D"
      ],
      "requirements": [
        "Licenciatura ou Mestrado em Eng. de Materiais ou Química",
        "Experiência em laboratório ou I&D",
        "Perfil analítico",
        "Disponibilidade entre Junho e Setembro (para Estágio de Verão)"
      ]
    },
    {
      "id": "eng-civil",
      "title": "Engenheiro(a) Civil",
      "area": "engenharia-civil",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto",
      "summary": "Investiga e desenvolve soluções estruturais para habitações impressas em 3D.",
      "responsibilities": [
        "Coordenação técnica e acompanhamento de obras de habitação 3D",
        "Interface com clientes, arquitetos e obra",
        "Garantia de qualidade e cumprimento de prazos"
      ],
      "requirements": [
        "Licenciatura em Eng. Civil (ou Estudante para Estágios)",
        "Perfil analítico e orientado para I&D",
        "Conhecimentos BIM e inglês técnico",
        "Disponibilidade entre Junho e Setembro (para Estágio de Verão)"
      ]
    },
    {
      "id": "arq",
      "title": "Arquiteto(a)",
      "area": "arquitetura",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto",
      "summary": "Desenha soluções habitacionais únicas pensadas para impressão 3D, em colaboração com equipas internacionais.",
      "responsibilities": [
        "Desenvolvimento de projetos de arquitetura",
        "Otimização de desenho para impressão 3D",
        "Colaboração com engenharia e clientes"
      ],
      "requirements": [
        "Licenciatura em Arquitetura (ou Estudante para Estágios)",
        "Experiência em projeto residencial",
        "Domínio de Revit ou AutoCAD"
      ]
    },
    {
      "id": "comercial",
      "title": "Gestor(a) Comercial",
      "area": "comercial",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto / Remoto híbrido",
      "summary": "Procuramos alguém com formação em Arquitetura ou Engenharia que saiba vender um produto técnico e inovador.",
      "responsibilities": [
        "Prospeção e gestão de leads",
        "Apresentações técnico-comerciais",
        "Negociação e fecho de contratos"
      ],
      "requirements": [
        "Formação em Arquitetura ou Engenharia",
        "Capacidade para vender um produto técnico e inovador",
        "Jogo de cintura para gerir ciclos de venda longos",
        "Flexibilidade de horário e disponibilidade para deslocações"
      ]
    },
    {
      "id": "eng-info",
      "title": "Engenheiro(a) Informático(a)",
      "area": "engenharia-informatica",
      "types": ["Emprego", "Estágio Curricular", "Estágio de Verão"],
      "location": "Vila do Conde, Porto / Híbrido",
      "summary": "Cria o software que controla as máquinas e automatiza a produção.",
      "responsibilities": [
        "Desenvolvimento de software de controlo de máquinas",
        "Integração com sistemas CAD/CAM",
        "Ferramentas internas de produção"
      ],
      "requirements": [
        "Licenciatura em Eng. Informática (ou recém-graduado)",
        "Programação em Python, C++ ou similar",
        "Perfil proativo com vontade de meter as mãos na massa"
      ]
    }
  ]
};

/**
 * Returns the jobs.json data object { areas, jobs, jobTypes }.
 * Fetches from jobs.json once, then returns cached result.
 * Automatically falls back to local constant if CORS/fetch fails (e.g. file:// protocol).
 * @returns {Promise<{areas: Array, jobs: Array, jobTypes: Array}>}
 */
async function loadJobs() {
  if (_cache) return _cache;

  // Resolve path relative to page location (root index.html vs subpages in src/pages/)
  let path = 'jobs.json';
  if (window.location.pathname.includes('/src/pages/')) {
    path = '../../../jobs.json';
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to fetch jobs.json');
    _cache = await res.json();
  } catch (err) {
    console.warn('[data.js] Fetch failed (likely file:// protocol CORS limit). Using static fallback.', err);
    _cache = STATIC_JOBS_DATA;
  }
  
  return _cache;
}

/** Finds an area object by id. */
function getArea(data, areaId) {
  return data.areas.find(a => a.id === areaId) || null;
}

/** Finds a job object by id. */
function getJob(data, jobId) {
  return data.jobs.find(j => j.id === jobId) || null;
}

/** Returns all jobs for a given area id. */
function jobsByArea(data, areaId) {
  return data.jobs.filter(j => j.area === areaId);
}
