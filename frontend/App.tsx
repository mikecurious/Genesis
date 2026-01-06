import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { Toaster } from 'react-hot-toast';
import { notificationService } from "./services/notificationService";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { HeroIntro } from "./components/HeroIntro";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SignupProcess } from "./components/signup/SignupProcess";
import { AgentSignIn } from "./components/signin/AgentSignIn";
import { PaymentPending } from "./components/signin/PaymentPending";
import { Features } from "./components/Features";
import { AgentDashboard } from "./components/dashboard/agent/AgentDashboard";
import { OwnerDashboard } from "./components/dashboard/owner/OwnerDashboard";
import { CombinedDashboard } from "./components/dashboard/combined/CombinedDashboard";
import { TenantDashboard } from "./components/dashboard/tenant/TenantDashboard";
import { SurveyorDashboard } from "./components/surveyor/SurveyorDashboard";
import { AdminDashboard } from "./components/dashboard/admin/AdminDashboard";
import { ImageViewer } from "./components/ImageViewer";
import { GoogleSignInModal } from "./components/GoogleSignInModal";
import { InteractionPage } from "./components/interaction/InteractionPage";
import { PropertyExplorerPage } from "./components/PropertyExplorerPage";
import { PropertyAgentPage } from "./components/PropertyAgentPage";
import { AIPropertySearch } from "./components/AIPropertySearch";
import { FeaturePaymentModal } from "./components/modals/FeaturePaymentModal";
import { AddTenantModal } from "./components/modals/AddTenantModal";
import { LiveAudioHandler } from "./components/LiveAudioHandler";
import { ForgotPassword } from "./components/signin/ForgotPassword";
import { ResetPassword } from "./components/signin/ResetPassword";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  type Message,
  Role,
  type Listing,
  type User,
  UserRole,
  PlanName,
  type ChatUser,
  type Conversation,
  type Tenant,
  type MaintenanceRequest,
} from "./types";
import {
  generatePropertyResponse,
  generateGroundedResponseStream,
  generateChatTitle,
  generateInitialPitch,
  generateInteractionResponse,
} from "./services/geminiService";
import {
  authService,
  userService,
  propertyService,
  maintenanceService,
} from "./services/apiService";

type View =
  | "chat"
  | "signup"
  | "features"
  | "dashboard"
  | "interaction"
  | "propertyExplorer"
  | "propertyAgent"
  | "aiPropertySearch"
  | "signIn"
  | "forgotPassword"
  | "resetPassword";
type Theme = "light" | "dark";

