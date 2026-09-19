export type MetodoEstagio = 'rjm' | 'culto' | 'oficializacao';

export type MetodoEstagioStatus = 'Iniciante' | 'Apto RJM / Ensaio' | 'Apto Culto Oficial' | 'Apto Oficialização';

export type MetodoLicaoStatus = 'Não iniciado' | 'Em andamento' | 'Concluído';

export interface MetodoExigenciaEstagio {
  descricao: string; // Ex: 'Até pág. 25' ou 'Vol. 1 até pág. 35'
  observacao?: string; // Ex: 'Hinos 431 a 480 soprano no natural'
}

export interface MetodoOpcaoDef {
  id: string;
  nome: string; // Ex: 'Amadeu Russo', 'Giampieri', 'N. Laoureux'
  subtitulo?: string;
  exigencias: {
    rjm: MetodoExigenciaEstagio;
    culto: MetodoExigenciaEstagio;
    oficializacao: MetodoExigenciaEstagio;
  };
}

export interface InstrumentoMetodosConfig {
  instrumentoId: string;
  instrumentoNome: string;
  familia: 'Cordas' | 'Madeiras' | 'Metais';
  metodos: MetodoOpcaoDef[];
  observacoesGerais?: {
    rjm?: string;
    culto?: string;
    oficializacao?: string;
  };
}

export interface MetodoLicaoDoc {
  id: string; // ex: "p15_l3"
  studentId: string;
  metodoId: string;
  metodoNome: string;
  numeroPagina: number; // Página, ex: 15
  numeroLicao: number;  // Lição, ex: 3
  titulo?: string;       // Opcional: ex: "Exercício de Tercinas"
  status: MetodoLicaoStatus;
  progress: number;      // 0 - 100%
  teacherNotes?: string; // Parecer / orientação pedagógica do professor
  startedAt?: any;
  completedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface AlunoMetodoProgressoDoc {
  studentId: string;
  instrumentoNome: string;
  metodoId: string;
  metodoNome: string;
  paginaAtual?: number;
  licaoAtual?: number;
  posicaoAtual: string; // Ex: 'Página 15, Lição 3'
  progressoPercent: number; // 0 - 100%
  totalLicoesCadastradas?: number;
  totalLicoesConcluidas?: number;
  estagiosAptos: {
    rjm: boolean; // Apto para RJM / Ensaio
    culto: boolean; // Apto para Culto Oficial
    oficializacao: boolean; // Apto para Oficialização
  };
  observacoesInstrutor: string;
  updatedAt: any;
}
