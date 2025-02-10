import { headers } from "next/headers";
import VisitorDashboard from "../components/VisitorDashboard";

export default async function Page() {
  const headersList = headers();

  // Get data from Cloudflare headers
  const visitorData = {
    ip: (await headersList).get("cf-connecting-ip"),
    city: (await headersList).get("cf-ipcity"),
    country: (await headersList).get("cf-ipcountry"),
    latitude: (await headersList).get("cf-iplatitude"),
    longitude: (await headersList).get("cf-iplongitude"),
    region: (await headersList).get("cf-region"),
    timezone: (await headersList).get("cf-timezone"),
  };

  return <VisitorDashboard initialData={visitorData} />;
}
