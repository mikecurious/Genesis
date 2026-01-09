
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Listing {
  id: string;
  title: string; // Changed from name
  description: string;
  location: string;
  price: number; // Changed from string to number (migration completed)
  currency: 'KSh' | 'USD' | 'EUR' | 'GBP'; // Currency code for the listing
  priceType: 'sale' | 'rental'; // NEW: Distinguish sale vs rental
  documentsUploaded?: boolean;
  documentsUploadedAt?: string;
  attachedSurveyor?: {
    surveyor?: User;
    surveyType?: 'inspection' | 'valuation' | 'compliance' | 'general';
    attachedAt?: string;
    status?: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    scheduledDate?: string;
    completedDate?: string;
    report?: {
      url?: string;
      uploadedAt?: string;
    };
    notes?: string;
  };
  agentName?: string; // Optional, will be populated from createdBy
  agentContact?: string; // Optional
  imageUrls: string[];
  images: string[]; // Added for HeroIntro compatibility
  tags?: string[];
  createdBy?: any; // To hold user object from backend
  isPromoted?: boolean;
  investment?: {
    roi: number;
    capRate: number;
    score: number;
    badge?: string;
  };
}

export interface ListingDocuments {
  titleDeed?: File | null;
  saleAgreement?: File | null;
  kraPin?: File | null;
  ownershipDocs?: File[];
  valuationReport?: File | null;
}

export type NewListingInput = Omit<
  Listing,
  "id" | "agentName" | "agentContact" | "createdBy" | "imageUrls"
> & {
  images: File[];
  documents?: ListingDocuments;
  hasRequiredDocuments?: boolean;
};

export interface MessageMetadata {
  dealClosure?: boolean;
  dealType?: 'purchase' | 'rental' | 'viewing';
  confidence?: number;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  properties?: Listing[];
  surveyors?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    surveyorProfile?: {
      profileImage?: string;
      bio?: string;
      specializations?: string[];
      services?: Array<{
        name: string;
        description: string;
        price: number;
        currency: string;
      }>;
      yearsOfExperience?: number;
      location?: string;
      rating?: number;
      completedSurveys?: number;
      availability?: string;
    };
  }>;
  senderName?: string; // To specify if the sender is a specific agent
  isSystemMessage?: boolean; // For messages like "Agent has joined"
  groundingMetadata?: any; // For Google Search/Maps grounding results
  metadata?: MessageMetadata; // For deal closure detection
}

// New type for storing conversations
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// New types for Signup Process
// User-selectable roles (for signup) - Tenant accounts are created by Landlords/Agents
// These values match the backend User model role enum
export enum UserRole {
  Agent = 'Agent',
  Landlord = 'Landlord',
  PropertySeller = 'Property Seller',
  PropertyOwner = 'Property Owner',
  Tenant = 'Tenant',
  Surveyor = 'Surveyor',
  Admin = 'Admin',
}

// Role type that matches backend database values
export type UserRoleType = 'tenant' | 'agent' | 'seller' | 'landlord' | 'Agent' | 'Landlord' | 'Property Seller' | 'Property Owner' | 'Tenant' | 'Surveyor' | 'Admin';

export interface User {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  phone?: string;
  role: UserRoleType; // Updated to use UserRoleType
  whatsappNumber?: string;
  notificationPreferences?: {
    email?: boolean;
    whatsapp?: boolean;
    push?: boolean;
  };
  subscription?: {
    plan?: PlanName;
    status?: 'active' | 'inactive' | 'pending';
  };
  tenantManagementActive?: boolean;
  surveyorProfile?: {
    profileImage?: string;
    bio?: string;
    specializations?: string[];
    services?: {
      name: string;
      description: string;
      price: number;
    }[];
    yearsOfExperience?: number;
    certifications?: string[];
    availability?: 'Available' | 'Busy' | 'Unavailable';
    rating?: number;
    completedSurveys?: number;
    location?: string;
  };
  agentProfile?: {
    profileImage?: string;
    bio?: string;
    specializations?: string[];
    yearsOfExperience?: number;
    serviceAreas?: string[];
    languages?: string[];
    certifications?: string[];
    achievements?: string[];
    rating?: number;
    totalDeals?: number;
    companyCertification?: string;
  };
}

// For users signing in with Google to search
export interface ChatUser {
  name: string;
  email: string;
  googleId: string;
}

export enum PlanName {
  Basic = 'Basic',
  MyGF1_3 = 'MyGF 1.3',
  MyGF3_2 = 'MyGF 3.2',
  None = 'None',
}

export interface SubscriptionPlan {
  name: PlanName;
  price: string;
  features: string[];
}

