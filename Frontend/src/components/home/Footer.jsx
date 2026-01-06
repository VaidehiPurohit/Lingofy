import React from 'react'
import Logo from '../../assets/Logo.svg';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 text-gray-800/70">
      <div
        id="cta"
        className="
          max-w-5xl
          mx-auto
          flex
          flex-col
          items-center
          py-10
          px-6
          text-sm
        "
      >
        {/* Logo */}
        <img
          src={Logo}
          alt="Lingofy logo"
          className="h-10 w-auto"
        />

        {/* Copyright */}
        <p className="mt-4 text-center">
          Copyright © 2025{" "}
          <a
            href="#"
            className="hover:text-black transition"
          >
            Lingofy
          </a>
          . All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 mt-6">
          <a
            href="#"
            className="font-medium text-gray-800 hover:text-black transition"
          >
            Brand Guidelines
          </a>

          <span className="h-4 w-px bg-black/20" />

          <a
            href="#"
            className="font-medium text-gray-800 hover:text-black transition"
          >
            Trademark Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
