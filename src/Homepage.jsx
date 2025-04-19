import React from "react";
import { useNavigate } from "react-router-dom"; 



const Homepage = () => {
    const navigate = useNavigate();

  const toggleView = () => {
    navigate("/dashboard");
  };
    return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Screen Time Reducer</h1>
            <p className="text-lg text-gray-600">Take control of your digital wellbeing</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={toggleView}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Dashboard
            </button>
            <a 
              href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Install Extension
            </a>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Track Your Screen Time</h2>
            <p className="text-gray-600 mb-4">
              Monitor how much time you spend on different websites and apps. Get insights into your browsing habits.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time tracking of your browsing activity
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Detailed statistics and reports
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Website-specific time tracking
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Set Healthy Limits</h2>
            <p className="text-gray-600 mb-4">
              Define daily time limits for your browsing sessions and receive gentle reminders when you approach them.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Customizable daily time limits
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Smart notifications and warnings
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pause/resume tracking as needed
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Install the Extension</h3>
              <p className="text-gray-600">Add Screen Time Reducer to your Chrome browser with just one click.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Your Limits</h3>
              <p className="text-gray-600">Define how much time you want to spend browsing each day.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Improve</h3>
              <p className="text-gray-600">Monitor your progress and develop healthier browsing habits.</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Ready to Take Control?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have improved their digital wellbeing with Screen Time Reducer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={toggleView}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Dashboard
              </button>
              <a 
                href="https://chrome.google.com/webstore/detail/screen-time-reducer/your-extension-id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Install Extension
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Homepage;    