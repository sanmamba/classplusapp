import React from 'react';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import { TESTS } from '../constants';
import { Button } from './ui/Button';

interface TopBarProps {
  currentTestId: string;
  onTestSelect: (id: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentTestId, onTestSelect, isDarkMode, toggleTheme }) => {
  const currentTest = TESTS.find(t => t.id === currentTestId);

  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        </div>
        <span className="font-bold text-lg hidden sm:block tracking-tight">TestAnalytics</span>
      </div>

      <div className="flex-1 max-w-xl mx-4 relative group">
        <div className="relative">
          <select 
            value={currentTestId}
            onChange={(e) => onTestSelect(e.target.value)}
            className="w-full appearance-none bg-secondary/50 hover:bg-secondary/80 transition-colors border-0 rounded-md py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer font-medium text-foreground truncate"
          >
            {TESTS.map(test => (
              <option key={test.id} value={test.id} className="bg-popover text-popover-foreground">
                {test.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
         </Button>
      </div>
    </div>
  );
};