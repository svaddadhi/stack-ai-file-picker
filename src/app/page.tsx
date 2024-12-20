"use client";

import { FilePicker } from "./components/file-picker/file-picker";
import { SWRConfig } from "swr";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <FilePicker />
      </SWRConfig>
    </div>
  );
}
