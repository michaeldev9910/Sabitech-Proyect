import './Header.css';
import MiniMenu from './minimenu/minimenu.jsx';
import reactLogo from '../../assets/react.svg'

function Header() {
    return (
        
            <nav className="Cabecera">
            <a href={reactLogo} className="Logo">
                <img src={reactLogo} alt="React logo" />
            </a>
            
            <MiniMenu />

            </nav>
           
            )
}
export default Header;