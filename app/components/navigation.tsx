import { useState } from "react";
import { MoveUpRight } from "lucide-react";
import { NavLink } from "react-router";
import { useI18n, type Locale } from "~/i18n";

const navItems = [
    { href: "/", labelKey: "nav.home", end: true },
    { href: "/services", labelKey: "nav.services" },
    { href: "/work", labelKey: "nav.work" },
    { href: "/process", labelKey: "nav.process" },
    { href: "/contact", labelKey: "nav.contact" },
];

function navLinkClassName(isActive: boolean, baseClassName = "") {
    return [baseClassName, isActive ? "active" : ""].filter(Boolean).join(" ");
}

export function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { locale, setLocale, t } = useI18n();

    function changeLanguage(nextLanguage: Locale) {
        setLocale(nextLanguage);
    }

    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    function renderLanguageToggle() {
        return (
            <div className="language-toggle" aria-label={t("common.language")}>
                <button
                    aria-pressed={locale === "en"}
                    className={locale === "en" ? "active" : ""}
                    type="button"
                    onClick={() => changeLanguage("en")}
                >
                    EN
                </button>
                <button
                    aria-pressed={locale === "sv"}
                    className={locale === "sv" ? "active" : ""}
                    type="button"
                    onClick={() => changeLanguage("sv")}
                >
                    SV
                </button>
            </div>
        );
    }

    return(
        <>
        <nav className="navbar relative w-full bg-white text-gray-700 shadow-[0px_4px_25px_0px_#0000000D] transition-all">
        <div className="navbar-inner max-w-7xl mx-auto px-4 sm:px-6  flex h-full items-center justify-between">
        
    <a href="/" className="flex items-center gap-3 text-indigo-600" aria-label={t("common.kwstudioHome")}>
        <svg width="" height="35" viewBox="0 0 1579 992" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M402 37.1715C408.4 9.97148 374 5.17148 356 6.17148H153.5C126.7 4.17148 120.333 19.0048 120.5 26.6715V119.171L215 122.171C285 119.371 338.167 126.338 356 130.171V149.171C356 151.571 336.667 156.505 327 158.671C300.6 155.871 185.333 162.171 131 165.671C122.2 165.671 120.333 174.338 120.5 178.671V243.671C118.9 256.071 131.167 261.505 137.5 262.671H153.5L402 265.671V37.1715Z" fill="#2E75BD"/>
<path d="M47.5 309.671H42.5C21.7893 309.671 5 326.461 5 347.171C5 367.882 21.7893 384.671 42.5 384.671H47.5C68.2107 384.671 85 367.882 85 347.171C85 326.461 68.2107 309.671 47.5 309.671Z" fill="#2E75BD"/>
<path d="M178.5 458.671H173.5C152.789 458.671 136 475.461 136 496.171C136 516.882 152.789 533.671 173.5 533.671H178.5C199.211 533.671 216 516.882 216 496.171C216 475.461 199.211 458.671 178.5 458.671Z" fill="#2E75BD"/>
<path d="M1079.5 309.671H1074.5C1053.79 309.671 1037 326.461 1037 347.171C1037 367.882 1053.79 384.671 1074.5 384.671H1079.5C1100.21 384.671 1117 367.882 1117 347.171C1117 326.461 1100.21 309.671 1079.5 309.671Z" fill="#2E75BD"/>
<path d="M42.5 716.671H37.5C16.7893 716.671 0 733.461 0 754.171C0 774.882 16.7893 791.671 37.5 791.671H42.5C63.2107 791.671 80 774.882 80 754.171C80 733.461 63.2107 716.671 42.5 716.671Z" fill="#2E75BD"/>
<path d="M1045 46.1715C1083.4 12.1715 1038.33 5.00481 1011 5.67148L793.5 1.17148C761.1 -4.02852 738.333 9.33814 731 16.6715C726.2 17.0715 708.333 39.8381 700 51.1715L507 250.171C499 255.172 499 262.171 500.5 264.171C501.7 265.771 547 266.838 569.5 267.171C592.3 264.771 598.333 270.838 598.5 274.171C616.1 286.971 649.167 331.171 663.5 351.671C675.1 364.871 668.333 374.171 663.5 377.171C655.1 383.571 642 374.505 636.5 369.171C628.9 361.571 600 328.005 586.5 312.171C584.5 302.971 569.333 301.005 562 301.171C500.4 304.371 245.333 305.505 125.5 305.671V383.671C121.5 402.871 138.5 405.338 147.5 404.171L323 407.171C383 403.171 460.333 408.838 491.5 412.171V439.171C460.7 441.571 334 444.505 274.5 445.671V541.172C276.9 545.572 421.5 545.672 493.5 545.172C492.3 547.971 545.667 606.338 572.5 635.172C580.9 641.971 579.333 653.005 577.5 657.672L570 671.172C557.2 669.971 514.667 622.672 495 599.172C485.4 577.971 462.667 576.672 452.5 578.672L53.5 586.172C40.7 583.372 33.1667 593.672 31 599.172V634.672C29.4 658.271 48 663.838 57.5 663.672L218.5 670.172C254.9 669.771 269.333 679.672 272 684.672C280.8 706.271 277.667 754.672 275 776.172C277.4 788.572 271 807.338 267.5 815.172C262.3 818.771 241.333 824.338 231.5 826.672C220.3 826.271 152.167 831.505 119.5 834.172V959.172C117.9 979.971 144.833 988.838 158.5 990.672H348C362 991.872 381.167 986.172 389 983.172C397 980.372 400.667 966.005 401.5 959.172L408.5 705.172C408.5 673.971 433.167 692.172 445.5 705.172L684 976.672C700 989.471 724.333 990.005 734.5 988.672C765.7 993.471 892.167 990.672 951.5 988.672C988.7 985.072 982.667 958.505 975 945.672L636.5 548.672C614.1 527.072 607.167 506.338 606.5 498.671L1045 46.1715Z" fill="#2E75BD"/>
<path d="M142.5 705.172C187.7 703.172 227.667 708.005 242 710.672V788.172H119.5V710.672C119.5 708.672 134.833 706.172 142.5 705.172Z" fill="#2E75BD"/>
<path d="M1285 46.1715C1290.6 9.77148 1315 4.00481 1326.5 5.67148L1560.5 2.67148C1572 2.17148 1574 22.1715 1577 22.6715C1579.4 23.0715 1578 38.5048 1577 46.1715L1514.5 239.171C1510.9 258.771 1501 261.005 1496.5 259.671C1334.1 266.071 1249.17 262.338 1227 259.671V250.171C1227.8 220.572 1266 101.838 1285 46.1715Z" fill="#2E75BD"/>
<path d="M1168 398.671C1164.4 387.071 1166.5 333.505 1168 308.171C1211.6 298.571 1386.83 301.505 1469 304.171C1489 305.771 1491.33 317.838 1490 323.671L1462 403.671H1202C1184.4 405.271 1172 401.005 1168 398.671Z" fill="#2E75BD"/>
<path d="M1176.5 443.171H1236.5C1247.7 440.771 1367.17 445.505 1425.5 448.171C1448.7 444.971 1448.5 457.171 1445.5 463.671L1284 959.172C1277.2 983.572 1247.17 989.005 1233 988.672H1138C1106.4 988.672 1094.5 969.005 1092.5 959.172L899.5 638.172C890.7 640.572 862.5 667.172 849.5 680.172C830.7 698.172 806.333 684.338 796.5 675.172L663.5 512.172L678.5 489.671L754 412.171L878 289.171C893.6 271.971 906.167 275.338 910.5 279.171C932.1 284.771 966.833 343.505 981.5 372.171L1123.5 597.672H1132.5C1136.5 584.072 1148.5 581.672 1154 582.172L1319 579.172C1342.6 581.972 1363.83 575.672 1371.5 572.172C1387.9 564.972 1386.33 525.505 1383.5 506.671C1380.7 490.671 1364 491.671 1356 494.171C1352.8 494.171 1351.33 515.838 1351 526.672C1349.4 541.872 1329 545.672 1319 545.672C1313.4 548.072 1289 546.672 1277.5 545.672H1168C1142.8 548.872 1138.17 534.338 1139 526.672C1138.6 514.672 1148.83 482.672 1154 468.171C1160 445.771 1171.5 442.171 1176.5 443.171Z" fill="#2E75BD"/>
</svg>
        <span className="text-lg font-extrabold text-gray-950">KWStudio</span>

    </a>

    <ul className="navbar-links md:flex hidden items-center gap-10">
        {navItems.map((item) => (
            <li key={item.href}>
                <NavLink
                    className={({ isActive }) => navLinkClassName(isActive, "hover:text-gray-500/80 transition")}
                    end={item.end}
                    to={item.href}
                >
                    {t(item.labelKey)}
                </NavLink>
            </li>
        ))}
    </ul>

    <div className="navbar-actions">
        {renderLanguageToggle()}
        <a href="/start-a-project" className="btn btn-primary navbar-cta">
            {t("nav.startProject")} <MoveUpRight size={20} />
        </a>
    </div>

    <button
        aria-controls="mobile-menu"
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle menu"
        type="button"
        className="menu-btn inline-block md:hidden active:scale-90 transition"
        onClick={() => setIsMobileMenuOpen((current) => !current)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="#000">
            <path d="M 3 7 A 1.0001 1.0001 0 1 0 3 9 L 27 9 A 1.0001 1.0001 0 1 0 27 7 L 3 7 z M 3 14 A 1.0001 1.0001 0 1 0 3 16 L 27 16 A 1.0001 1.0001 0 1 0 27 14 L 3 14 z M 3 21 A 1.0001 1.0001 0 1 0 3 23 L 27 23 A 1.0001 1.0001 0 1 0 27 21 L 3 21 z"></path>
        </svg>
    </button>
    </div>

    <div
        id="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
        className={`mobile-menu absolute top-full left-0 w-full bg-white md:hidden ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ul className="flex flex-col space-y-4 text-lg">
            {navItems.map((item) => (
                <li key={item.href}>
                    <NavLink
                        className={({ isActive }) => navLinkClassName(isActive, "text-sm")}
                        end={item.end}
                        onClick={closeMobileMenu}
                        to={item.href}
                    >
                        {t(item.labelKey)}
                    </NavLink>
                </li>
            ))}
        </ul>

        {renderLanguageToggle()}

        <NavLink className="btn btn-primary mobile-menu-cta" onClick={closeMobileMenu} to="/start-a-project">
            {t("nav.startProject")} <MoveUpRight size={20} />
        </NavLink>
        </div>
    </div>
</nav>
</>
    );
}
