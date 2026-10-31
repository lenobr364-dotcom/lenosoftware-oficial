const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://fabrica-agentes-1065846123509.us-central1.run.app").replace(
  /\/$/,
  "",
);

export { API_URL };

export type ModuleStatus = {
  status: string;
  path: string;
};

export type RootPayload = {
  ecosystem: string;
  status: string;
  lumen: string;
  modules: {
    fabrica_de_agentes: ModuleStatus;
    chemvault_global: ModuleStatus;
    economia?: ModuleStatus;
    manutencao?: ModuleStatus;
    telemetria?: ModuleStatus;
  };
};

export type ComponenteFormula = {
  id?: number;
  nome: string;
  cas_number: string;
  proporcao_percentual: string | number;
  custo_producao: string | number;
};

export type FormulaQuimica = {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  cas_numbers: string;
  proporcao_diluicao: string;
  custo_producao: string | number;
  moeda: string;
  unidade_custo: string;
  ativo_principal: string | null;
  criado_em: string;
  componentes: ComponenteFormula[];
};

export type FormulaIn = {
  codigo: string;
  nome: string;
  categoria: string;
  cas_numbers: string;
  proporcao_diluicao: string;
  custo_producao: number;
  moeda?: string;
  unidade_custo?: string;
  ativo_principal?: string;
  componentes?: ComponenteFormula[];
};

const TOKEN_KEY = "leno_jwt";

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getRoot() {
  return request<RootPayload>("/");
}

export function listFormulas() {
  return request<FormulaQuimica[]>("/modules/chemvault-global/formulas");
}

export function registrarFormula(payload: FormulaIn) {
  return request<FormulaQuimica>("/modules/chemvault-global/formulas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type TarefaAgente = {
  id: number;
  agente_id: number;
  titulo: string;
  descricao: string;
  estado: string;
  custo_processamento: string | number;
  despachada_em: string;
  atualizada_em: string;
};

export type TransacaoInterna = {
  id: number;
  agente_id: number;
  tipo: string;
  creditos: string | number;
  custo_computacional: string | number;
  descricao: string;
  criado_em: string;
};

export type AgenteAutonomo = {
  id: number;
  codigo: string;
  nome: string;
  papel: string;
  estado: string;
  creditos: string | number;
  custo_processamento: string | number;
  criado_em: string;
  tarefas: TarefaAgente[];
  transacoes: TransacaoInterna[];
};

export type MonitorFabrica = {
  agentes_ativos: number;
  agentes_totais: number;
  tarefas_em_curso: number;
  creditos_em_caixa: string | number;
  creditos_consumidos: string | number;
  custo_computacional_total: string | number;
  agentes: AgenteAutonomo[];
};

export type AgenteIn = {
  codigo: string;
  nome: string;
  papel: string;
  creditos?: number;
  custo_processamento?: number;
};

export function getMonitorFabrica() {
  return request<MonitorFabrica>("/modules/fabrica-de-agentes/monitor");
}

export function criarAgente(payload: AgenteIn) {
  return request<AgenteAutonomo>("/modules/fabrica-de-agentes/agentes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function despacharAgente(
  agenteId: number,
  payload: { titulo: string; descricao?: string; custo_processamento?: number },
) {
  return request<TarefaAgente>(`/modules/fabrica-de-agentes/agentes/${agenteId}/despacho`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Carteira = {
  agente_id: number;
  codigo: string;
  nome: string;
  saldo: string | number;
  moeda: string;
};

export type LancamentoRazao = {
  id: number;
  origem_codigo: string;
  destino_codigo: string;
  tipo: string;
  montante: string | number;
  custo_computacional: string | number;
  descricao: string;
  moeda: string;
  criado_em: string;
};

export type PontoSerie = {
  indice: number;
  lumen: string | number;
  chemvault: string | number;
  volume: string | number;
};

export type EconomiaMonitor = {
  moeda: string;
  volume_total: string | number;
  custo_computacional_total: string | number;
  carteiras: Carteira[];
  lancamentos: LancamentoRazao[];
  serie: PontoSerie[];
};

export function getEconomiaMonitor() {
  return request<EconomiaMonitor>("/modules/economia/monitor");
}

export function simularTransferencia(payload?: {
  origem_codigo?: string;
  destino_codigo?: string;
  montante?: number;
  custo_computacional?: number;
  descricao?: string;
}) {
  return request<LancamentoRazao>("/modules/economia/transferencias", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export type OrdemServico = {
  id: number;
  equipamento_id: number;
  tipo: string;
  estado: string;
  descricao: string;
  horimetro_abertura: string | number;
  criado_em: string;
};

export type EquipamentoFrota = {
  id: number;
  codigo: string;
  tipo: string;
  designacao: string;
  horimetro: string | number;
  horimetro_ultima_preventiva: string | number;
  intervalo_preventiva: string | number;
  horas_ate_preventiva: string | number;
  ciclos: number;
  estado: string;
  agente_mecanico: string;
  atualizado_em: string;
  ordens: OrdemServico[];
};

export type MonitorFrota = {
  equipamentos_totais: number;
  operacionais: number;
  em_alerta: number;
  em_manutencao: number;
  ordens_abertas: number;
  equipamentos: EquipamentoFrota[];
};

export function getMonitorFrota() {
  return request<MonitorFrota>("/modules/manutencao/monitor");
}

export function atualizarHorimetro(equipamentoId: number, horas: number, ciclos = 1) {
  return request<EquipamentoFrota>(`/modules/manutencao/equipamentos/${equipamentoId}/horimetro`, {
    method: "POST",
    body: JSON.stringify({ horas, ciclos }),
  });
}

export function abrirOrdemServico(payload: {
  equipamento_id: number;
  tipo?: string;
  descricao: string;
}) {
  return request<OrdemServico>("/modules/manutencao/ordens", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type TokenOut = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type MetricaDesempenho = {
  id: number;
  cpu_percent: string | number;
  memoria_percent: string | number;
  latencia_ms: string | number;
  no_codigo: string;
  criado_em: string;
};

export type LogAuditoria = {
  id: number;
  ator: string;
  acao: string;
  recurso: string;
  origem: string;
  criado_em: string;
};

export type NoStatus = {
  codigo: string;
  papel: string;
  estado: string;
};

export type TelemetriaMonitor = {
  cpu_atual: string | number;
  memoria_atual: string | number;
  latencia_atual: string | number;
  nos: NoStatus[];
  serie: MetricaDesempenho[];
  auditoria: LogAuditoria[];
};

export async function loginAdmin(username: string, password: string) {
  const token = await request<TokenOut>("/auth/token", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(token.access_token);
  return token;
}

export function logoutAdmin() {
  setToken(null);
}

export function getTelemetriaMonitor() {
  return request<TelemetriaMonitor>("/modules/telemetria/monitor");
}
