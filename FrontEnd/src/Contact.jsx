import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Textarea } from "./components/Textarea";
import { Card } from "./components/Card";
import { BackButton } from "./components/BackButton";
import { useAuth } from "./contexts/AuthContext";

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [adminId, setAdminId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    // Obtenir l'ID de l'admin pour envoyer le message
    const fetchAdminId = async () => {
      try {
        const response = await axios.get('/api/messages/admin-id');
        if (response.data) {
          setAdminId(response.data);
        }
      } catch (err) {
        // Si on ne peut pas trouver l'admin, on continue quand même
      }
    };
    fetchAdminId();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }
    if (formData.phone && !/^[0-9+\s-]+$/.test(formData.phone)) {
      errors.phone = "Le numéro de téléphone n'est pas valide";
    }
    if (!formData.comment.trim()) {
      errors.comment = "Le message est requis";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Si l'utilisateur n'est pas connecté, on ne peut pas envoyer via le système de messagerie
    if (!isAuthenticated || !user?.userId) {
      setError("Pour envoyer un message, veuillez vous connecter ou utilisez les coordonnées ci-dessous.");
      return;
    }

    if (!adminId) {
      setError("Impossible de trouver l'administrateur. Veuillez réessayer plus tard.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Créer le message avec les informations du formulaire de contact
      const messageContent = `Message de contact de ${formData.name} (${formData.email}${formData.phone ? `, Tél: ${formData.phone}` : ''})\n\n${formData.comment}`;

      await axios.post('/api/messages', {
        content: messageContent,
        senderId: user.userId,
        receiverId: adminId,
        fileUrl: null,
        fileName: null,
        fileType: null,
        latitude: null,
        longitude: null,
        locationName: null,
      });

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", comment: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.statusText || 
                          'Erreur lors de l\'envoi du message. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-700">
              Une question ? Un besoin spécifique ? N'hésitez pas à nous
              contacter !
            </p>
          </div>

          <Card>
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✓ Votre message a été envoyé avec succès ! Nous vous
                répondrons dans les plus brefs délais.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                <p className="font-semibold">ℹ️ Information</p>
                <p className="text-sm mt-1">
                  Pour envoyer un message via ce formulaire, vous devez être connecté. 
                  Sinon, vous pouvez nous contacter directement par email ou téléphone.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom"
                id="name"
                name="name"
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                required
              />

              <Input
                label="E-mail"
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
                label="Numéro de téléphone"
                id="phone"
                name="phone"
                type="tel"
                placeholder="+216 XX XXX XXX ou 0X XXX XXX"
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
              />

              <Textarea
                label="Message"
                id="comment"
                name="comment"
                placeholder="Votre message..."
                value={formData.comment}
                onChange={handleChange}
                error={formErrors.comment}
                rows={6}
              />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto min-w-[150px]"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer"}
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-600">contact@fixer.fr</p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold text-lg mb-2">Téléphone</h3>
              <p className="text-gray-600">+216 71 234 567</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
