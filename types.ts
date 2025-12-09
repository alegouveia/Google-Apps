export enum InputMode {
  TEXT = 'TEXT',
  FILE = 'FILE',
  URL = 'URL'
}

export enum ToneType {
  PROFESSIONAL = 'Profissional',
  NEUTRAL = 'Neutro',
  EMPATHETIC = 'Empático',
  ASSERTIVE = 'Assertivo'
}

export enum AudienceType {
  CHILD = 'Criança de 10 anos',
  LAYMAN = 'Leigo (Adulto)',
  PROFESSIONAL = 'Profissional da Área'
}

export enum FormatType {
  PARAGRAPHS = 'Texto Corrido',
  BULLET_POINTS = 'Tópicos',
  FAQ = 'Perguntas e Respostas',
  SUMMARY = 'Resumo Executivo'
}

export enum LengthType {
  CONCISE = 'Conciso',
  MODERATE = 'Moderado',
  DETAILED = 'Detalhado'
}

export interface InterpretationConfig {
  tone: ToneType;
  audience: AudienceType;
  format: FormatType;
  length: LengthType;
}

export interface FileData {
  name: string;
  mimeType: string;
  data: string; // base64 encoded string
}

export interface HistoryItem {
  id: string;
  date: string;
  preview: string;
  result: string;
  userQuestion?: string;
}

export interface InterpretationResult {
  text: string;
  error?: string;
}