import React, { useState, useEffect } from 'react';
import { Listing } from '../../types';

interface MortgageCalculatorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    property: Listing;
}

interface BankOffer {
    name: string;
    logo: string;
    interestRate: number;
    monthlyPayment: number;
}

export const MortgageCalculatorPanel: React.FC<MortgageCalculatorPanelProps> = ({
    isOpen,
    onClose,
    property
}) => {
    const propertyPrice = property.price || 0; // Price is now a number

    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [loanTerm, setLoanTerm] = useState(20);
    const [interestRate, setInterestRate] = useState(12.5);

    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;

    useEffect(() => {
        calculateMortgage();
    }, [downPaymentPercent, loanTerm, interestRate, propertyPrice]);

    const calculateMortgage = () => {
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (monthlyRate === 0) {
            const payment = loanAmount / numberOfPayments;
            setMonthlyPayment(payment);
            setTotalAmount(loanAmount);
            setTotalInterest(0);
            return;
        }

        const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const total = payment * numberOfPayments;
        const interest = total - loanAmount;

        setMonthlyPayment(payment);
        setTotalAmount(total);
        setTotalInterest(interest);
    };

    const banks: BankOffer[] = [
        {
            name: 'Equity Bank',
            logo: '🏦',
            interestRate: 12.0,
            monthlyPayment: calculatePaymentForRate(12.0)
        },
        {
            name: 'KCB Bank',
            logo: '🏦',
            interestRate: 12.5,
            monthlyPayment: calculatePaymentForRate(12.5)
        },
        {
            name: 'Cooperative Bank',
            logo: '🏦',
            interestRate: 13.0,
            monthlyPayment: calculatePaymentForRate(13.0)
        }
    ];

    function calculatePaymentForRate(rate: number): number {
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (monthlyRate === 0) return loanAmount / numberOfPayments;

        return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const formatCurrency = (amount: number) => {
        return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                💰 Mortgage Calculator
                            </h3>
                            <p className="text-green-100 mt-1 text-sm">
                                {property.title}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Property Price */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Property Price
                        </label>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(propertyPrice)}
                        </div>
                    </div>

                    {/* Down Payment Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Down Payment
                            </label>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {downPaymentPercent}% = {formatCurrency(downPayment)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="50"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>10%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Loan Term Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Loan Term
                            </label>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {loanTerm} years
                            </span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5 years</span>
                            <span>30 years</span>
                        </div>
                    </div>

                    {/* Interest Rate Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Interest Rate
                            </label>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {interestRate.toFixed(1)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="8"
                            max="18"
                            step="0.5"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>8%</span>
                            <span>18%</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
                            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(monthlyPayment)}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                            <div className="text-center">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Interest</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(totalInterest)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Amount</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Comparison */}
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Compare Bank Offers
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {banks.map((bank) => (
                                <div
                                    key={bank.name}
                                    className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="text-3xl mb-2">{bank.logo}</div>
                                    <h5 className="font-bold text-gray-900 dark:text-white mb-1">
                                        {bank.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {bank.interestRate}% interest
                                    </p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">
                                        {formatCurrency(bank.monthlyPayment)}/mo
                                    </p>
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                        Apply Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                            Save Calculation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
