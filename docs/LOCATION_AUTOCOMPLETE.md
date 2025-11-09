# Location Autocomplete Feature

## 🌍 **Overview**

The location autocomplete feature provides real-time location suggestions as users type, making it easy to select accurate locations with proper formatting.

---

## ✨ **Features**

### **1. Real-Time Suggestions**
- ✅ Shows dropdown as user types (minimum 3 characters)
- ✅ Debounced search (500ms delay to avoid excessive API calls)
- ✅ Up to 5 relevant suggestions per search

### **2. Rich Location Data**
- ✅ City, State, Country information
- ✅ Location type badges (City, Town, Village, Country, etc.)
- ✅ Full address display
- ✅ Geographic coordinates (lat/lon) stored for future use

### **3. User-Friendly Interface**
- ✅ Icon-based visual indicators (🏙️ cities, 🏘️ towns, 🌍 countries)
- ✅ Loading spinner during search
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Click outside to close
- ✅ Hover highlighting
- ✅ Mobile responsive

### **4. Smart Formatting**
- ✅ Automatically formats as: "City, State, Country"
- ✅ Removes unnecessary details
- ✅ Clean, professional display

---

## 🔧 **Technical Implementation**

### **API Used:**
- **Nominatim API** (OpenStreetMap)
- **Free** - No API key required
- **Rate Limit:** 1 request per second (handled by debouncing)
- **Documentation:** https://nominatim.org/release-docs/latest/api/Search/

### **Component:**
```typescript
<LocationAutocomplete
  value={formData.location}
  onChange={(value, coordinates) => {
    setFormData({ 
      ...formData, 
      location: value,
      locationCoordinates: coordinates // Optional: for future use
    });
  }}
  placeholder="e.g., Mumbai, India or New York, USA"
  required={false}
/>
```

### **Props:**
- `value: string` - Current location value
- `onChange: (value: string, coordinates?: { lat: number; lon: number }) => void` - Callback when location selected
- `placeholder?: string` - Input placeholder text
- `className?: string` - Additional CSS classes
- `required?: boolean` - Whether field is required

---

## 📊 **User Flow**

### **1. User Starts Typing:**
```
User types: "Mum"
→ No suggestions yet (< 3 characters)
→ Shows: "Type at least 3 characters to search..."
```

### **2. User Types 3+ Characters:**
```
User types: "Mumb"
→ Shows loading spinner
→ API call to Nominatim (debounced 500ms)
→ Dropdown appears with suggestions:
   🏙️ Mumbai, Maharashtra, India
   🏘️ Mumbles, Wales, United Kingdom
   📍 Mumbai Suburban, Maharashtra, India
```

### **3. User Selects Location:**
```
User clicks: "Mumbai, Maharashtra, India"
→ Input filled with: "Mumbai, Maharashtra, India"
→ Coordinates stored: { lat: 19.0760, lon: 72.8777 }
→ Dropdown closes
```

### **4. Keyboard Navigation:**
```
User presses: ↓ Arrow Down
→ Highlights first suggestion

User presses: ↓ Arrow Down again
→ Highlights second suggestion

User presses: Enter
→ Selects highlighted suggestion

User presses: Escape
→ Closes dropdown
```

---

## 🎨 **UI/UX Details**

### **Input Field:**
- MapPin icon on the left
- Loading spinner on the right (when searching)
- Border highlights on focus (olive green)
- Placeholder text for guidance

### **Dropdown:**
- White background with shadow
- Max height: 320px (scrollable)
- Each suggestion shows:
  - Icon (emoji based on type)
  - Formatted name (bold)
  - Full address (gray, smaller)
  - Type badge (right side)
- Hover effect: Light olive background
- Selected effect: Olive background
- Smooth transitions

### **Helper Text:**
- Below input: "💡 Start typing your city or country name to see suggestions"
- Appears after selection to guide users

---

## 🔍 **Search Examples**

### **City Search:**
```
Input: "New York"
Results:
  🏙️ New York, New York, United States
  🏘️ New York Mills, Minnesota, United States
  📍 New York County, New York, United States
```

