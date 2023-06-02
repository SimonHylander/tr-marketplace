import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#155d64] to-[#79bb97]">
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
