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
      "description": "Opera e monitoriza as nossas impressoras 3D de betão em obra e fábrica.",
      "icon": "🖨️"
    },
    {
      "id": "engenharia-civil",
      "name": "Engenharia Civil",
      "short": "Projeto e obra",
      "description": "Projeta e coordena a construção de habitações impressas em 3D.",
      "icon": "🏗️"
    },
    {
      "id": "arquitetura",
      "name": "Arquitetura",
      "short": "Design habitacional",
      "description": "Desenha soluções habitacionais únicas para impressão 3D.",
      "icon": "📐"
    },
    {
      "id": "engenharia-materiais",
      "name": "Engenharia de Materiais",
      "short": "R&D betão",
      "description": "Desenvolve novas fórmulas de betão para impressão aditiva.",
      "icon": "🧪"
    },
    {
      "id": "engenharia-mecanica",
      "name": "Engenharia Mecânica",
      "short": "Máquinas e sistemas",
      "description": "Desenvolve e mantém as nossas impressoras industriais.",
      "icon": "⚙️"
    },
    {
      "id": "engenharia-informatica",
      "name": "Engenharia Informática",
      "short": "Software e controlo",
      "description": "Cria o software que controla as máquinas e a produção.",
      "icon": "💻"
    },
    {
      "id": "comercial",
      "name": "Comercial",
      "short": "Vendas e clientes",
      "description": "Liga o mercado à nossa tecnologia disruptiva.",
      "icon": "🤝"
    }
  ],
  "jobTypes": [
    "Emprego",
    "Estágio Profissional",
    "Estágio Curricular",
    "Estágio de Verão"
  ],
  "jobs": [
    {
      "id": "op-3d-emprego",
      "title": "Operador(a) de Impressora 3D",
      "area": "impressao-3d",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão",
      "summary": "Opera as nossas impressoras 3D de betão em ambiente de produção e obra.",
      "responsibilities": [
        "Preparar e operar impressoras 3D de grande formato",
        "Monitorizar qualidade de impressão em tempo real",
        "Manutenção preventiva de primeiro nível"
      ],
      "requirements": [
        "12º ano ou curso técnico",
        "Disponibilidade para deslocação a obras",
        "Gosto por tecnologia e trabalho manual"
      ]
    },
    {
      "id": "eng-mec-emprego",
      "title": "Engenheiro(a) Mecânico(a)",
      "area": "engenharia-mecanica",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão",
      "summary": "Integra a equipa de desenvolvimento das nossas impressoras industriais.",
      "responsibilities": [
        "Projeto mecânico de componentes das impressoras 3D",
        "Otimização de sistemas de extrusão",
        "Acompanhamento de montagem e testes"
      ],
      "requirements": [
        "Mestrado em Eng. Mecânica",
        "Domínio de SolidWorks ou similar",
        "1+ anos de experiência (valorizado)"
      ]
    },
    {
      "id": "eng-mec-estagio",
      "title": "Estágio Profissional — Eng. Mecânica",
      "area": "engenharia-mecanica",
      "type": "Estágio Profissional",
      "location": "Vila Nova de Famalicão",
      "summary": "Estágio remunerado (IEFP) na equipa de I&D mecânico.",
      "responsibilities": [
        "Apoio ao projeto de novas máquinas",
        "Testes e validação em bancada",
        "Documentação técnica"
      ],
      "requirements": [
        "Recém-licenciado(a) ou mestre em Eng. Mecânica",
        "Elegibilidade para estágio IEFP"
      ]
    },
    {
      "id": "eng-mec-verao",
      "title": "Estágio de Verão — Eng. Mecânica",
      "area": "engenharia-mecanica",
      "type": "Estágio de Verão",
      "location": "Vila Nova de Famalicão",
      "summary": "8 semanas a construir o futuro da construção 3D.",
      "responsibilities": [
        "Participação em projeto real de I&D",
        "Formação técnica interna",
        "Contacto com produção e obra"
      ],
      "requirements": [
        "Estudante do 3º/4º/5º ano de Eng. Mecânica",
        "Disponibilidade para 8 semanas entre Junho e Setembro"
      ]
    },
    {
      "id": "eng-mat-emprego",
      "title": "Engenheiro(a) de Materiais",
      "area": "engenharia-materiais",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão",
      "summary": "Lidera o desenvolvimento das nossas formulas de betão imprimível.",
      "responsibilities": [
        "Formulação e caracterização de betões especiais",
        "Ensaios laboratoriais reológicos e mecânicos",
        "Colaboração com equipas de obra e I&D"
      ],
      "requirements": [
        "Mestrado em Eng. Materiais / Civil / Química",
        "Experiência com betões ou cimentícios (valorizado)"
      ]
    },
    {
      "id": "eng-mat-estagio",
      "title": "Estágio Profissional — Eng. Materiais",
      "area": "engenharia-materiais",
      "type": "Estágio Profissional",
      "location": "Vila Nova de Famalicão",
      "summary": "Integra o laboratório de materiais em regime de estágio IEFP.",
      "responsibilities": [
        "Preparação de amassaduras e provetes",
        "Ensaios de reologia e resistência",
        "Registo e tratamento de dados"
      ],
      "requirements": [
        "Recém-licenciado(a) ou mestre em Eng. Materiais",
        "Elegibilidade para estágio IEFP"
      ]
    },
    {
      "id": "eng-mat-verao",
      "title": "Estágio de Verão — Eng. Materiais",
      "area": "engenharia-materiais",
      "type": "Estágio de Verão",
      "location": "Vila Nova de Famalicão",
      "summary": "Formulação de betões inovadores durante o Verão.",
      "responsibilities": [
        "Trabalho prático em laboratório",
        "Apoio a projetos de I&D em curso"
      ],
      "requirements": [
        "Estudante de Eng. Materiais / Civil / Química",
        "Disponibilidade entre Junho e Setembro"
      ]
    },
    {
      "id": "eng-civil-emprego",
      "title": "Engenheiro(a) Civil",
      "area": "engenharia-civil",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão",
      "summary": "Coordena projetos de habitação impressa em 3D, do papel à obra.",
      "responsibilities": [
        "Coordenação técnica de projetos habitacionais",
        "Interface com clientes, arquitetos e obra",
        "Garantia de qualidade e cumprimento de prazos"
      ],
      "requirements": [
        "Mestrado em Engenharia Civil",
        "Carta de condução",
        "Experiência em obra (valorizada)"
      ]
    },
    {
      "id": "eng-civil-verao",
      "title": "Estágio de Verão — Eng. Civil",
      "area": "engenharia-civil",
      "type": "Estágio de Verão",
      "location": "Vila Nova de Famalicão",
      "summary": "Vive um Verão em obras de habitação 3D reais.",
      "responsibilities": [
        "Acompanhamento de obra",
        "Apoio à coordenação técnica"
      ],
      "requirements": [
        "Estudante do 3º/4º/5º ano de Eng. Civil",
        "Disponibilidade entre Junho e Setembro"
      ]
    },
    {
      "id": "arq-emprego",
      "title": "Arquiteto(a)",
      "area": "arquitetura",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão",
      "summary": "Desenha a próxima geração de habitações impressas em 3D.",
      "responsibilities": [
        "Desenvolvimento de projetos de arquitetura",
        "Otimização de desenho para impressão 3D",
        "Colaboração com engenharia e clientes"
      ],
      "requirements": [
        "Mestrado em Arquitetura",
        "Domínio de Revit / Rhino / AutoCAD"
      ]
    },
    {
      "id": "comercial-emprego",
      "title": "Gestor(a) Comercial",
      "area": "comercial",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão / Remoto híbrido",
      "summary": "Representa a Havelar junto de promotores, autarquias e clientes finais.",
      "responsibilities": [
        "Prospeção e gestão de leads",
        "Apresentações técnico-comerciais",
        "Negociação e fecho de contratos"
      ],
      "requirements": [
        "Experiência comercial B2B (construção valorizada)",
        "Excelente comunicação em Português e Inglês",
        "Carta de condução"
      ]
    },
    {
      "id": "eng-info-emprego",
      "title": "Engenheiro(a) Informático(a)",
      "area": "engenharia-informatica",
      "type": "Emprego",
      "location": "Vila Nova de Famalicão / Híbrido",
      "summary": "Desenvolve o software que faz mover as nossas impressoras.",
      "responsibilities": [
        "Desenvolvimento de software de controlo de máquinas",
        "Integração com sistemas CAD/CAM",
        "Ferramentas internas de produção"
      ],
      "requirements": [
        "Licenciatura/Mestrado em Eng. Informática",
        "Sólidos conhecimentos de Python, C++ ou TypeScript"
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