### **Country Search:**
```
Input: "India"
Results:
  🌍 India
  🏙️ Indianapolis, Indiana, United States
  📍 Indiana, United States
```

### **International:**
```
Input: "Tokyo"
Results:
  🏙️ Tokyo, Japan
  🏘️ Tokyo, North Dakota, United States
  📍 Tokyo Metropolis, Japan
```

---

## ⚡ **Performance Optimizations**

### **1. Debouncing:**
- Waits 500ms after user stops typing
- Prevents excessive API calls
- Smooth user experience

### **2. Request Limiting:**
- Maximum 5 suggestions per search
- Reduces payload size
- Faster response times

### **3. Caching:**
- Browser caches API responses
- Faster repeat searches
- Reduced API load

### **4. Abort on New Search:**
- Cancels previous request if user types again
- Prevents race conditions
- Always shows latest results

---

## 🚀 **Integration Points**

### **Currently Integrated:**
- ✅ `AnthropologicalQuestionnaire.tsx` - Stage 1, Question 4 (Location & Target Market)

### **Future Integration Opportunities:**
- Travel cost calculator (origin/destination)
- Service area selection
- Shipping address input
- Business registration location
- Client location tracking

---

## 🛠️ **Customization**

### **Change API Provider:**
```typescript
// In LocationAutocomplete.tsx, replace Nominatim with another provider:

// Option 1: LocationIQ (requires API key)
const response = await fetch(
  `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${query}&format=json`
);

// Option 2: OpenCage (requires API key)
const response = await fetch(
  `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${API_KEY}`
);

// Option 3: Mapbox (requires API key)
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${API_KEY}`
);
```

### **Change Debounce Delay:**
```typescript
// In LocationAutocomplete.tsx, line ~95
debounceTimer.current = setTimeout(() => {
  fetchSuggestions(newValue);
}, 300); // Change from 500ms to 300ms for faster results
```

### **Change Number of Suggestions:**
```typescript
// In LocationAutocomplete.tsx, line ~72
`limit=10` // Change from 5 to 10
```

---

## 🧪 **Testing**

### **Manual Testing:**
1. Open questionnaire
2. Navigate to Stage 1, Question 4
3. Click on location input
4. Type "Lond" (< 3 chars) - No dropdown
5. Type "Londo" (3+ chars) - Dropdown appears
6. See suggestions for London
7. Click a suggestion - Input filled
8. Verify coordinates stored in console

### **Keyboard Testing:**
1. Type location
2. Press ↓ to highlight first
3. Press ↓ again to highlight second
4. Press Enter to select
5. Verify selection works

### **Edge Cases:**
- Empty input - No dropdown
- No results - Shows "No locations found"
- Slow network - Shows loading spinner
- Click outside - Dropdown closes
- Type fast - Debouncing works

---

## 📈 **Analytics Tracking**

### **Recommended Events:**
```typescript
// Track location searches
analytics.track('location_searched', {
  query: searchTerm,
  results_count: suggestions.length,
});

// Track location selections
analytics.track('location_selected', {
  location: selectedLocation,
  coordinates: { lat, lon },
  source: 'autocomplete',
});
```

---

## 🔒 **Privacy & Security**

### **Data Handling:**
- ✅ No personal data sent to API
- ✅ Only search queries transmitted
- ✅ Coordinates stored locally (not sent to our backend)
- ✅ No tracking or analytics by Nominatim
- ✅ HTTPS encrypted requests

### **Rate Limiting:**
- Nominatim: 1 request/second
- Debouncing ensures compliance
- User-Agent header identifies our app

---

## 📚 **Related Documentation**

- [AnthropologicalQuestionnaire](./ANTHROPOLOGICAL_QUESTIONNAIRE_SPEC.md)
- [Travel Cost Calculator](./FALLBACK_SYSTEMS.md)
- [Complete User Flow](./COMPLETE_USER_AND_BACKEND_FLOW.md)

---

**Last Updated:** November 9, 2025

