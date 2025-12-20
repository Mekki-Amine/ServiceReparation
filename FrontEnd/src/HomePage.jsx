import React, { useState } from "react";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Textarea } from "./components/Textarea";
import { Card } from "./components/Card";
import { Chatbot } from "./components/Chatbot";

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Le numéro de téléphone est requis";
    } else if (!/^[0-9+\s-]+$/.test(formData.phone)) {
      errors.phone = "Le numéro de téléphone n'est pas valide";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", comment: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-yellow-50 to-yellow-100 min-h-screen">
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Bienvenue chez Fixer
          </h1>
          <p className="text-lg text-gray-800">
            Votre solution rapide pour tous vos appareils
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section id="home" className="my-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Votre solution rapide pour tous vos appareils
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Expertise professionnelle, service rapide et satisfaction garantie
              pour tous vos besoins en réparation d'électroménagers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card hover className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Réparation d'électroménagers
              </h3>
              <p className="text-gray-600">
                Nous sommes spécialisés dans la réparation de tous types
                d'appareils électroménagers avec une expertise éprouvée et des
                pièces de qualité.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Installation et maintenance
              </h3>
              <p className="text-gray-600">
                Nous assurons l'installation et la maintenance de vos appareils
                électroménagers pour garantir leur performance optimale.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="text-4xl mb-4">🔩</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pièces de rechange
              </h3>
              <p className="text-gray-600">
                Nous fournissons des pièces de rechange d'origine pour vos
                appareils électroménagers, garantissant compatibilité et
                durabilité.
              </p>
            </Card>

            <Card 
              hover 
              className="text-center cursor-pointer"
              onClick={() => setIsChatbotOpen(true)}
            >
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Service clientèle
              </h3>
              <p className="text-gray-600">
                Notre engagement envers nos clients est notre priorité. Service
                réactif et professionnel à votre écoute.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conseils d'entretien
              </h3>
              <p className="text-gray-600">
                Profitez de nos conseils d'entretien pour optimiser la durée de
                vie de vos appareils et éviter les pannes.
              </p>
            </Card>
          </div>
        </section>
        <section id="about" className="my-12">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Pourquoi nous choisir ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Expertise éprouvée",
                "Service rapide",
                "Transparence et confiance",
                "Satisfaction garantie",
                "Disponibilité locale",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white bg-opacity-90 p-4 rounded-lg"
                >
                  <span className="text-yellow-500 text-xl">✓</span>
                  <span className="font-semibold text-gray-900">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
        <section id="quote" className="my-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Demandez un devis gratuit
              </h3>
              {submitSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  ✓ Votre demande a été envoyée avec succès ! Nous vous
                  contacterons bientôt.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nom"
                  id="name"
                  name="name"
                  type="text"
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
                  required
                />
                <Textarea
                  label="Commentaire"
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  error={formErrors.comment}
                  rows={5}
                />
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer"}
                  </Button>
                </div>
              </form>
              <p className="mt-6 text-sm text-gray-600 text-center">
                Le prix de nos devis comprend une prestation de 1 heure de
                réparation. Devis gratuit et sans engagement.
              </p>
            </Card>
          </div>
        </section>
        <section id="reviews" className="my-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Avis clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover>
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-xl">⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-3 italic">
                "Très professionnel, diagnostic rapide et réparation au top.
                Merci !"
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                - Myrepartout
              </p>
            </Card>
            <Card hover>
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-xl">⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-3 italic">
                "Service rapide et efficace ! Mon mixeur est comme neuf. Je
                recommande vivement !"
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                - Myrepartout
              </p>
            </Card>
            <Card hover>
              <div className="flex items-center mb-3">
                <div className="text-yellow-400 text-xl">⭐⭐⭐⭐</div>
              </div>
              <p className="text-gray-700 mb-3 italic">
                "Intervention rapide et sans surprise. Mon robot culinaire est
                sauvé !"
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                - Myrepartout
              </p>
            </Card>
          </div>
        </section>
      </main>
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default HomePage;
