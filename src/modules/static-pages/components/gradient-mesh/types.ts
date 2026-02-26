export interface GradientMeshBlob {
  darkFrom: string;
  darkTo: string;
  duration: number;
  lightFrom: string;
  lightTo: string;
  size: { base: string; md: string };

  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}
