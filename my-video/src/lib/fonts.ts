import { loadFont as loadBaloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

export const { fontFamily: displayFont } = loadBaloo("normal", {
  weights: ["400", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: bodyFont } = loadNunito("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
