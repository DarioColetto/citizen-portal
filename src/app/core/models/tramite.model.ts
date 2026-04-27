export type TramiteType = 'habilitacion' | 'subsidio' | 'certificado' | 'reclamo';
export type TramiteStatus = 'pending' | 'in-review' | 'approved' | 'rejected';

export interface TramiteDocument {
  name: string;
  base64: string;
  size: number;
  type: string;
}

export interface Tramite {
  id: number;
  type: TramiteType;
  title: string;
  description: string;
  applicantName: string;
  applicantDni: string;
  applicantEmail: string;
  address: string;
  documents: TramiteDocument[];
  status: TramiteStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type TramiteFormValue = Omit<Tramite, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
