import { JetBrains_Mono } from "next/font/google";
import { HomePage } from "./components/home-page";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export default function Page() {
  return (
    <div className={jetbrainsMono.className}>
      <HomePage />
    </div>
  );
}
