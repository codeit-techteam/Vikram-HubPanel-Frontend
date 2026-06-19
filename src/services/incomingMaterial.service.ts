import type { IncomingMaterial } from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

export const incomingMaterialService = {
  async getAll(): Promise<IncomingMaterial[]> {
    await delay(300);
    return erpDatabase.getIncomingMaterials();
  },
};