const App: React.FC = () => {
  const applyThemeClass = (mode: "light" | "dark") => {
    const root = document.documentElement;
    const body = document.body;
    if (mode === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  };

  const normalizeUserRole = (role: User["role"]): UserRole => {
    if (!role) return UserRole.Agent;
    const key = role.toString().trim().toLowerCase();
    const roleMap: Record<string, UserRole> = {
      agent: UserRole.Agent,
      landlord: UserRole.Landlord,
      "property seller": UserRole.PropertySeller,
      seller: UserRole.PropertySeller,
      "property owner": UserRole.PropertyOwner,
      owner: UserRole.PropertyOwner,
      tenant: UserRole.Tenant,
      surveyor: UserRole.Surveyor,
      admin: UserRole.Admin,
    };
    return roleMap[key] || (role as UserRole);
  };

  const normalizeUser = (user: User): User => ({
    ...user,
    role: normalizeUserRole(user.role),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHasStarted, setChatHasStarted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>("chat");

  // Refactored auth state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Generic login flag
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // State for Google Sign-In user
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);

  // State for listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

  // State for Maintenance
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);

  // State for Image Viewer
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  // State for Conversation History
  const [conversations, setConversations] = useState<
    Record<string, Conversation>
  >({});
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  // State for password reset
  const [resetToken, setResetToken] = useState<string | null>(null);

  // State for dedicated Interaction Page
  const [interactionChats, setInteractionChats] = useState<
    Record<string, Message[]>
  >({});
  const [activeInteractionPropertyId, setActiveInteractionPropertyId] =
    useState<string | null>(null);
  const [humanTakeoverChats, setHumanTakeoverChats] = useState<
    Record<string, boolean>
  >({});
  const activeInteractionProperty =
    listings.find((l) => l.id === activeInteractionPropertyId) || null;
  const activeInteractionMessages =
    interactionChats[activeInteractionPropertyId] || [];

  // State for Property Explorer Page
  const [activeExplorerPropertyId, setActiveExplorerPropertyId] = useState<
    string | null
  >(null);
  const activeExplorerProperty =
    listings.find((l) => l.id === activeExplorerPropertyId) || null;

  // State for Property Agent Page
  const [activeAgentPropertyId, setActiveAgentPropertyId] = useState<
    string | null
  >(null);
  const activeAgentProperty =
    listings.find((l) => l.id === activeAgentPropertyId) || null;

  // State for premium feature payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // State for Live Audio
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      // Apply the theme immediately on initialization
      if (savedTheme) applyThemeClass(savedTheme);
      return savedTheme;
    }
    applyThemeClass("light");
    return "light";
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchAndSetProperties = async () => {
    try {
      const response = await propertyService.getProperties();
      const properties = response.data.data || []; // Backend returns { success, count, data }
      const mappedProperties = properties.map((p: any) => ({
        ...p,
        id: p._id,
        title: p.title, // Ensure mapping from backend schema
        price: p.price,
        agentName: p.createdBy?.name || "Unknown Agent",
        agentContact: p.createdBy?.email || "N/A",
      }));
      setListings(mappedProperties);
    } catch (e) {
      console.error("Failed to fetch properties", e);
      setListings([]); // Set empty array on error to prevent crashes
    }
  };

  const fetchAndSetTenantData = async () => {
    try {
      const response = await userService.getTenants();
      const tenantUsers = response.data.data || response.data || [];

      // Ensure tenantUsers is an array before mapping
      if (Array.isArray(tenantUsers)) {
        const mappedTenants = tenantUsers.map(
          (user: any): Tenant => ({
            id: user._id,
            userId: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            unit: user.unit,
            rentStatus: user.rentStatus,
            rentAmount: user.rentAmount || 0,
          })
        );
        setTenants(mappedTenants);
      } else {
        setTenants([]); // Set empty array if not an array
      }
    } catch (error: any) {
      // Silently handle 403 errors (user doesn't have permission)
      if (error?.response?.status !== 403) {
        console.error("Failed to fetch tenants:", error);
      }
      setTenants([]); // Set empty array on error
    }
  };

  // Check for existing token on app load
  useEffect(() => {
    let isMounted = true; // Track mounted state

    const checkLoggedInStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data: user } = await authService.getMe();
          if (!isMounted) return; // Don't update state if unmounted

          setCurrentUser(normalizeUser(user));
          setIsUserLoggedIn(true);

          // Fetch data based on user role
          if (
            [
              UserRole.PropertyOwner,
              UserRole.Landlord,
              UserRole.Agent,
            ].includes(user.role)
          ) {
            await fetchAndSetTenantData();
          }

          const response = await maintenanceService.getRequests();
          if (!isMounted) return; // Don't update state if unmounted

          // Extract the data array from the response
          const requests = response.data?.data || [];

          setMaintenanceRequests(
            requests.map((r: any) => ({
              id: r._id,
              tenantId: r.tenant._id,
              tenantName: r.tenant.name,
              unit: "N/A", // Unit info is now on user object, would need to cross-reference
              description: r.description,
              status: r.status,
              submittedDate: new Date(r.submittedDate).toLocaleDateString(),
            }))
          );
        } catch (error) {
          console.error("Session validation or data fetching failed:", error);
          if (isMounted) {
            localStorage.removeItem("token");
          }
        }
      }
      // Fetch properties for both guests and logged-in users
      if (isMounted) {
        fetchAndSetProperties();
      }
    };
    checkLoggedInStatus();

    return () => {
      isMounted = false; // Cleanup: mark as unmounted
    };
  }, []);

  // Check for reset token in URL parameters on app load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      setResetToken(token);
      handleSetView('resetPassword');
      // Clean up URL bar (remove token from query params)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (currentView === "chat" && chatContainerRef.current) {
      // Add a small delay to ensure DOM is updated, then smooth scroll
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages, currentView, isLoading]);

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    try {
      const savedConvos = localStorage.getItem("conversations");
      if (savedConvos) setConversations(JSON.parse(savedConvos));
    } catch (error) {
      console.error("Failed to load conversations", error);
    }
  }, []);

  // Debounced localStorage save to prevent excessive writes
  const debouncedSaveConversations = useMemo(
    () => debounce((conversationsToSave: Record<string, Conversation>) => {
      if (Object.keys(conversationsToSave).length > 0) {
        localStorage.setItem("conversations", JSON.stringify(conversationsToSave));
      }
    }, 1000), // Save after 1 second of inactivity
    []
  );

  useEffect(() => {
    debouncedSaveConversations(conversations);

    // Cleanup: flush any pending saves on unmount
    return () => {
      debouncedSaveConversations.flush();
    };
  }, [conversations, debouncedSaveConversations]);

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setChatHasStarted(false);
    handleSetView("chat");
  };

  const handleSelectConversation = (id: string) => {
    if (conversations[id]) {
      setCurrentConversationId(id);
      setMessages(conversations[id].messages);
      setChatHasStarted(true);
      handleSetView("chat");
    }
  };

  const handleSendMessage = useCallback(
    async (inputText: string) => {
      if (!inputText.trim() || isLoading) return;
      if (!chatHasStarted) setChatHasStarted(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.USER,
        text: inputText,
      };

      // Manage conversation history
      let conversationId = currentConversationId;
      if (!conversationId) {
        const newId = Date.now().toString();
        conversationId = newId;
        setCurrentConversationId(newId);
        setMessages([userMessage]); // Start new message list
        const newConversation: Conversation = {
          id: newId,
          title: "New Chat",
          messages: [userMessage],
        };
        setConversations((prev) => ({ ...prev, [newId]: newConversation }));

        generateChatTitle(inputText).then((title) => {
          setConversations((prev) => ({
            ...prev,
            [newId]: { ...prev[newId], title: title },
          }));
        });
      } else {
        setMessages((prev) => [...prev, userMessage]);
        setConversations((prev) => ({
          ...prev,
          [conversationId!]: {
            ...prev[conversationId!],
            messages: [...prev[conversationId!].messages, userMessage],
          },
        }));
      }

      setIsLoading(true);

      const propertyKeywords = [
        "bedroom",
        "ksh",
        "rent",
        "buy",
        "listing",
        "property",
        "properties",
        "apartment",
        "house",
        "unit",
        "nairobi",
        "westlands",
        "kilimani",
        "karen",
        "lavington",
        "kileleshwa",
        "mombasa",
        "find",
        "show",
        "search",
        "looking for",
        "available",
      ];
      const isPropertyQuery = propertyKeywords.some((kw) =>
        inputText.toLowerCase().includes(kw)
      );

      try {
        if (isPropertyQuery) {
          // Path A: Structured property search (not streamed)
          const aiMessage = await generatePropertyResponse(inputText, messages, listings);
          setMessages((prev) => [...prev, aiMessage]);
          setConversations((prev) => ({
            ...prev,
            [conversationId!]: {
              ...prev[conversationId!],
              messages: [...prev[conversationId!].messages, aiMessage],
            },
          }));
        } else {
          // Path B: Grounded, streaming search
          const modelMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: Role.MODEL,
            text: "",
          };
          setMessages((prev) => [...prev, modelMessage]);

          const stream = generateGroundedResponseStream(inputText);
          let finalResponse = null;
          for await (const chunk of stream) {
            modelMessage.text += chunk.text;
            setMessages((prev) => [...prev.slice(0, -1), { ...modelMessage }]);
            finalResponse = chunk; // Keep the last chunk which has the full response object
          }
          if (finalResponse) {
            modelMessage.groundingMetadata =
              finalResponse.candidates?.[0]?.groundingMetadata;
            setMessages((prev) => [...prev.slice(0, -1), { ...modelMessage }]);
          }
          setConversations((prev) => ({
            ...prev,
            [conversationId!]: {
              ...prev[conversationId!],
              messages: [...prev[conversationId!].messages, modelMessage],
            },
          }));
        }

        // Temporarily disabled Google OAuth modal
        // if (messages.length <= 1 && !isUserLoggedIn && !chatUser) {
        //   setIsSignInModalVisible(true);
        // }
      } catch (error) {
        console.error("Error getting response from Gemini:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          text: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setConversations((prev) => ({
          ...prev,
          [conversationId!]: {
            ...prev[conversationId!],
            messages: [...prev[conversationId!].messages, errorMessage],
          },
        }));
      } finally {
        setIsLoading(false);
        // Trigger modal for new users after their first message - Temporarily disabled
        // if (messages.length === 0 && !isUserLoggedIn && !chatUser) {
        //   setIsSignInModalVisible(true);
        // }
      }
    },
    [
      isLoading,
      chatHasStarted,
      listings,
      messages.length,
      isUserLoggedIn,
      chatUser,
      currentConversationId,
      // Removed 'conversations' from dependencies since we use functional updates (prev => ...)
      // This prevents unnecessary callback recreations and stale closure issues
    ]
  );

  const handleConnect = useCallback(
    async (property: Listing) => {
      setActiveAgentPropertyId(property.id);
      setCurrentView("propertyAgent");
    },
    []
  );

  const handleExploreProperty = useCallback((property: Listing) => {
    setActiveExplorerPropertyId(property.id);
    setCurrentView("propertyExplorer");
  }, []);

  const handleSendInteractionMessage = useCallback(
    async (inputText: string) => {
      if (!inputText.trim() || isLoading || !activeInteractionProperty) return;
      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.USER,
        text: inputText,
      };
      const propertyId = activeInteractionProperty.id;
      setInteractionChats((prev) => ({
        ...prev,
        [propertyId]: [...(prev[propertyId] || []), userMessage],
      }));
      if (humanTakeoverChats[propertyId]) return;
      setIsLoading(true);
      try {
        const history = interactionChats[propertyId] || [];
        const aiMessage = await generateInteractionResponse(
          inputText,
          activeInteractionProperty,
          history
        );
        setInteractionChats((prev) => ({
          ...prev,
          [propertyId]: [...prev[propertyId], aiMessage],
        }));
      } catch (error) {
        console.error("Error in interaction response:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          text: "I apologize, I encountered an issue.",
        };
        setInteractionChats((prev) => ({
          ...prev,
          [propertyId]: [...prev[propertyId], errorMessage],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeInteractionProperty, interactionChats, humanTakeoverChats]
  );

  const handleTakeoverChat = (propertyId: string) => {
    if (!currentUser?.name) return;
    const systemMessage: Message = {
      id: `system_${Date.now()}`,
      role: Role.MODEL,
      text: `${currentUser.name} has joined the chat.`,
      isSystemMessage: true,
    };
    setInteractionChats((prev) => ({
      ...prev,
      [propertyId]: [...(prev[propertyId] || []), systemMessage],
    }));
    setHumanTakeoverChats((prev) => ({ ...prev, [propertyId]: true }));
  };

  const handleSendAgentMessage = async (
    propertyId: string,
    inputText: string
  ) => {
    if (!inputText.trim() || !currentUser?.name) return;
    const agentMessage: Message = {
      id: Date.now().toString(),
      role: Role.MODEL,
      text: inputText,
      senderName: currentUser.name,
    };
    setInteractionChats((prev) => ({
      ...prev,
      [propertyId]: [...(prev[propertyId] || []), agentMessage],
    }));
  };

  const handleGoogleSignIn = async (credential: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.googleSignIn(credential);
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem("token", token);
      setCurrentUser(user);
      setIsUserLoggedIn(true);

      // Set chat user for the chat interface
      const chatUser: ChatUser = {
        name: user.name,
        email: user.email,
        googleId: user.id,
      };
      setChatUser(chatUser);

      setIsSignInModalVisible(false);
      setIsLoading(false);

      // Show welcome message
      console.log('Google Sign-In successful:', user);
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      setAuthError(error.response?.data?.message || 'Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login({
        email,
        password: pass,
      });
      const { token, user } = response.data;
      const normalizedUser = normalizeUser(user);
      localStorage.setItem("token", token);
      setCurrentUser(normalizedUser);
      setIsUserLoggedIn(true);
      if (
        [UserRole.PropertyOwner, UserRole.Landlord, UserRole.Agent].includes(
          normalizedUser.role
        )
      ) {
        await fetchAndSetTenantData();
      }
      if (normalizedUser.subscription?.status === "inactive") {
        // Let view logic handle showing PaymentPending
      } else {
        handleSetView("dashboard");
      }
    } catch (error: any) {
      setAuthError(error.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleTenantSignIn = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login({
        email,
        password: pass,
      });
      const { token, user } = response.data;
      const normalizedUser = normalizeUser(user);
      if (normalizedUser.role !== UserRole.Tenant) {
        throw new Error("Access denied. This portal is for tenants only.");
      }
      localStorage.setItem("token", token);
      setCurrentUser(normalizedUser);
      setIsUserLoggedIn(true);
      handleSetView("dashboard");
    } catch (error: any) {
      setAuthError(error.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsUserLoggedIn(false);
    setTenants([]);
    setMaintenanceRequests([]);
    handleSetView("chat");
  };

  const handleSignupSuccess = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setCurrentUser(normalizeUser(user));
    setIsUserLoggedIn(true);
    // If plan requires payment, this logic would route to a payment page
    // For now, we assume success and go to dashboard
    handleSetView("dashboard");
  };

  const handleCompletePayment = () => {
    if (currentUser) {
      console.log(`Simulating payment completion for ${currentUser.email}`);
      // In real app, this would trigger API call and update user object
      const updatedUser = {
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          status: "active" as const,
        },
      };
      setCurrentUser(updatedUser);
      handleSetView("dashboard");
    }
  };

  const handleActivateTenantManagement = () => setIsPaymentModalOpen(true);

  const handleConfirmFeaturePayment = () => {
    if (currentUser) {
      console.log(`Activating Tenant AI Management for ${currentUser.email}`);
      setCurrentUser({ ...currentUser, tenantManagementActive: true });
    }
    setIsPaymentModalOpen(false);
  };

  const handleOpenImageViewer = useCallback(
    (images: string[], startIndex = 0) => {
      setViewerImages(images);
      setViewerStartIndex(startIndex);
      setIsViewerOpen(true);
    },
    []
  );

  const handleAddListing = async (
    newListingData: Omit<
      Listing,
      "id" | "agentName" | "agentContact" | "createdBy" | "imageUrls"
    > & { images: File[] }
  ) => {
    try {
      const { data: createdProperty } = await propertyService.createProperty(
        newListingData
      );
      const mappedProperty = {
        ...createdProperty,
        id: createdProperty._id,
        agentName: currentUser?.name || "MyGF AI",
        agentContact: currentUser?.email || "N/A",
      };
      setListings((prev) => [mappedProperty, ...prev]);
    } catch (error: any) {
      console.error("Failed to add listing:", error);
      let errorMessage = "Unknown error";

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network Error - Unable to reach server. Check if backend is running.";
      } else {
        // Something else happened
        errorMessage = error.message || "Request failed";
      }

      notificationService.error(`Error adding listing: ${errorMessage}`);
    }
  };

  const handleAddTenant = async (tenantData: {
    propertyId: string;
    name: string;
    unit: string;
    email: string;
    phone: string;
  }) => {
    try {
      const { data: newUser } = await userService.inviteTenant(tenantData);

      const newTenant: Tenant = {
        id: newUser.id,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        unit: newUser.unit,
        rentStatus: newUser.rentStatus,
        rentAmount: newUser.rentAmount || 0,
      };
      setTenants((prev) => [...prev, newTenant]);
      setIsAddTenantModalOpen(false);
      notificationService.success(
        `Tenant ${newTenant.name} invited successfully! Their default password is 'password123'.`
      );
    } catch (error: any) {
      console.error("Failed to add tenant:", error);
      notificationService.error(`Error adding tenant: ${error.message}`);
    }
  };

  const handleAddMaintenanceRequest = async (request: {
    description: string;
  }) => {
    if (!currentUser) return;
    try {
      const { data: newRequest } = await maintenanceService.createRequest(
        request
      );
      const tenantDetails = tenants.find((t) => t.userId === currentUser.id);
      const mappedRequest: MaintenanceRequest = {
        id: newRequest._id,
        tenantId: newRequest.tenant._id,
        tenantName: newRequest.tenant.name,
        unit: tenantDetails?.unit || "N/A",
        description: newRequest.description,
        status: newRequest.status,
        submittedDate: new Date(newRequest.submittedDate).toLocaleDateString(),
      };
      setMaintenanceRequests((prev) => [mappedRequest, ...prev]);
    } catch (error: any) {
      console.error("Failed to add maintenance request:", error);
      notificationService.error(`Error adding request: ${error.message}`);
    }
  };

  const handleEditListing = async (
    propertyId: string,
    updatedData: Partial<Omit<Listing, "id" | "imageUrls">>
  ) => {
    try {
      const { data: updatedProperty } = await propertyService.updateProperty(
        propertyId,
        updatedData
      );

      // Update local state
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === propertyId
            ? {
              ...listing,
              ...updatedProperty,
              id: updatedProperty._id || listing.id,
              agentName: updatedProperty.createdBy?.name || listing.agentName,
              agentContact:
                updatedProperty.createdBy?.email || listing.agentContact,
            }
            : listing
        )
      );

      notificationService.success("Property updated successfully!");
    } catch (error: any) {
      console.error("Failed to update listing:", error);
      notificationService.error(`Error updating listing: ${error.message}`);
    }
  };

  const handleDeleteListing = async (propertyId: string) => {
    try {
      await propertyService.deleteProperty(propertyId);

      // Update local state
      setListings((prev) =>
        prev.filter((listing) => listing.id !== propertyId)
      );

      notificationService.success("Property deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete listing:", error);
      notificationService.error(`Error deleting listing: ${error.message}`);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.forgotPassword(email);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset email.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.resetPassword(token, newPassword);
      const { token: newToken, user } = response.data;
      localStorage.setItem("token", newToken);
      setCurrentUser(normalizeUser(user));
      setIsUserLoggedIn(true);
      setTimeout(() => handleSetView("dashboard"), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetView = (view: View) => {
    // If user is logged in but payment is inactive, don't let them navigate away
    if (
      currentView === "signIn" &&
      currentUser?.subscription?.status === "inactive" &&
      view !== "signIn"
    ) {
      return;
    }
    setAuthError(null);
    setCurrentView(view);
    setIsSidebarOpen(false);
    if (view !== "interaction") setActiveInteractionPropertyId(null);
    if (view !== "propertyAgent") setActiveAgentPropertyId(null);
  };

  const renderView = () => {
    switch (currentView) {
      case "signup":
        return (
          <SignupProcess
            onSignupSuccess={handleSignupSuccess}
            onGoToSignIn={() => handleSetView("signIn")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPassword
            onBackToLogin={() => handleSetView("signIn")}
            onSubmit={handleForgotPassword}
          />
        );
      case "resetPassword":
        if (!resetToken) {
          handleSetView("signIn");
          return null;
        }
        return (
          <ResetPassword
            token={resetToken}
            onBackToLogin={() => {
              setResetToken(null);
              handleSetView("signIn");
            }}
            onSubmit={handleResetPassword}
          />
        );
      case "signIn":
        if (
          isUserLoggedIn &&
          currentUser?.subscription?.status === "inactive"
        ) {
          return (
            <PaymentPending
              user={currentUser}
              onCompletePayment={handleCompletePayment}
            />
          );
        }
        return (
          <AgentSignIn
            onSignIn={handleSignIn}
            onGoToSignup={() => handleSetView("signup")}
            onForgotPassword={() => handleSetView("forgotPassword")}
            isLoading={isLoading}
            error={authError}
          />
        );
      case "features":
        return <Features />;
      case "interaction":
        if (!activeInteractionProperty) {
          handleSetView("chat");
          return null;
        }
        return (
          <InteractionPage
            property={activeInteractionProperty}
            messages={activeInteractionMessages}
            isLoading={isLoading}
            onSendMessage={handleSendInteractionMessage}
            onBack={() => handleSetView("chat")}
            onOpenImageViewer={handleOpenImageViewer}
          />
        );
      case "propertyExplorer":
        if (!activeExplorerProperty) {
          handleSetView("chat");
          return null;
        }
        return (
          <PropertyExplorerPage
            property={activeExplorerProperty}
            onBack={() => handleSetView("chat")}
            messages={interactionChats[activeExplorerPropertyId] || []}
            onSendMessage={(propertyId, message) => {
              setInteractionChats((prev) => ({
                ...prev,
                [propertyId]: [...(prev[propertyId] || []), message],
              }));
            }}
          />
        );
      case "propertyAgent":
        if (!activeAgentProperty) {
          handleSetView("chat");
          return null;
        }
        return (
          <PropertyAgentPage
            property={activeAgentProperty}
            onBack={() => handleSetView("chat")}
            onChatWithAI={async () => {
              // Transition to interaction page with AI chat
              setActiveInteractionPropertyId(activeAgentProperty.id);
              setCurrentView("interaction");
              if (
                !interactionChats[activeAgentProperty.id] ||
                interactionChats[activeAgentProperty.id].length === 0
              ) {
                setIsLoading(true);
                try {
                  const initialPitch = await generateInitialPitch(activeAgentProperty);
                  setInteractionChats((prev) => ({
                    ...prev,
                    [activeAgentProperty.id]: [initialPitch],
                  }));
                } catch (error) {
                  console.error("Failed to generate initial pitch:", error);
                  setInteractionChats((prev) => ({
                    ...prev,
                    [activeAgentProperty.id]: [
                      {
                        id: "error_pitch",
                        role: Role.MODEL,
                        text: "Hello! I can answer any questions you have about this property.",
                      },
                    ],
                  }));
                } finally {
                  setIsLoading(false);
                }
              }
            }}
          />
        );
      case "aiPropertySearch":
        return <AIPropertySearch />;
      case "dashboard":
        if (!isUserLoggedIn || !currentUser) {
          handleSetView(
            currentUser?.role === UserRole.Tenant ? "tenantSignIn" : "signIn"
          );
          return null;
        }

        const dashboardProps = {
          listings,
          onAddListing: handleAddListing,
          onEditListing: handleEditListing,
          onDeleteListing: handleDeleteListing,
          interactionChats,
          humanTakeoverChats,
          onTakeoverChat: handleTakeoverChat,
          onSendAgentMessage: handleSendAgentMessage,
        };
        const landlordProps = {
          tenants,
          isTenantManagementActive: currentUser.tenantManagementActive ?? false,
          onActivateTenantManagement: handleActivateTenantManagement,
          onAddTenant: () => setIsAddTenantModalOpen(true),
          maintenanceRequests,
        };

        switch (currentUser.role) {
          case UserRole.Agent:
            return <AgentDashboard user={currentUser} {...dashboardProps} />;
          case UserRole.Landlord:
            return <AgentDashboard user={currentUser} {...dashboardProps} />; // Landlord uses same dashboard as Agent
          case UserRole.PropertySeller:
            return <AgentDashboard user={currentUser} {...dashboardProps} />; // PropertySeller uses same dashboard as Agent
          case UserRole.PropertyOwner:
            return (
              <OwnerDashboard
                user={currentUser}
                {...dashboardProps}
                {...landlordProps}
              />
            );
          case UserRole.Tenant:
            const tenantInfo = tenants.find((t) => t.userId === currentUser.id);
            return (
              <TenantDashboard
                user={currentUser}
                tenant={tenantInfo}
                maintenanceRequests={maintenanceRequests}
                onAddRequest={handleAddMaintenanceRequest}
              />
            );
          case UserRole.Surveyor:
            return (
              <SurveyorDashboard
                user={currentUser}
                onLogout={handleLogout}
              />
            );
          case UserRole.Admin:
            return (
              <AdminDashboard
                user={currentUser}
              />
            );
          default:
            handleSetView("chat");
            return null;
        }
      case "chat":
      default:
        return (
          <>
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-28"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div
                className={`mx-auto max-w-4xl w-full min-h-full flex flex-col transition-opacity duration-1000 ${chatHasStarted ? "opacity-100" : "opacity-0"
                  }`}
              >
                {/* Spacer to push messages to bottom when there's not enough content */}
                <div className="flex-grow" />
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onConnect={handleExploreProperty}
                    onOpenImageViewer={handleOpenImageViewer}
                  />
                ))}
                {isLoading &&
                  messages[messages.length - 1]?.role !== Role.MODEL && (
                    <ChatMessage
                      message={{ id: "loading", role: Role.MODEL, text: "..." }}
                      isLoading={true}
                    />
                  )}
              </div>
              <HeroIntro isVisible={!chatHasStarted} />
            </div>
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isBlocked={isSignInModalVisible}
              isListening={isLiveSessionActive}
              onToggleListening={() => setIsLiveSessionActive((prev) => !prev)}
            />
          </>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 text-gray-900 dark:text-white overflow-hidden">
        {/* Toast Notifications */}
        <Toaster />

      <div className="flex h-full">
        {/* Only show sidebar in chat view */}
        {currentView === "chat" && (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isUserLoggedIn={isUserLoggedIn}
            chatUser={chatUser}
            currentUser={currentUser}
            onHomeClick={() => handleSetView("chat")}
            onFeaturesClick={() => handleSetView("features")}
            onDashboardClick={() => handleSetView("dashboard")}
            onAISearchClick={() => handleSetView("aiPropertySearch")}
            onLogout={handleLogout}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
          />
        )}

        <main className="flex flex-col flex-1 h-full relative pt-16">
          <Navbar
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onGoToAgentPortal={() => handleSetView("signIn")}
            onFeaturesClick={() => handleSetView("features")}
            onLogoClick={handleNewChat}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            currentView={currentView}
            onLogout={handleLogout}
          />
          {renderView()}
        </main>
      </div>
      {isViewerOpen && (
        <ImageViewer
          images={viewerImages}
          startIndex={viewerStartIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
      {/* Temporarily disabled Google OAuth modal */}
      {/* {isSignInModalVisible && (
        <GoogleSignInModal
          onSignIn={handleGoogleSignIn}
          onSkip={() => setIsSignInModalVisible(false)}
        />
      )} */}
      {isPaymentModalOpen && (
        <FeaturePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmFeaturePayment}
          title="Activate Tenant AI Management"
          description="Unlock our powerful AI to manage tenant communications, send automated rent reminders, and handle maintenance updates, all in one place."
          price="8,000 KSh/month"
        />
      )}
      {isAddTenantModalOpen && (
        <AddTenantModal
          isOpen={isAddTenantModalOpen}
          onClose={() => setIsAddTenantModalOpen(false)}
          onAddTenant={handleAddTenant}
        />
      )}
      {isLiveSessionActive && (
        <LiveAudioHandler
          onTranscription={handleSendMessage}
          onError={(errorMsg) => {
            notificationService.error(`Voice Input Error: ${errorMsg}`);
            setIsLiveSessionActive(false);
          }}
        />
      )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
