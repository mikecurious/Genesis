
import React, { useState } from 'react';
import { type Tenant } from '../../../types';
import { MpesaPaymentModal } from '../../modals/MpesaPaymentModal';

interface TenantPaymentsProps {
    tenant: Tenant;
}

const paymentHistory = [
    { date: 'Aug 1, 2024', amount: '55,000 KSh', status: 'Paid' },
    { date: 'Jul 1, 2024', amount: '55,000 KSh', status: 'Paid' },
    { date: 'Jun 1, 2024', amount: '55,000 KSh', status: 'Paid' },
];

const statusColorMap = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const TenantPayments: React.FC<TenantPaymentsProps> = ({ tenant }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handlePaymentSuccess = () => {
        console.log('Rent payment successful!');
        // TODO: Update rent status via API
        setIsPaymentModalOpen(false);
    };

    const handlePaymentFailed = () => {
        console.log('Rent payment failed or cancelled');
        setIsPaymentModalOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Rent Status</h2>
                    <p className="text-sm text-gray-500">Your current rent payment status.</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusColorMap[tenant.rentStatus]}`}>{tenant.rentStatus}</span>
            </div>
            
            {(tenant.rentStatus === 'Due' || tenant.rentStatus === 'Overdue') && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6 flex justify-between items-center">
                    <p className="text-blue-800 dark:text-blue-200">Your next payment is due. Please pay to avoid late fees.</p>
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Pay Now
                    </button>
                </div>
            )}

            <h3 className="text-lg font-semibold mb-2">Payment History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                     <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentHistory.map((payment, index) => (
                             <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">{payment.date}</td>
                                <td className="px-6 py-4 font-medium">{payment.amount}</td>
                                <td className="px-6 py-4">
                                     <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorMap[payment.status as keyof typeof statusColorMap]}`}>{payment.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <MpesaPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={handlePaymentSuccess}
                onFailed={handlePaymentFailed}
                amount={55000}
                description="Rent Payment"
                paymentType="tenant_payment"
                metadata={{
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    propertyId: tenant.propertyId
                }}
            />
        </div>
    );
};
