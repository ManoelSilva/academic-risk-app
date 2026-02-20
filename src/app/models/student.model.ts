export interface Student {
  id?: number;
  fullName: string;
  registrationNumber: string;
  course: string;
  academicYear: number;
  gpa: number;
  attendancePercentage: number;
  createdAt?: string;
  updatedAt?: string;

  // Risk Model Features
  inde?: number;
  iaa?: number;
  ieg?: number;
  ips?: number;
  ida?: number;
  ipp?: number;
  ipv?: number;
  ian?: number;
  defasagem?: number;
  idadeAluno?: number;
  anosPm?: number;
  pedra?: string;
  pontoVirada?: string;
  sinalizadorIngressante?: string;
}
