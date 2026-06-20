export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "in_transit"
  | "delivered"
  | "received"
  | "dispatched"
  | "cancelled"
  | "low_stock"
  | "critical";

export interface Hub {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  manager: string;
  capacity: number;
  utilization: number;
  status: Status;
  warehouseCount: number;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  hubId: string;
  name: string;
  code: string;
  capacity: number;
  utilization: number;
  status: Status;
}

export interface Material {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  minStock: number;
  maxStock: number;
  unitPrice: number;
}

export interface InventoryItem {
  id: string;
  materialId: string;
  materialName: string;
  sku: string;
  hubId: string;
  hubName: string;
  quantity: number;
  reserved: number;
  available: number;
  unit: string;
  status: Status;
  lastUpdated: string;
}

export type InventoryProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventorySortField =
  | "name"
  | "sku"
  | "category"
  | "currentStock"
  | "reserved"
  | "available";

export interface InventoryProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  categoryKey: string;
  icon: string;
  currentStock: string;
  reserved: string;
  available: string;
  status: InventoryProductStatus;
  unitPrice?: number;
}

export interface InventorySummaryData {
  totalSkus: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface WarehouseUtilization {
  label: string;
  capacityUsed: number;
  description: string;
  backgroundImage: string;
}

export interface InventoryFilterOption {
  value: string;
  label: string;
}

export interface InventoryPaginationMeta {
  totalProducts: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryData {
  summary: InventorySummaryData;
  warehouse: WarehouseUtilization;
  categories: InventoryFilterOption[];
  statuses: InventoryFilterOption[];
  pagination: InventoryPaginationMeta;
  products: InventoryProduct[];
}

export interface AddMaterialPayload {
  name: string;
  description: string;
  sku: string;
  categoryKey: string;
  category: string;
  unit: string;
  initialStock: number;
  unitPrice?: number;
}

export type RequisitionStatus =
  | "pending"
  | "approved"
  | "allocated"
  | "in_transit"
  | "delivered"
  | "received";

export interface RequisitionItem {
  quantity: string;
  material: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status: "completed" | "active" | "pending";
  type?: "tracking";
}

export interface LiveTracking {
  title: string;
  progress: string;
}

export interface RequisitionRequest {
  id: string;
  requestId: string;
  date: string;
  hubLocation: string;
  items: RequisitionItem;
  value: string;
  status: RequisitionStatus;
  timeline: TimelineEvent[];
  liveTracking?: LiveTracking;
}

export interface RequisitionStatsData {
  openRequests: { value: number; badge: string };
  approvedRequests: { value: number; badge: string };
  delayedRequests: { value: number; badge: string };
}

export interface RequisitionPaginationMeta {
  totalOpen: number;
  pageSize: number;
  totalPages: number;
}

export interface RequisitionFilterOption {
  value: string;
  label: string;
}

export interface RequisitionData {
  stats: RequisitionStatsData;
  statusOptions: RequisitionFilterOption[];
  pagination: RequisitionPaginationMeta;
  defaultSelectedId: string;
  requests: RequisitionRequest[];
}

export interface CreateRequisitionPayload {
  requestTitle: string;
  materialCategory: string;
  materialName: string;
  quantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "urgent";
  expectedDeliveryDate: string;
  remarks?: string;
}

export type RequisitionFormPriority = "normal" | "high" | "urgent";

export interface DraftMaterialItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  requestedQty: number;
  unit: string;
  unitPrice: number;
}

export interface DraftRequisition {
  requisitionId: string;
  hubId: string;
  hubName: string;
  priority: RequisitionFormPriority;
  expectedDate: string;
  requestReason: string;
  materials: DraftMaterialItem[];
  sourceWarehouse: string;
  lastSavedAt?: string;
}

export interface FleetVehicle {
  id: string;
  vehicleNo: string;
  status: string;
  progress: number;
  lastRequisitionProcessed: string;
}

export interface CreateRequisitionFormData {
  hubId: string;
  priority: RequisitionFormPriority;
  expectedDate: string;
  requestReason: string;
  materials: DraftMaterialItem[];
}

/** @deprecated Legacy requisition type — use RequisitionRequest */
export interface Requisition {
  id: string;
  requisitionNo: string;
  hubId: string;
  hubName: string;
  requestedBy: string;
  department: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: Status;
  items: number;
  totalQuantity: number;
  createdAt: string;
  requiredBy: string;
}

export interface IncomingMaterial {
  id: string;
  shipmentNo: string;
  supplier: string;
  hubId: string;
  hubName: string;
  materialCount: number;
  totalQuantity: number;
  expectedDate: string;
  status: Status;
  carrier: string;
}

/** @deprecated Legacy transfer type — use IncomingTransfer */
export interface Transfer {
  id: string;
  transferNo: string;
  fromHub: string;
  toHub: string;
  materialCount: number;
  totalQuantity: number;
  status: Status;
  initiatedBy: string;
  createdAt: string;
  expectedDelivery: string;
}

export type TransferStatus =
  | "ready"
  | "in_transit"
  | "arriving_today"
  | "delayed"
  | "received"
  | "dispatched";

export type ManifestMaterialStatus =
  | "loaded"
  | "in_transit"
  | "delivered"
  | "pending";

export interface ManifestMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: ManifestMaterialStatus;
  sku?: string;
}

