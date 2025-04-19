import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [isSignup, setIsSignup] = useState(false);

  const toggleMode = () => setIsSignup(!isSignup);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[90%] max-w-md bg-white text-gray-800 rounded-2xl shadow-2xl p-6 relative border border-gray-200"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-center mb-4 tracking-wide">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <form className="space-y-4">
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
            >
              {isSignup ? "Sign Up" : "Log In"}
            </button>
          </form>
          <div className="text-sm text-center mt-4">
            {isSignup ? "Already have an account?" : "New to this platform?"}{" "}
            <button onClick={toggleMode} className="text-cyan-600 hover:underline">
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
}
