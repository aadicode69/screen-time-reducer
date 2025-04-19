import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Shield, BarChart3, Activity, ChevronRight } from "lucide-react";

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.add("animate-slide-up");
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const toggleView = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-600 rounded-full filter blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <header className={`flex flex-col md:flex-row justify-between items-center mb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center md:text-left mb-6 md:mb-0">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 mb-2">
                Screen Time Reducer
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
            <p className="text-lg text-gray-300 mt-2">Take control of your digital wellbeing</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={toggleView}
              className="px-6 py-3 relative overflow-hidden bg-transparent border border-indigo-500 text-white rounded-lg group transition-all duration-300"
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center">
                Open Dashboard
                <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <a
              href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 relative overflow-hidden bg-transparent border border-emerald-500 text-white rounded-lg group transition-all duration-300"
            >
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-emerald-600 to-green-600 transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center">
                Install Extension
                <ChevronRight className="ml-2 h-5
                 w-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="animate-on-scroll bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-lg p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
            onMouseEnter={() => setActiveSection('track')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-900 mr-4 transform transition-all duration-300 ${activeSection === 'track' ? 'scale-110 rotate-6' : ''}`}>
                <Clock className="h-6 w-6 text-indigo-300" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Track Your Screen Time</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Monitor how much time you spend on different websites and apps. Get insights into your browsing habits.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600">
                  <svg className="h-4 w-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Real-time tracking of your browsing activity</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600">
                  <svg className="h-4 w-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Detailed statistics and reports</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600">
                  <svg className="h-4 w-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Website-specific time tracking</span>
              </li>
            </ul>
          </div>

          <div 
            className="animate-on-scroll bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-lg p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20"
            onMouseEnter={() => setActiveSection('limits')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-purple-900 mr-4 transform transition-all duration-300 ${activeSection === 'limits' ? 'scale-110 rotate-6' : ''}`}>
                <Shield className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Set Healthy Limits</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Define daily time limits for your browsing sessions and receive gentle reminders when you approach them.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600">
                  <svg className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Customizable daily time limits</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600">
                  <svg className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Smart notifications and warnings</span>
              </li>
              <li className="flex items-start group">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600">
                  <svg className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="transition-colors duration-300 group-hover:text-white">Pause/resume tracking as needed</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="animate-on-scroll bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-xl border border-gray-700 mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom"></div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 mb-10 text-center relative z-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="text-center p-6 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mb-6 mx-auto">
                <div className="absolute inset-0 bg-indigo-600 rounded-full opacity-20 animate-ping-slow"></div>
                <div className="bg-gradient-to-br from-indigo-700 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto relative">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Install the Extension</h3>
              <p className="text-gray-300">Add Screen Time Reducer to your Chrome browser with just one click.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mb-6 mx-auto">
                <div className="absolute inset-0 bg-purple-600 rounded-full opacity-20 animate-ping-slow animation-delay-300"></div>
                <div className="bg-gradient-to-br from-purple-700 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto relative">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Set Your Limits</h3>
              <p className="text-gray-300">Define how much time you want to spend browsing each day.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mb-6 mx-auto">
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping-slow animation-delay-600"></div>
                <div className="bg-gradient-to-br from-blue-700 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto relative">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Track & Improve</h3>
              <p className="text-gray-300">Monitor your progress and develop healthier browsing habits.</p>
            </div>
          </div>
        </section>

        <section className="animate-on-scroll relative bg-gradient-to-r from-indigo-900 to-purple-900 p-10 rounded-2xl shadow-2xl text-center overflow-hidden">
          {/* Animated particle effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-block p-3 rounded-full bg-white/10 backdrop-blur-md mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <Activity className="h-10 w-10 text-indigo-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Control?</h2>
            <p className="text-gray-200 mb-8">
              Join thousands of users who have improved their digital wellbeing with Screen Time Reducer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={toggleView}
                className="group px-8 py-3 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm border border-white border-opacity-20 text-white rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Try Dashboard
                  <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <a
                href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-3 bg-white text-indigo-900 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Install Extension
                  <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5%, -5%) rotate(5deg); }
          50% { transform: translate(0, 10%) rotate(0deg); }
          75% { transform: translate(-5%, -5%) rotate(-5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5%, 5%) rotate(-5deg); }
          50% { transform: translate(0, -10%) rotate(0deg); }
          75% { transform: translate(5%, 5%) rotate(5deg); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.2; }
        }
        
        @keyframes particle-animation {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translate(100px, -100px) scale(1); opacity: 0; }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); }
          to { transform: translateY(0); }
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
        }
        
        .particle-1 {
          width: 100px;
          height: 100px;
          left: 10%;
          top: 10%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%);
          animation: particle-animation 15s ease-in-out infinite;
        }
        
        .particle-2 {
          width: 150px;
          height: 150px;
          right: 10%;
          top: 20%;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, rgba(167, 139, 250, 0) 70%);
          animation: particle-animation 12s ease-in-out infinite 2s;
        }
        
        .particle-3 {
          width: 80px;
          height: 80px;
          left: 30%;
          bottom: 20%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(79, 70, 229, 0) 70%);
          animation: particle-animation 18s ease-in-out infinite 1s;
        }
        
        .particle-4 {
          width: 120px;
          height: 120px;
          right: 25%;
          bottom: 15%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(147, 51, 234, 0) 70%);
          animation: particle-animation 20s ease-in-out infinite 3s;
        }
      `}</style>
    </div>
  );
};

export default Homepage;