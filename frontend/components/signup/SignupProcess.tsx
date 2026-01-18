import React, { useState } from "react";
import {
  RegistrationForm,
  type RegistrationFormData,
} from "./RegistrationForm";
import { VerificationScreen } from "./VerificationScreen";
import { AccountSetup } from "./AccountSetup";
import { Confirmation } from "./Confirmation";
import { UserRole, PlanName, User } from "../../types";
import { authService } from "../../services/apiService";
import { MpesaPaymentModal } from "../modals/MpesaPaymentModal";
import type { Payment } from "../../services/paymentService";

interface SignupProcessProps {
  onSignupSuccess: (token: string, user: User) => void;
  onGoToSignIn: () => void;
}

type SignupStep = "register" | "verify" | "setup" | "confirm";

export const SignupProcess: React.FC<SignupProcessProps> = ({
  onSignupSuccess,
  onGoToSignIn,
}) => {
  const [step, setStep] = useState<SignupStep>("register");
  const [registrationData, setRegistrationData] =
    useState<RegistrationFormData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store the temporary token received after verification
  const [tempAuthToken, setTempAuthToken] = useState<string | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone ? `${data.countryCode}${data.phone}` : undefined,
      });

      // Store full phone number with country code
      const fullPhone = data.phone ? `${data.countryCode}${data.phone}` : undefined;
      setRegistrationData({ ...data, phone: fullPhone });

      console.log('Registration response:', response.data);
      setStep("verify");
    } catch (err: any) {
      // Extract specific error message from backend response
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (otp: string) => {
    if (!registrationData?.email && !registrationData?.phone) return;
    setIsLoading(true);
    setError(null);
    try {
      // Prefer phone verification if available
      const verificationData: any = {
        otp,
      };

      if (registrationData.phone) {
        verificationData.phone = registrationData.phone;
      } else {
        verificationData.email = registrationData.email;
      }

      const response = await authService.verify(verificationData);
      const token = response.data.token;
      setTempAuthToken(token);
      // Store token temporarily in localStorage so payment requests can be authenticated
      localStorage.setItem('token', token);
      setStep("setup");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Verification failed. Please check the code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSetup = (role: UserRole, plan: PlanName) => {
    setSelectedRole(role);
    setSelectedPlan(plan);
    setStep("confirm");
  };

  const handlePayment = async () => {
    if (!selectedRole || !selectedPlan || !tempAuthToken) return;

    // Free and None plans skip payment and finalize immediately
    if (selectedPlan === PlanName.Free || selectedPlan === PlanName.None) {
      try {
        setIsLoading(true);
        const response = await authService.setupAccount(
          { role: selectedRole, plan: selectedPlan },
          tempAuthToken
        );
        onSignupSuccess(tempAuthToken, response.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to set up account. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Store temp token in localStorage so payment API can access it
    localStorage.setItem('token', tempAuthToken);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (payment: Payment) => {
    // After successful payment, complete account setup
    if (selectedRole && selectedPlan && tempAuthToken) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.setupAccount(
          { role: selectedRole, plan: selectedPlan },
          tempAuthToken
        );
        setIsPaymentModalOpen(false);
        onSignupSuccess(tempAuthToken, response.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to set up account. Please try again.");
        setIsPaymentModalOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentFailed = () => {
    console.log('Payment failed or cancelled');
    setIsPaymentModalOpen(false);
    setError('Payment was not completed. Please try again.');
  };

  const renderContent = () => {
    switch (step) {
      case "register":
        return (
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            isLoading={isLoading}
            error={error}
          />
        );
      case "verify":
        return (
          <VerificationScreen
            email={registrationData?.email || ""}
            phone={registrationData?.phone || ""}
            onVerify={handleVerification}
            isLoading={isLoading}
            error={error}
          />
        );
      case "setup":
        return <AccountSetup onSetupComplete={handleAccountSetup} />;
      case "confirm":
        if (!selectedRole || !selectedPlan) {
          setStep("setup");
          return null;
        }
        return <Confirmation role={selectedRole} plan={selectedPlan} />;
      default:
        return null;
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case "register":
        return 1;
      case "verify":
        return 2;
      case "setup":
        return 3;
      case "confirm":
        return 4;
      default:
        return 1;
    }
  };

  const showNavigation = step === "confirm";

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center pt-32">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight">
            Become a MyGF AI Partner
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Join our platform to connect with clients and grow your business.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-10">
          {renderContent()}

          {showNavigation && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <button
                  onClick={() => setStep("setup")}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 px-4 rounded-lg"
                >
                  Back
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Step {getStepNumber()} of 4
                </span>
                {step === "confirm" && (
                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center min-w-[180px]"
                  >
                    {isLoading ? "Processing..." : "Continue to Payment"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Already have an account?{" "}
          <button
            onClick={onGoToSignIn}
            className="font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* M-Pesa Payment Modal */}
      {isPaymentModalOpen && selectedPlan && (
        <MpesaPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          onFailed={handlePaymentFailed}
          amount={getPlanAmount(selectedPlan)}
          description={`${selectedPlan} Subscription - First Month`}
          paymentType="subscription"
          plan={selectedPlan}
          metadata={{
            role: selectedRole,
            plan: selectedPlan,
            action: 'signup_subscription'
          }}
        />
      )}
    </div>
  );
};

// Helper function to get plan amount
const getPlanAmount = (plan: PlanName): number => {
  switch (plan) {
    case PlanName.Free:
      return 0;
    case PlanName.Basic:
      return 1000;
    case PlanName.MyGF1_3:
      return 2500;
    case PlanName.MyGF3_2:
      return 5000;
    case PlanName.None:
      return 0;
    default:
      return 0;
  }
};
