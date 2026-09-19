import { TODOS_INSTRUMENTOS_OFICIAIS } from '../utils/instrumentUtils';

export type UserRole = 'admin' | 'aluno';

export type InstrumentoOficial = string;

export const INSTRUMENTOS_OFICIAIS: string[] = TODOS_INSTRUMENTOS_OFICIAIS;

export type StatusProgresso = 'Não iniciado' | 'Em aprendizado' | 'Em progresso' | 'Concluído';

export interface UsuarioDoc {
  uid: string;
  name: string;
  email: string;
  phone: string;
  instrument: InstrumentoOficial;
  role: UserRole;
  totalHinos: number;
  hinosConcluidos: number;
  hinosEmProgresso: number;
  progressoGeral: number; // 0 - 100
  createdAt?: any;
  updatedAt?: any;
}

export interface HinoProgressoDoc {
  hinoId: number;
  name: string;
  status: StatusProgresso;
  progress: number; // 0 - 100
  updatedAt?: any;
  observacoes?: string;
}
