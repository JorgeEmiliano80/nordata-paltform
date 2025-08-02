
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'pt', name: t('languages.pt'), flag: '🇧🇷', nativeName: 'Português' },
    { code: 'es', name: t('languages.es'), flag: '🇪🇸', nativeName: 'Español' },
    { code: 'en', name: t('languages.en'), flag: '🇺🇸', nativeName: 'English' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const getCurrentLanguage = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang || languages[0];
  };

  const currentLang = getCurrentLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[120px]">
          <span className="text-base">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
          <Globe className="h-4 w-4 sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span>{language.nativeName}</span>
            </div>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
