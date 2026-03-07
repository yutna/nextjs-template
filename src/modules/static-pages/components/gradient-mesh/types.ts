export interface GradientMeshBlob {
  darkFrom: string;
  darkTo: string;
  duration: number;
  lightFrom: string;
  lightTo: string;
  size: { base: string; md: string };

  bottom?: string;
  left?: string;
  right?: string;
  top?: string;
}
