/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import BotMarketplace from './pages/BotMarketplace';
import Changelog from './pages/Changelog';
import Developers from './pages/Developers';
import Elite from './pages/Elite';
import FAQ from './pages/FAQ';
import Invite from './pages/Invite';
import Kairo from './pages/Kairo';
import Pricing from './pages/Pricing';
import Spaces from './pages/Spaces';
import Status from './pages/Status';
import Support from './pages/Support';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "BotMarketplace": BotMarketplace,
    "Changelog": Changelog,
    "Developers": Developers,
    "Elite": Elite,
    "FAQ": FAQ,
    "Invite": Invite,
    "Kairo": Kairo,
    "Pricing": Pricing,
    "Spaces": Spaces,
    "Status": Status,
    "Support": Support,
}

export const pagesConfig = {
    mainPage: "Kairo",
    Pages: PAGES,
    Layout: __Layout,
};