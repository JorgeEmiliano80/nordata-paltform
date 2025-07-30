
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  selectedCurrency: string;
  changeCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatAmount: (amount: number, currency?: string) => string;
  supportedCurrencies: Currency[];
  exchangeRates: ExchangeRates;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 1, // Base currency
    BRL: 5.2, // Real Brasileño
    ARS: 350, // Peso Argentino
  });
  const [loading, setLoading] = useState(false);

  const supportedCurrencies: Currency[] = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' }
  ];

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && supportedCurrencies.some(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    // Fetch exchange rates (simulated - in production this would be an API call)
    const fetchExchangeRates = async () => {
      setLoading(true);
      try {
        // Simulated API call - replace with real exchange rate API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock exchange rates - in production, use a real API like exchangerate-api.com
        const rates = {
          USD: 1,
          BRL: 5.2,
          ARS: 350,
        };
        
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        toast.error('Error al obtener las tasas de cambio');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    // Update rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  const changeCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency);
    toast.success(`Moneda cambiada a ${supportedCurrencies.find(c => c.code === currency)?.name}`);
  };

  const convertAmount = (amount: number, fromCurrency: string = 'USD'): number => {
    if (selectedCurrency === fromCurrency) return amount;
    
    // Convert from source currency to USD first, then to target currency
    const usdAmount = fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency];
    const convertedAmount = selectedCurrency === 'USD' ? usdAmount : usdAmount * exchangeRates[selectedCurrency];
    
    return convertedAmount;
  };

  const formatAmount = (amount: number, currency?: string): string => {
    const currencyCode = currency || selectedCurrency;
    const currencyInfo = supportedCurrencies.find(c => c.code === currencyCode);
    
    if (!currencyInfo) return amount.toString();
    
    const convertedAmount = currency ? amount : convertAmount(amount);
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'ARS' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'ARS' ? 0 : 2,
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        changeCurrency,
        convertAmount,
        formatAmount,
        supportedCurrencies,
        exchangeRates,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
