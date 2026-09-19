export type MetodoEstagio = 'rjm' | 'culto' | 'oficializacao';

export type MetodoEstagioStatus = 'Iniciante' | 'Apto RJM / Ensaio' | 'Apto Culto Oficial' | 'Apto Oficialização';

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

export interface AlunoMetodoProgressoDoc {
  studentId: string;
  instrumentoNome: string;
  metodoId: string;
  metodoNome: string;
  posicaoAtual: string; // Ex: 'Página 24, Lição 12'
  progressoPercent: number; // 0 - 100%
  estagiosAptos: {
    rjm: boolean; // Apto para RJM / Ensaio
    culto: boolean; // Apto para Culto Oficial
    oficializacao: boolean; // Apto para Oficialização
  };
  observacoesInstrutor: string;
  updatedAt: any;
}
