export type Dificuldade = 'Fácil' | 'Médio' | 'Difícil';

export interface Hino {
  numero: number;
  numeroExibicao?: string;
  titulo: string;
  dificuldadeIntro: Dificuldade;
  dificuldadeInteiro: Dificuldade;
  acidentes: number;
  quantidadeAcidentes: number;
  tipoAcidente: string;
  tonalidadeEfeito: string;
  tonalidadeRelativa: string;
  armadura: string;
  compasso: string;
  categoria: string;
  meiaHora: boolean;
  observacoes: string[];
}

export type StatusHino = 'nao_iniciado' | 'em_estudo' | 'aprendido';

export interface RegistroProgresso {
  intro: StatusHino;
  inteiro: StatusHino;
  anotacoes?: string;
  atualizadoEm?: string;
}

export interface ProgressoStore {
  instrumentoId: string;
  registros: Record<number, RegistroProgresso>;
}
