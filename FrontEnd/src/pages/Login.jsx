import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }
    if (!formData.password.trim()) {
      errors.password = 'Le mot de passe est requis';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on role
      const userRole = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).role;
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Erreur de connexion');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-600">Connectez-vous à votre compte</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">Erreur de connexion</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />

            <Input
              label="Mot de passe"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto min-w-[150px]"
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link
                to="/signup"
                className="text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

