import React from 'react';
import { FinancialStatement } from '../../../types';

interface FinanceCenterProps {
    statements: FinancialStatement[];
    onGenerateStatement: () => void;
}

export const FinanceCenter: React.FC<FinanceCenterProps> = ({ statements, onGenerateStatement }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
                <button
                    onClick={onGenerateStatement}
                    className="w-full md:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue (YTD)</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$45,200</h4>
                    <span className="text-xs text-green-600 font-medium flex items-center mt-2">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        +12% vs last year
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding Rent</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$1,200</h4>
                    <span className="text-xs text-red-600 font-medium flex items-center mt-2">
                        3 Tenants Overdue
                    </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance Costs</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$3,450</h4>
                    <span className="text-xs text-gray-500 mt-2">
                        Avg $250/request
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Recent Statements</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Month</th>
                                <th className="px-6 py-3">Collected</th>
                                <th className="px-6 py-3">Expenses</th>
                                <th className="px-6 py-3">Net Income</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {statements.map((stmt) => (
                                <tr key={stmt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{stmt.month}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">+${stmt.totalRentCollected.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-600 font-medium">-${stmt.totalExpenses.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${stmt.netIncome.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stmt.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {stmt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 font-medium">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