export interface VehicleDetails {
  number: string;
  type: string;
  capacity: string;
  status: string;
}

export interface ShipmentTimelineItem {
  id: string;
  title: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
  highlight?: string;
}

export interface CreateTransferPayload {
  sourceWarehouse: string;
  destinationHub: string;
  vehicle: string;
  driver: string;
  expectedDispatchDate: string;
  materials: string;
  quantity: string;
  priority: string;
  remarks?: string;
}

export type TransferFilterStatus =
  | "all"
  | "ready"
  | "in_transit"
  | "arriving_today"
  | "delayed";

export type TransferSortField =
  | "eta_asc"
  | "eta_desc"
  | "status"
  | "transfer_id";

export interface TransferMaterial {
  id: string;
  name: string;
  quantity: string;
  sku?: string;
}

export interface TransferDriver {
  name: string;
  phone: string;
}

export interface TransferTimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status: "completed" | "active" | "pending";
}

export interface TransferDocument {
  id: string;
  name: string;
  type: string;
  size: string;
}

export interface IncomingTransfer {
  id: string;
  transferId: string;
  status: TransferStatus;
  eta: string | null;
  scheduled: string | null;
  etaDisplay: string;
  isDelayed?: boolean;
  source: string;
  destination: string;
  dispatchDate?: string;
  vehicle: string;
  vehicleDetails?: VehicleDetails;
  driver: TransferDriver;
  materials: TransferMaterial[];
  manifest?: ManifestMaterial[];
  timeline: TransferTimelineEvent[];
  shipmentTimeline?: ShipmentTimelineItem[];
  documents: TransferDocument[];
  requisitionId?: string;
  inventoryId?: string;
  dispatchId?: string;
  siteId?: string;
  createdAt: string;
}

export interface TransferSummary {
  totalIncoming: number;
  onTime: number;
  delayed: number;
}

export interface TransferData {
  summary: TransferSummary;
  transfers: IncomingTransfer[];
}

export interface MaterialReceivingItem {
  materialId: string;
  materialName: string;
  expectedQuantity: string;
  quantityReceived: number;
  damageQuantity: number;
}

export interface MaterialReceivingRecord {
  id: string;
  transferId: string;
  vehicleNumber: string;
  materials: MaterialReceivingItem[];
  remarks?: string;
  receivedAt: string;
  receivedBy: string;
}

export interface ReceiveTransferPayload {
  transferId: string;
  vehicleNumber: string;
  materials: MaterialReceivingItem[];
  remarks?: string;
}

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "discrepancy";

export type DiscrepancyType =
  | "damage"
  | "shortage"
  | "excess"
  | "quality_issue";

export type ReceivingRecordStatus =
  | "pending_verification"
  | "verification_pending"
  | "delivered"
  | "received";

export interface ReceivingMaterialItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  dispatchedQty: number;
  dispatchedUnit: string;
  dispatchedDisplay: string;
  receivedQty: number;
  verificationStatus: VerificationStatus;
  inventoryProductId: string;
}

