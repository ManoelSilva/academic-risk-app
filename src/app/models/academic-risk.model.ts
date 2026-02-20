export interface RiskModelFeatureVector {
  INDE: number;
  IAA: number;
  IEG: number;
  IPS: number;
  IDA: number;
  IPP: number;
  IPV: number;
  IAN: number;
  DEFASAGEM: number;
  IDADE_ALUNO: number;
  ANOS_PM: number;
  PEDRA: string;
  PONTO_VIRADA: string;
  SINALIZADOR_INGRESSANTE: string;
}

export type AcademicRiskRequest = RiskModelFeatureVector[];

export interface RiskPrediction {
  id: number;
  risk_prediction: number;
  risk_probability: number;
  risk_label: string;
}

export interface AcademicRiskResponse {
  status: string;
  count: number;
  predictions: RiskPrediction[];
}
