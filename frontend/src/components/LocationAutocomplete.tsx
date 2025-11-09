import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your location...',
  className = '',
  required = false,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);

    try {
      // Use Nominatim API (OpenStreetMap) - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5`,
        {
          headers: {
            'User-Agent': 'HowMuchShouldIPrice/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Location autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500); // Wait 500ms after user stops typing
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const locationName = formatLocationName(suggestion);
    onChange(locationName, {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
    setShowDropdown(false);
    setSuggestions([]);
  };

  // Format location name for display
  const formatLocationName = (suggestion: LocationSuggestion): string => {
    const parts: string[] = [];
    
    if (suggestion.address.city) {
      parts.push(suggestion.address.city);
    }
    if (suggestion.address.state) {
      parts.push(suggestion.address.state);
    }
    if (suggestion.address.country) {
      parts.push(suggestion.address.country);
    }

    return parts.length > 0 ? parts.join(', ') : suggestion.display_name;
  };

  // Get location type icon
  const getLocationIcon = (type: string): string => {
    const typeMap: Record<string, string> = {
      city: '🏙️',
      town: '🏘️',
      village: '🏡',
      country: '🌍',
      state: '📍',
      administrative: '📍',
    };
    return typeMap[type] || '📍';
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-10 pr-10 py-3 border-2 border-beige-200 rounded-lg focus:border-olive-500 focus:outline-none transition ${className}`}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-600 animate-spin" />
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-beige-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-olive-50 transition flex items-start gap-3 border-b border-beige-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-olive-50' : ''
              }`}
            >
              {/* Icon */}
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {getLocationIcon(suggestion.type)}
              </span>

              {/* Location Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {formatLocationName(suggestion)}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {suggestion.display_name}
                </p>
              </div>

              {/* Type Badge */}
              <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-beige-100 text-slate-600 rounded">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-beige-200 rounded-lg shadow-lg p-4 text-center text-slate-500">
          No locations found. Try a different search term.
        </div>
      )}

      {/* Helper Text */}
      {!showDropdown && value.length > 0 && value.length < 3 && (
        <p className="mt-1 text-xs text-slate-500">
          Type at least 3 characters to search...
        </p>
      )}
    </div>
  );
}

