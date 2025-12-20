import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BackButton } from '../components/BackButton';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { signup } = useAuth();
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
    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }
    if (!formData.password.trim()) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: 'USER',
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || "Erreur lors de l'inscription");
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-600">Inscrivez-vous pour commencer</p>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✓ Compte créé avec succès ! Redirection vers la page de connexion...
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              id="username"
              name="username"
              type="text"
              placeholder="Votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              error={formErrors.username}
              required
            />

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

            <Input
              label="Confirmer le mot de passe"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
            />

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full md:w-auto min-w-[150px]"
              >
                {isSubmitting ? 'Inscription...' : "S'inscrire"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

