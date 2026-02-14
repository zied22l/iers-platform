# Frontend Architecture (React)

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── modules/
│   │   ├── users/
│   │   ├── employees/
│   │   ├── skills/
│   │   ├── activities/
│   │   ├── scoring/
│   │   ├── optimization/
│   │   ├── ai-recommendations/
│   │   ├── evaluations/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── audit/
│   │   └── search/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── DataTable/
│   │   │   ├── Forms/
│   │   │   ├── Charts/
│   │   │   └── UI/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── types/
│   │   └── services/
│   ├── store/
│   │   ├── index.ts
│   │   └── rootReducer.ts
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── theme.ts
│   └── config/
│       ├── api.config.ts
│       └── app.config.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Module Structure (Example: Employees)

```
modules/employees/
├── components/
│   ├── EmployeeForm.tsx
│   ├── EmployeeList.tsx
│   ├── EmployeeCard.tsx
│   ├── EmployeeHistory.tsx
│   └── index.ts
├── pages/
│   ├── EmployeesPage.tsx
│   ├── EmployeeDetailPage.tsx
│   ├── CreateEmployeePage.tsx
│   └── index.ts
├── store/
│   └── employeeSlice.ts
├── hooks/
│   ├── useEmployees.ts
│   └── useEmployeeHistory.ts
├── services/
│   └── employeeService.ts
├── types/
│   └── employee.types.ts
└── index.ts
```

## State Management (Redux Toolkit)

### Store Configuration
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/modules/users/store/authSlice';
import employeeReducer from '@/modules/employees/store/employeeSlice';
// ... other reducers

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slice Example
```typescript
// modules/employees/store/employeeSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../services/employeeService';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (filters: EmployeeFilters) => {
    const response = await employeeService.getAll(filters);
    return response.data;
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
```

## Routing

```typescript
// routes/routes.config.ts
export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  
  // Employees
  employees: '/employees',
  employeeDetail: '/employees/:id',
  createEmployee: '/employees/new',
  
  // Activities
  activities: '/activities',
  activityDetail: '/activities/:id',
  createActivity: '/activities/new',
  
  // Analytics
  dashboard: '/dashboard',
  analytics: '/analytics',
  
  // Profile
  profile: '/profile',
  settings: '/settings',
};
```

```typescript
// routes/index.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          {/* ... other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

## Shared Components

### Layout Components
- `MainLayout.tsx` - Main application layout
- `Sidebar.tsx` - Navigation sidebar
- `Header.tsx` - Top header with user menu
- `Footer.tsx` - Footer component

### Data Display
- `DataTable.tsx` - Reusable data table with sorting, filtering
- `Card.tsx` - Card container
- `Badge.tsx` - Status badges
- `Avatar.tsx` - User avatar

### Forms
- `Input.tsx` - Text input
- `Select.tsx` - Dropdown select
- `DatePicker.tsx` - Date picker
- `FileUpload.tsx` - File upload
- `FormField.tsx` - Form field wrapper

### Charts
- `LineChart.tsx` - Line chart wrapper
- `BarChart.tsx` - Bar chart wrapper
- `PieChart.tsx` - Pie chart wrapper
- `Heatmap.tsx` - Heatmap visualization

## Custom Hooks

```typescript
// shared/hooks/useApi.ts
export const useApi = <T,>(apiFunc: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    try {
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

## API Service Layer

```typescript
// shared/services/api.service.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Styling

### Theme Configuration (Material-UI)
```typescript
// styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});
```

## Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_ENV=development
```

## Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## Testing

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { EmployeeCard } from './EmployeeCard';

describe('EmployeeCard', () => {
  it('renders employee information', () => {
    const employee = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      jobPosition: 'Developer',
    };
    
    render(<EmployeeCard employee={employee} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });
});
```