export interface ReceivingPhoto {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface ReceivingDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface DiscrepancyRecord {
  id: string;
  transferId: string;
  productId: string;
  productName: string;
  dispatchedQty: number;
  receivedQty: number;
  discrepancyType: DiscrepancyType;
  remarks: string;
  evidenceUrls: string[];
  createdAt: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  transferId: string;
  requisitionId: string;
  receivedAt: string;
  receivedBy: string;
  materials: ReceivingMaterialItem[];
}

export interface ReceivingRecord {
  id: string;
  transferId: string;
  requisitionId: string;
  dispatchId: string;
  inventoryId: string;
  source: string;
  sourceHub: string;
  subtitle: string;
  transferNumber: string;
  dispatchDate: string;
  dispatchTime: string;
  vehicleNumber: string;
  driverName: string;
  status: ReceivingRecordStatus;
  materials: ReceivingMaterialItem[];
  photos: ReceivingPhoto[];
  documents: ReceivingDocument[];
  grnNumber?: string;
}

export interface MaterialReceivingData {
  records: ReceivingRecord[];
}

export interface SubmitDiscrepancyPayload {
  transferId: string;
  productId: string;
  productName: string;
  dispatchedQty: number;
  receivedQty: number;
  discrepancyType: DiscrepancyType;
  remarks: string;
  evidenceUrls?: string[];
}

export interface SubHubOrder {
  id: string;
  orderNo: string;
  subHubName: string;
  parentHub: string;
  items: number;
  totalQuantity: number;
  status: Status;
  orderDate: string;
  deliveryDate: string;
}

export type OrderStatus =
  | "new"
  | "processing"
  | "packed"
  | "out_for_delivery"
  | "delivered";

export type OrderFilterTab = "all" | "active" | "completed";

export interface OrderCustomer {
  name: string;
  type: string;
  email?: string;
  phone?: string;
}

export interface OrderMaterial {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  method: string;
  status: string;
  amount: number;
  paidAmount: number;
  dueDate?: string;
  transactionId?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
}

export interface OrderGstDetails {
  gstin: string;
  companyName: string;
  state: string;
}

export interface OrderDispatchHistoryEntry {
  dispatchNo: string;
  status: string;
  vehicle: string;
  driver: string;
  dispatchedAt: string;
}

export interface HubOrder {
  id: string;
  orderNo: string;
  customer: OrderCustomer;
  location: string;
  value: number;
  status: OrderStatus;
  materials: OrderMaterial[];
  payment: OrderPayment;
  deliveryAddress: string;
  billingAddress?: string;
  gstDetails?: OrderGstDetails;
  timeline: OrderTimelineEvent[];
  orderDate: string;
  createdAt: string;
  dispatchId?: string;
  dispatchHistory?: OrderDispatchHistoryEntry[];
  inventoryAllocation?: { sku: string; name: string; allocated: number; unit: string }[];
}

export interface OrderSummaryData {
  todaysOrders: number;
  dailyTarget: number;
  revenue: number;
  revenueChangePercent: number;
  pendingDeliveries: number;
  etaAvgHours: number;
  completedOrders: number;
  totalOrders: number;
}

export interface OrdersData {
  summary: OrderSummaryData;
  orders: HubOrder[];
}

export interface CreateDispatchPayload {
  orderId: string;
  vehicle: string;
  driver: string;
  dispatchDate: string;
  expectedDeliveryTime: string;
  priority: "normal" | "high" | "urgent";
  remarks?: string;
}

export interface OrderPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Dispatch {
  id: string;
  dispatchNo: string;
  orderNo: string;
  destination: string;
  vehicleNo: string;
  driver: string;
  items: number;
  status: Status;
  dispatchDate: string;
  estimatedArrival: string;
}

export type LedgerTransactionType =
  | "received"
  | "sold"
  | "returned"
  | "adjusted"
  | "damaged";

export type LedgerLinkedModule =
  | "inventory"
  | "transfer"
  | "receiving"
  | "dispatch"
  | "order";

export interface LedgerTransaction {
  id: string;
  transactionNo: string;
  date: string;
  type: LedgerTransactionType;
  product: string;
  sku: string;
  openingStock: number;
  openingStockUnit: string;
  change: number;
  changeUnit: string;
  closingStock: number;
  closingStockUnit: string;
  linkedModule: LedgerLinkedModule;
  referenceId: string;
  supplier?: string;
  warehouse: string;
  createdBy: string;
  remarks?: string;
  truckId?: string;
}

/** @deprecated Use LedgerTransaction */
export interface LedgerEntry {
  id: string;
  transactionNo: string;
  materialName: string;
  sku: string;
  hubName: string;
  type: "inbound" | "outbound" | "transfer" | "adjustment";
  quantity: number;
  balance: number;
  reference: string;
  performedBy: string;
  timestamp: string;
}

export interface LedgerAuditRecord {
  id: string;
  auditDate: string;
  auditor: string;
  remarks: string;
  variance: number;
}

export interface LedgerFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  product: string;
  transactionTypes: LedgerTransactionType[];
}

