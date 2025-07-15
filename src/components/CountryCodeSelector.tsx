import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface CountryCodeSelectorProps {
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  disabled?: boolean;
}

export function CountryCodeSelector({ phoneNumber, onPhoneNumberChange, disabled }: CountryCodeSelectorProps) {
  const { language } = useLanguage();
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    // Parse existing phone number to extract country code
    if (phoneNumber && phoneNumber.startsWith('+')) {
      const parts = phoneNumber.split(' ');
      if (parts.length >= 2) {
        const countryCode = parts[0].substring(1); // Remove the '+'
        const phone = parts.slice(1).join(' ');
        const country = countries.find(c => c.phone_code === countryCode);
        if (country) {
          setSelectedCountry(country);
          setPhoneInput(phone);
        }
      }
    }
  }, [phoneNumber, countries]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('country_name_en');

      if (error) throw error;
      setCountries(data || []);
      
      // Set default to Saudi Arabia if available
      const saudiArabia = data?.find(c => c.country_code === 'SA');
      if (saudiArabia && !selectedCountry) {
        setSelectedCountry(saudiArabia);
      }
    } catch (error: any) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    setSelectedCountry(country);
    updatePhoneNumber(country, phoneInput);
  };

  const handlePhoneInputChange = (value: string) => {
    // Remove any non-numeric characters except spaces and dashes
    const cleanedValue = value.replace(/[^\d\s-]/g, '');
    setPhoneInput(cleanedValue);
    updatePhoneNumber(selectedCountry, cleanedValue);
  };

  const updatePhoneNumber = (country: any, phone: string) => {
    if (country && phone) {
      const fullNumber = `+${country.phone_code} ${phone}`;
      onPhoneNumberChange(fullNumber);
    } else if (country) {
      onPhoneNumberChange(`+${country.phone_code} `);
    } else {
      onPhoneNumberChange(phone);
    }
  };

  return (
    <div className="flex gap-2">
      <Select 
        value={selectedCountry?.id || ''} 
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Country">
            {selectedCountry && (
              <div className="flex items-center gap-2">
                <span>{selectedCountry.flag_emoji}</span>
                <span>+{selectedCountry.phone_code}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              <div className="flex items-center gap-2">
                <span>{country.flag_emoji}</span>
                <span>+{country.phone_code}</span>
                <span>
                  {language === 'ar' && country.country_name_ar 
                    ? country.country_name_ar 
                    : country.country_name_en}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        placeholder="555 123 4567"
        value={phoneInput}
        onChange={(e) => handlePhoneInputChange(e.target.value)}
        className="flex-1"
        disabled={disabled}
      />
    </div>
  );
}