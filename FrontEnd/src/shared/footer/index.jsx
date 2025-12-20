import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Fixer</h3>
            <p className="text-sm">
              Votre solution rapide pour tous vos appareils électroménagers.
              Expertise, rapidité et satisfaction garantie.
            </p>
          </div>
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-4">
              Liens rapides
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Catalogue
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/publications"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Publications
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; 2025 Fixer. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
