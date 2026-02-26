import type { GradientMeshBlob } from "./types";

export const GRADIENT_MESH_BLOBS: readonly GradientMeshBlob[] = [
  {
    size: { base: "300px", md: "500px" },
    top: "-10%",
    left: "-5%",
    lightFrom: "purple.300",
    lightTo: "blue.300",
    darkFrom: "purple.900",
    darkTo: "blue.900",
    duration: 20,
  },
  {
    size: { base: "250px", md: "400px" },
    top: "30%",
    right: "-10%",
    lightFrom: "pink.300",
    lightTo: "purple.300",
    darkFrom: "pink.900",
    darkTo: "indigo.900",
    duration: 25,
  },
  {
    size: { base: "200px", md: "350px" },
    bottom: "10%",
    left: "20%",
    lightFrom: "cyan.300",
    lightTo: "blue.300",
    darkFrom: "cyan.900",
    darkTo: "blue.950",
    duration: 22,
  },
];
