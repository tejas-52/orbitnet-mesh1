import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Network, Database } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/analysis', label: 'Mission Analysis', icon: BarChart3 },
        { path: '/network', label: 'Satellite Network', icon: Network },
        { path: '/analytics', label: 'Testing Analytics', icon: Database },
    ];

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm border border-border rounded-full px-6 py-3 shadow-lg">
            <ul className="flex items-center gap-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all pointer-events-auto ${isActive
                                        ? 'bg-primary text-primary-foreground font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Navigation;
