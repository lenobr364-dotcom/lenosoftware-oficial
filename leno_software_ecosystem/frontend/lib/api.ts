const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export type Cliente = {
  id: number;
  nome: string;
  empresa: string;
  email: string;
  criado_em: string;
};

export type Relatorio = {
  id: number;
  cliente_id: number;
  ativo: string;
  processo: string;
  descricao: string;
  observacoes: string | null;
  criado_em: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<{ status: string; service: string }>("/api/health");
}

export function listClientes() {
  return request<Cliente[]>("/api/clientes");
}

export function createCliente(payload: { nome: string; empresa: string; email: string }) {
  return request<Cliente>("/api/clientes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listRelatorios() {
  return request<Relatorio[]>("/api/relatorios");
}

export function createRelatorio(payload: {
  cliente_id: number;
  ativo: string;
  processo: string;
  descricao: string;
  observacoes?: string;
}) {
  return request<Relatorio>("/api/relatorios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
