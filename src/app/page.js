import HomeClient from "./HomeClient";
import { getProducts, getSettings, getRecentReviews } from "@/lib/store";

// Rebuild the cached homepage at most once a minute. Admin saves also call
// revalidatePath("/") so edits show up straight away.
export const revalidate = 60;

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [settings, allProducts, recentReviews] = await Promise.all([
    getSettings(),
    getProducts(),
    getRecentReviews(),
  ]);

  return <HomeClient settings={settings} allProducts={allProducts} recentReviews={recentReviews} />;
}
