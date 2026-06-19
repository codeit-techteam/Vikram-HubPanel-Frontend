/**
 * Centralized ERP mock database seed files.
 * All modules read/write through erpDatabase — never import these directly in UI code.
 */
export { default as analytics } from "./analytics.json";
export { default as deliveries } from "./deliveries.json";
export { default as dispatches } from "./dispatches.json";
export { default as documents } from "./documents.json";
export { default as drivers } from "./drivers.json";
export { default as inventory } from "./inventory.json";
export { default as ledger } from "./ledger.json";
export { default as materialReceiving } from "./materialReceiving.json";
export { default as orders } from "./orders.json";
export { default as receiving } from "./receiving.json";
export { default as requisitions } from "./requisitions.json";
export { default as tracking } from "./tracking.json";
export { default as transfers } from "./transfers.json";
export { default as users } from "./users.json";
export { default as vehicles } from "./vehicles.json";