export interface LedgerChartDataPoint {
  date: string;
  label: string;
  inflow: number;
  outflow: number;
}

export interface LedgerAnalytics {
  totalInflow: number;
  totalOutflow: number;
  stockVariance: number;
  auditAccuracy: number;
  lowStockSkus: number;
  mostMovedMaterials: { product: string; sku: string; movements: number }[];
}

export interface LedgerPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface KpiMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiFilters {
  search?: string;
  status?: string;
  hubId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type DeliveryStatus = "in_transit" | "loading" | "delivered";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  variant: "default" | "primary" | "alert";
}

export interface IncomingDelivery {
  id: string;
  eta: string;
  material: string;
  quantity: string;
  source: string;
  status: DeliveryStatus;
}

export type OutgoingDispatchStatus =
  | "in_transit"
  | "loading"
  | "dispatched"
  | "pending";

export interface OutgoingDispatch {
  id: string;
  orderId: string;
  customerName: string;
  eta: string;
  material: string;
  quantity: string;
  destination: string;
  status: OutgoingDispatchStatus;
}

export interface QuickOperation {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface ActiveRequisition {
  id: string;
  code: string;
  title: string;
  badge: string;
  badgeVariant: "default" | "expedited";
  progress: number;
  totalSteps: number;
  statusText: string;
}

export interface OutboundEfficiency {
  total: number;
  dispatched: number;
  loading: number;
  pending: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  subtitle: string;
  type: "dispatch" | "alert" | "gate";
  timestamp: string;
}

export type DispatchQueueStatus =
  | "pending"
  | "preparing"
  | "assigned"
  | "dispatched"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "delayed";

export type DispatchQueueTab =
  | "pending"
  | "preparing"
  | "assigned"
  | "in_transit";

export type DispatchSortField = "eta" | "priority" | "driver" | "vehicle";

export interface DispatchTimelineEvent {
  id: string;
  title: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
}

export interface DispatchDocument {
  id: string;
  name: string;
  type: string;
}

export interface DispatchCustomerDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DispatchRecord {
  id: string;
  dispatchNo: string;
  orderNo: string;
  orderId?: string;
  status: DispatchQueueStatus;
  customer: string;
  customerDetails: DispatchCustomerDetails;
  schedule: string;
  scheduledTime: string;
  vehicle: string;
  driver: string;
  route: string;
  eta: string;
  priority: "normal" | "high" | "urgent";
  remarks?: string;
  items?: number;
  timeline: DispatchTimelineEvent[];
  documents: DispatchDocument[];
  dispatchDate?: string;
}

export interface PendingDispatchOrder {
  id: string;
  orderNo: string;
  label: string;
  customer: string;
  materials: string;
}

export interface VehicleMaintenanceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  cost?: number;
}

export interface DispatchVehicle {
  id: string;
  registrationNo: string;
  vehicleNumber?: string;
  capacity: string;
  status: "available" | "assigned" | "in_transit" | "maintenance" | "inactive";
  driverId?: string;
  type?: string;
  fuelType?: string;
  rcNumber?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  rcExpiry?: string;
  fitnessExpiry?: string;
  assignedHub?: string;
  gpsEnabled?: boolean;
  remarks?: string;
  documents?: { rc?: string; insurance?: string };
  maintenanceStatus?: string;
  maintenanceHistory?: VehicleMaintenanceRecord[];
  tripsToday?: number;
  assignedDriver?: string;
  availability?: string;
  currentTrip?: string | null;
}

export interface DispatchDriver {
  id: string;
  name: string;
  rating: number;
  status: "available" | "assigned" | "on_trip" | "on_leave" | "inactive";
  mobile?: string;
  phone?: string;
  alternateMobile?: string;
  email?: string;
  licenseNumber?: string;
  licenseNo?: string;
  licenseExpiry?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  bloodGroup?: string;
  joiningDate?: string;
  assignedHub?: string;
  assignedVehicle?: string;
  currentTrip?: string | null;
  completedTrips?: number;
  totalDistance?: number;
  deliverySuccessRate?: number;
  performanceScore?: number;
  availability?: string;
  documents?: { license?: string; aadhaar?: string; photo?: string };
}

