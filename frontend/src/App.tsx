import { Route, Routes } from 'react-router-dom';
import SigninPage from './pages/signin';
import SignupPage from './pages/signup';
import HomePage from './pages/home';
import AuthLayout from './layouts/auth-layout';

export default function App() {
  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-screen">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}
