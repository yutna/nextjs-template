import type { GradientMeshBlob } from "./types";

export const GRADIENT_MESH_BLOBS: readonly GradientMeshBlob[] = [
  {
    darkFrom: "purple.900",
    darkTo: "blue.900",
    duration: 20,
    left: "-5%",
    lightFrom: "purple.300",
    lightTo: "blue.300",
    size: { base: "300px", md: "500px" },
    top: "-10%",
  },
  {
    darkFrom: "pink.900",
    darkTo: "indigo.900",
    duration: 25,
    lightFrom: "pink.300",
    lightTo: "purple.300",
    right: "-10%",
    size: { base: "250px", md: "400px" },
    top: "30%",
  },
  {
    bottom: "10%",
    darkFrom: "cyan.900",
    darkTo: "blue.950",
    duration: 22,
    left: "20%",
    lightFrom: "cyan.300",
    lightTo: "blue.300",
    size: { base: "200px", md: "350px" },
  },
];