export interface VehicleFormPayload {
  vehicleNumber: string;
  type: string;
  capacity: string;
  fuelType?: string;
  registrationNumber?: string;
  rcNumber?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  assignedHub?: string;
  gpsEnabled?: boolean;
  remarks?: string;
  documents?: { rc?: string; insurance?: string };
}

export interface VehicleEditPayload {
  capacity?: string;
  status?: DispatchVehicle["status"];
  assignedDriver?: string;
  driverId?: string;
  remarks?: string;
  documents?: { rc?: string; insurance?: string };
}

export interface DriverFormPayload {
  name: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  licenseNumber: string;
  licenseExpiry?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  bloodGroup?: string;
  joiningDate?: string;
  assignedHub?: string;
  rating?: number;
  documents?: { license?: string; aadhaar?: string; photo?: string };
}

export interface DriverEditPayload {
  name?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  address?: string;
  status?: DispatchDriver["status"];
  assignedVehicle?: string;
  rating?: number;
  remarks?: string;
  documents?: { license?: string; aadhaar?: string; photo?: string };
}

export interface DeliveryRecord {
  id: string;
  dispatchId: string;
  dispatchNo: string;
  orderNo: string;
  customerName: string;
  status: DispatchQueueStatus;
  deliveryTimestamp?: string;
  otp?: string;
  podGenerated?: boolean;
  deliveryNotes?: string;
  photoProof?: string;
  signature?: string;
}

export interface DeliveryTrackingEvent {
  id: string;
  title: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
}

export interface DeliveryTracking {
  dispatchId: string;
  dispatchNo: string;
  currentLocation: string;
  origin: string;
  destination: string;
  eta: string;
  driver: string;
  vehicle: string;
  distanceRemaining: string;
  routeProgress: number;
  timeline: DeliveryTrackingEvent[];
}

export interface DeliveryConfirmation {
  dispatchId: string;
  dispatchNo: string;
  orderNo: string;
  customerName: string;
  deliveryTimestamp: string;
  otp: string;
}

export interface DispatchRoute {
  id: string;
  name: string;
  via: string;
  estimatedMinutes: number;
}

export interface FleetStats {
  activeFleet: { current: number; total: number; changePercent: number };
  avgHubExit: { minutes: number; status: string };
  activeTransits: number;
  pendingLoadTons: number;
}

export interface CreateDispatchFormPayload {
  orderId: string;
  orderNo: string;
  customer: string;
  vehicle: string;
  driver: string;
  priority: "normal" | "high" | "urgent";
  route: string;
  dispatchTime: string;
  remarks?: string;
}

export interface InitiateDispatchPayload {
  orderId: string;
  vehicle: string;
  driver: string;
  deliverySlot: string;
}

export type AnalyticsDateRangePreset =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "custom";

export interface AnalyticsOverview {
  inventoryTurnover: string;
  fulfillmentRate: string;
  avgDeliveryTime: string;
  stockAccuracy: string;
  revenue: string;
}

export interface AnalyticsInventoryTrend {
  name: string;
  stockIn: number;
  consumption: number;
}

export interface AnalyticsConsumptionItem {
  name: string;
  percentage: number;
  color: string;
}

export interface AnalyticsRequisitionVolume {
  totalRequests: number;
  completed: number;
  monthly: { name: string; value: number }[];
}

export interface AnalyticsDeliveryPerformance {
  onTime: number;
  minorDelay: number;
  criticalDelay: number;
  avgLagHours: number;
}

export type LogisticsMovementStatus = "in_transit" | "pending" | "delivered";

export interface LogisticsMovementLog {
  id: string;
  shipmentId: string;
  material: string;
  destination: string;
  eta: string;
  status: LogisticsMovementStatus;
  actionType: "map" | "eye";
}

export interface AnalyticsHubOption {
  value: string;
  label: string;
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview;
  inventoryTrends: AnalyticsInventoryTrend[];
  consumption: AnalyticsConsumptionItem[];
  requisitionVolume: AnalyticsRequisitionVolume;
  deliveryPerformance: AnalyticsDeliveryPerformance;
  movementLogs: LogisticsMovementLog[];
  hubOptions: AnalyticsHubOption[];
  lastUpdated: string;
}