// New type for Tenant Management
export interface Tenant {
  id: string;
  propertyId?: string; // Link to the property
  name: string;
  unit: string; // e.g., "Apt 3B, Modern 2-Bedroom"
  email: string;
  phone: string;
  whatsappNumber?: string;
  rentAmount: number;
  rentStatus: 'Paid' | 'Due' | 'Overdue';
  leaseStart?: string;
  leaseEnd?: string;
  deposit?: number;
  paymentDay?: number; // Day of the month rent is due
  userId?: string; // Link to the user account
}

// New type for Maintenance Requests
export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unit: string;
  description: string;
  category?: 'Plumbing' | 'Electrical' | 'Appliance' | 'General' | 'Other';
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Submitted' | 'In Progress' | 'Resolved';
  submittedDate: string;
  technicianId?: string;
  images?: string[];
  aiAnalysis?: {
    summary: string;
    suggestedAction: string;
    estimatedCost?: string;
  };
}

export interface Technician {
  id: string;
  name: string;
  specialty: 'Plumbing' | 'Electrical' | 'General' | 'HVAC' | 'Carpentry' | 'Painting' | 'Roofing' | 'Landscaping' | 'Cleaning' | 'Security' | 'Other';
  phone: string;
  rating: number;
  availability: 'Available' | 'Busy' | 'Inactive';
}

export interface ServiceProvider {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialty: 'Plumbing' | 'Electrical' | 'General' | 'HVAC' | 'Carpentry' | 'Painting' | 'Roofing' | 'Landscaping' | 'Cleaning' | 'Security' | 'Other';
  rating: number;
  availability: 'Available' | 'Busy' | 'Inactive';
  yearsOfExperience: number;
  certifications?: string[];
  serviceArea?: string;
  hourlyRate?: number;
  description?: string;
  companyName?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  completedJobs?: number;
  totalEarnings?: number;
  reviews?: Array<{
    user: string;
    rating: number;
    comment?: string;
    date: Date;
  }>;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FinancialStatement {
  id: string;
  month: string; // "November 2023"
  totalRentCollected: number;
  totalExpenses: number;
  netIncome: number;
  generatedDate: string;
  status: 'Draft' | 'Sent';
}

export interface AutomationRule {
  id: string;
  type: 'RentReminder' | 'MaintenanceUpdate' | 'LeaseRenewal';
  enabled: boolean;
  daysBefore?: number; // For reminders
  messageTemplate: string;
}

// New type for Lead Management
export interface Lead {
  id: string;
  property: Listing | string; // Can be populated or just ID
  client: {
    name: string;
    address: string;
    contact: string;
    email: string;
    whatsappNumber: string;
  };
  dealType: 'purchase' | 'rental' | 'viewing';
  status: 'new' | 'contacted' | 'in-progress' | 'closed' | 'lost';
  conversationHistory: Message[];
  createdBy: string; // User ID
  notes?: string;
  createdAt: string;
  closedAt?: string;
}

// Verification Center Types
export interface DocumentVerification {
  id: string;
  userId: string;
  propertyId?: string | null;
  documentType: 'title_deed' | 'sale_agreement' | 'id_document' | 'other';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'verified' | 'potential_issue' | 'failed';
  extractedData?: {
    ownerName?: string;
    lrNumber?: string;
    size?: string;
    location?: string;
  };
  aiAnalysis?: {
    structureValid: boolean;
    confidence: number;
    issues?: string[];
    recommendations?: string[];
  };
  createdAt: string;
  verifiedAt?: string;
}

export interface LandSearchRequest {
  id: string;
  userId: string;
  parcelNumber: string;
  location: string;
  documentUrl?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  results?: {
    ownershipHistory?: string[];
    encumbrances?: string[];
    boundaries?: string;
    additionalInfo?: string;
  };
  createdAt: string;
  completedAt?: string;
  notificationSent: boolean;
}

export interface ValuationRequest {
  id: string;
  userId: string;
  propertyId?: string;
  propertyDetails?: {
    location: string;
    size: string;
    type: string;
  };
  documentUrls: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedValue?: {
    amount: number;
    currency: string;
    confidence: number;
    comparables?: any[];
  };
  valuationReport?: string;
  createdAt: string;
  completedAt?: string;
}

// Surveyor Dashboard Types
export interface SurveyTask {
  id: string;
  propertyId: string;
  property?: Listing; // Populated property details
  requestedBy: string; // User ID
  requester?: User; // Populated requester details
  assignedTo?: string; // Surveyor ID
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  completedDate?: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyReport {
  id: string;
  taskId: string;
  surveyorId: string;
  reportFiles: string[]; // URLs to PDF reports
  images: string[]; // URLs to images
  gpsCoordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  findings: string;
  recommendations?: string;
  aiValidation?: {
    isValid: boolean;
    confidence: number;
    issues?: string[];
  };
  uploadedAt: string;
}
